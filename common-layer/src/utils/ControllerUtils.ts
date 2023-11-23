import { parse as QSParse } from 'qs';
import {
  ENABLE_LOG,
  IS_TEST
} from 'common-layer/constants';

export interface Params {
  headers: Record<string, any>;
  path: string;
  query: Record<string, any>;
  payload: Record<string, any>;
}

export interface Response {
  statusCode: number;
  body: Record<any, any> | string;
}

function buildParams(event: AWSLambda.APIGatewayEvent): Params {
  const parseQueryParams = (query: Record<string, any>) =>
    QSParse(
      Object.keys(query ?? {})
        .reduce((result, key) => {
          const val = _.castArray(query[key]).map((v) => {
            if (_.isString(v) && /^{.*}$/.test(v)) {
              try {
                return JSON.parse(v);
              } catch (e) {
                /* no-op */
              }
            }
            return v;
          });
          if (!key.endsWith('[]') && !_.isEmpty(val) && val.length === 1) {
            result[key] = val.pop();
          } else {
            result[key] = val;
          }

          return result;
        }, {} as Record<string, any>)
    );

  return {
    headers: Object.keys(event.headers ?? {}).reduce((result, key) => {
      result[key.toLocaleLowerCase()] = event.headers[key];
      return result;
    }, {} as Record<string, any>),
    path: `${event.httpMethod} ${event.path}`,
    query: event.multiValueQueryStringParameters
      ? parseQueryParams(event.multiValueQueryStringParameters)
      : parseQueryParams(event.queryStringParameters),
    payload: event.body ? JSON.parse(event.body) : {}
  };
}

export async function handler<T = any>(
  event: AWSLambda.APIGatewayEvent,
  context: AWSLambda.Context,
  execute: (params: Params) => Promise<T> | T | any
) {
  context.callbackWaitsForEmptyEventLoop = false;

  const params = buildParams(event);
  let response: Response = { statusCode: 200, body: {} };
  try {
    const executeResult = await Promise.resolve(execute(params));
    if (executeResult?.statusCode) {
      response.statusCode = executeResult.statusCode;
      response.body = executeResult.body;
    } else {
      response.body = executeResult;
    }
  } catch (e) {
    response = {
      statusCode: 500,
      body: { message: e.message }
    };
  }

  if (!IS_TEST && ENABLE_LOG) {
    console.log(JSON.stringify({
      params,
      response
    }));
  }

  if (response.body && !_.isPrimitive(response.body)) {
    response.body = JSON.stringify(response.body);
  }

  return response;
}
