import * as Chai from 'chai';
import DayJS from 'dayjs';
import { ENABLE_LOG } from 'common-layer/constants';
import { AccessToken } from 'common-layer/models';
import { getTest } from 'src/index';

describe('index', () => {
  async function call<T = any>(
    fn: (event: AWSLambda.APIGatewayEvent, context: AWSLambda.Context) => Promise<any>,
    params: {
      headers?: Record<string, any>;
      path?: string;
      query?: Record<string, any>;
      body?: Record<string, any>;
    } = {}
  ) {
    const res = await Promise.resolve(fn(
      {
        headers: params.headers,
        path: params.path,
        queryStringParameters: params.query,
        body: params.body ? JSON.stringify(params.body) : null
      } as AWSLambda.APIGatewayEvent,
      {} as AWSLambda.Context
    ));
    if (res.body && _.isString(res.body)) {
      res.body = JSON.parse(res.body);
    }
    return res as T;
  }

  it('should respond 200 OK with access token', async () => {
    const accessToken = new AccessToken({ userId: 'uuid' });
    const dayjs = DayJS().toISOString();
    const res = await call(
      getTest,
      {
        body: {
          token: accessToken.token,
          dayjs
        }
      }
    );
    Chai.expect(res).to.be.exist;
    Chai.expect(res.statusCode).to.be.eqls(200);
    Chai.expect(res.body).to.be.eqls({
      NODE_ENV: 'test',
      DB_URI: 'api-env',
      ENABLE_LOG: ENABLE_LOG,
      isPrimitive: true,
      dayjs,
      accessToken: {
        token: accessToken.token,
        isVerified: true,
        payload: { userId: 'uuid' }
      }
    });
  })
});
