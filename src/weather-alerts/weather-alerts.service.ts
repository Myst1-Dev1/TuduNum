import { Injectable, Logger } from '@nestjs/common';
import { RemindersService } from '../reminders/reminders.service';
import { WeatherService } from '../weather/weather.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/enums/notification-type.enum';
import { WeatherRule } from './rules/weather-rule.interface';
import { RainAlertRule } from './rules/rain-alert.rule';
import { ExtremeHeatRule } from './rules/extreme-heat.rule';
import { StrongWindRule } from './rules/strong-wind.rule';

@Injectable()
export class WeatherAlertsService {
  private readonly logger = new Logger(WeatherAlertsService.name);
  private readonly rules: WeatherRule[];

  constructor(
    private readonly remindersService: RemindersService,
    private readonly weatherService: WeatherService,
    private readonly notificationsService: NotificationsService,
    rainRule: RainAlertRule,
    heatRule: ExtremeHeatRule,
    windRule: StrongWindRule,
  ) {
    this.rules = [rainRule, heatRule, windRule];
  }

  async processAlerts(): Promise<number> {
    const reminders = await this.remindersService.findPendingWeatherAlerts(6);

    if (reminders.length === 0) {
      return 0;
    }

    this.logger.log(`Verificando clima para ${reminders.length} lembrete(s)`);
    let alertCount = 0;

    for (const reminder of reminders) {
      if (!reminder.city) {
        continue;
      }

      try {
        const weather = await this.weatherService.findByCity(reminder.city);

        for (const rule of this.rules) {
          const result = rule.evaluate(weather, reminder);

          if (result.shouldNotify) {
            await this.notificationsService.create(reminder.userId, {
              type: NotificationType.WEATHER,
              title: result.title,
              message: result.message,
              reminderId: reminder.id,
            });

            alertCount++;
          }
        }

        await this.remindersService.markWeatherAlertSent(reminder.id);
      } catch (error) {
        this.logger.warn(
          `Erro ao processar alerta climático para lembrete ${reminder.id}: ${(error as Error).message}`,
        );
        await this.remindersService.markWeatherAlertSent(reminder.id);
      }
    }

    this.logger.log(`${alertCount} alerta(s) climático(s) gerados`);
    return alertCount;
  }
}
