import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RemindersModule } from '../reminders/reminders.module';
import { WeatherModule } from '../weather/weather.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { WeatherAlertsService } from './weather-alerts.service';
import { WeatherAlertsScheduler } from './weather-alerts.scheduler';
import { RainAlertRule } from './rules/rain-alert.rule';
import { ExtremeHeatRule } from './rules/extreme-heat.rule';
import { StrongWindRule } from './rules/strong-wind.rule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    RemindersModule,
    WeatherModule,
    NotificationsModule,
  ],
  providers: [
    WeatherAlertsService,
    WeatherAlertsScheduler,
    RainAlertRule,
    ExtremeHeatRule,
    StrongWindRule,
  ],
})
export class WeatherAlertsModule {}
