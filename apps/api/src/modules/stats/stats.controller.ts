import { Controller, Get } from '@nestjs/common';
import type { ProfileStats } from '@lumis/shared-types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('profile')
  getProfileStats(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProfileStats> {
    return this.statsService.getProfileStats(user.userId);
  }
}
