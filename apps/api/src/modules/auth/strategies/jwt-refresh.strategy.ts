import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthenticatedRefresh } from '../types/authenticated-user.type';

interface JwtRefreshPayload {
  sub: string;
  jti: string;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtRefreshPayload): AuthenticatedRefresh {
    const refreshToken = (req.body as { refreshToken?: string })?.refreshToken;

    return {
      userId: payload.sub,
      jti: payload.jti,
      refreshToken: refreshToken ?? '',
    };
  }
}
