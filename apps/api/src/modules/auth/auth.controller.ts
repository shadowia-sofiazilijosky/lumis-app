import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService, TokenPair } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import type {
  AuthenticatedRefresh,
  AuthenticatedUser,
} from './types/authenticated-user.type';
import { PublicUser, UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('register')
  register(@Body() dto: RegisterDto): Promise<TokenPair> {
    return this.authService.register(dto);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: LoginDto): Promise<TokenPair> {
    return this.authService.login(dto);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@CurrentUser() user: AuthenticatedRefresh): Promise<TokenPair> {
    return this.authService.refresh(user.userId, user.jti, user.refreshToken);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(@CurrentUser() user: AuthenticatedRefresh): Promise<void> {
    await this.authService.logout(user.jti);
  }

  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser): Promise<PublicUser> {
    const fullUser = await this.usersService.findById(user.userId);
    if (!fullUser) {
      throw new UnauthorizedException();
    }
    return await this.usersService.toPublic(fullUser);
  }
}
