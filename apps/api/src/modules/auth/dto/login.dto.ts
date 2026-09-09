import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  // Not used by the API itself -- cookie persistence is a frontend-only
  // concern (see apps/web's setAuthCookies) -- but the global
  // ValidationPipe's forbidNonWhitelisted rejects any field the DTO
  // doesn't declare, so this just needs to be allowed through.
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
