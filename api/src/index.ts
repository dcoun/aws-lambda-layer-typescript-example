import 'common-layer/global';
import DayJS from 'dayjs';
import {
  DB_URI,
  ENABLE_LOG,
  NODE_ENV
} from 'common-layer/constants';
import { AccessToken } from 'common-layer/models';
import { ControllerUtils } from 'common-layer/utils';

export const getTest = (
  event: AWSLambda.APIGatewayEvent,
  context: AWSLambda.Context
) => ControllerUtils.handler(
  event,
  context,
  async (params) => {
    const token: AccessToken = new AccessToken(params.payload.token ?? '');
    const dayjs = params.payload.dayjs
      ? DayJS(params.payload.dayjs)
      : DayJS();
    const body = {
      NODE_ENV,
      DB_URI,
      ENABLE_LOG,
      isPrimitive: _.isPrimitive(false),
      dayjs: dayjs.toISOString(),
      accessToken: {
        token: token.token,
        isVerified: token.isVerified,
        payload: token.getPlainPayload()
      }
    };

    return body;
  }
);
