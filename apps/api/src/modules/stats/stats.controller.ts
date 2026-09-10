import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import type { ProfileStats, StreakCalendarMonth } from '@lumis/shared-types';
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

  @Get('streak-calendar')
  getStreakCalendar(
    @CurrentUser() user: AuthenticatedUser,
    @Query('year') yearParam?: string,
    @Query('month') monthParam?: string,
  ): Promise<StreakCalendarMonth> {
    const now = new Date();
    const year = yearParam !== undefined ? Number(yearParam) : now.getUTCFullYear();
    const month = monthParam !== undefined ? Number(monthParam) : now.getUTCMonth() + 1;

    if (!Number.isInteger(year) || year < 1970 || year > 9999) {
      throw new BadRequestException('Año inválido.');
    }
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw new BadRequestException('Mes inválido (1-12).');
    }

    return this.statsService.getStreakCalendarMonth(user.userId, year, month);
  }
}
