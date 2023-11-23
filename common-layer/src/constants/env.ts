export const NODE_ENV: 'test' | 'local' | 'dev' | 'prd' = process.env['NODE_ENV'] as any ?? process.env['STAGE'] as any;
export const IS_PRODUCTION: boolean = NODE_ENV === 'prd';
export const IS_DEVELOPMENT: boolean = NODE_ENV === 'dev';
export const IS_LOCAL_DEVELOPMENT: boolean = NODE_ENV === 'local';
export const IS_TEST: boolean = NODE_ENV === 'test';

export const PACKAGE_NAME: string = process.env['PACKAGE_NAME'] as string;
export const PACKAGE_VERSION: string = process.env['PACKAGE_VERSION'] as string;

export const DB_URI: string = process.env['DB_URI'] as string;
export const DB_READ_URI: string[] = parseArray(process.env['DB_READ_URI']) as string[];

export const ENABLE_LOG: boolean = parseBoolean(process.env['ENABLE_LOG']);

function parseBoolean(val: any): boolean {
  if (typeof val === 'string' || val instanceof String) {
    return /^(true|1)$/i.test(val as string);
  } else if (typeof val === 'boolean' || val instanceof Boolean) {
    return val as boolean;
  } else if (typeof val === 'number' || val instanceof Number) {
    return !!val;
  }
  return false;
}

function parseArray(val: any): string[] {
  if (val && typeof val === 'string' || val instanceof String) {
    return val.split(',');
  }
  return val;
}
