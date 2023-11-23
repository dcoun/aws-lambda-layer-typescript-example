import * as JWT from 'jsonwebtoken';

export namespace AccessToken {
  interface JwtPayload extends JWT.JwtPayload {
    /** JWT Claims: https://datatracker.ietf.org/doc/html/rfc7519#section-4.1 */
    /** Issuer */
    iss?: string | undefined;
    /** Subject */
    sub?: string | undefined;
    /** Audience */
    aud?: string | string[] | undefined;
    /** Expiration Time */
    exp?: number | undefined;
    /** Not Before */
    nbf?: number | undefined;
    /** Issued At */
    iat?: number | undefined;
    /** JWT ID */
    jti?: string | undefined;
  }

  export interface Payload extends JwtPayload {
    userId?: string;
    customerId?: string;
  }
}

export class AccessToken {
  payload: AccessToken.Payload;
  token: string;
  refreshToken?: string;
  isVerified: boolean;
  isExpired: boolean;
  verifyError?: Error;

  constructor(token: string);
  constructor(payload: AccessToken.Payload);
  constructor(args: any) {
    if (_.isString(args)) {
      if (args.length <= 256) {
        this.verify(args);
      } else {
        this.refresh(args);
      }
    } else if (_.isPlainObject(args)) {
      this.sign(args);
    } else {
      throw Error('invalid args');
    }
  }

  getPlainPayload() {
    return _.pick(
      this.payload ?? {},
      [
        'userId',
        'customerId'
      ]
    );
  }

  private setAccessToken(options?: JWT.SignOptions) {
    this.token = JWT.sign(
      this.getPlainPayload(),
      AccessToken.AccessTokenKey,
      {
        ...AccessToken.AccessTokenOptions,
        ...options
      }
    );
  }

  private setRefreshToken(options?: JWT.SignOptions) {
    this.refreshToken = JWT.sign(
      this.getPlainPayload(),
      AccessToken.RefreshTokenKey,
      {
        ...AccessToken.RefreshTokenOptions,
        ...options
      }
    );
  }

  private sign(payload: AccessToken.Payload, options?: JWT.SignOptions): AccessToken {
    this.payload = payload;
    this.setAccessToken(options);
    this.setRefreshToken(options);
    this.isVerified = true;

    return this;
  }

  private verify(token: string, options?: JWT.DecodeOptions): AccessToken {
    this.token = token;
    try {
      this.payload = JWT.verify(
        token,
        AccessToken.AccessTokenKey,
        {
          ...AccessToken.AccessTokenOptions,
          ...options
        }
      ) as AccessToken.Payload;
      this.isVerified = true;
    } catch (error) {
      this.isVerified = false;
      this.payload = null;
      this.verifyError = error;
      this.isExpired = error.name === 'TokenExpiredError';
    }

    return this;
  }

  private refresh(token: string, options?: JWT.DecodeOptions): AccessToken {
    this.refreshToken = token;
    try {
      this.payload = JWT.verify(
        token,
        AccessToken.RefreshTokenKey,
        {
          ...AccessToken.RefreshTokenOptions,
          ...options
        }
      ) as AccessToken.Payload;
      this.isVerified = true;

      this.setAccessToken();
    } catch (error) {
      this.isVerified = false;
      this.payload = null;
      this.verifyError = error;
      this.isExpired = error.name === 'TokenExpiredError';
    }

    return this;
  }

  private static AccessTokenKey = 'test-secret-private-key-2023-access-token';
  private static AccessTokenOptions: JWT.SignOptions & JWT.DecodeOptions & JWT.VerifyOptions = {
    jwtid: '00001',
    algorithm: 'HS256',
    expiresIn: '2h',
    issuer: 'test-user'
  };
  private static RefreshTokenKey = 'test-secret-private-key-2023-refresh-token';
  private static RefreshTokenOptions: JWT.SignOptions & JWT.DecodeOptions & JWT.VerifyOptions = {
    jwtid: '00001',
    algorithm: 'HS512',
    expiresIn: '30d',
    issuer: 'test-user'
  };
}
