// mixin first
import 'common-layer/utils/lodash';

import Lodash from 'lodash';
import {
  IS_LOCAL_DEVELOPMENT,
  IS_TEST
} from 'common-layer/constants';

(global as any)._ = Lodash;

if (IS_LOCAL_DEVELOPMENT || IS_TEST) {
  require('source-map-support/register');
}

declare global {
  export const _: typeof Lodash;
}
