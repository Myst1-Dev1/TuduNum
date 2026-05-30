import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { WeatherAlertsService } from './weather-alerts.service';

@Injectable()
export class WeatherAlertsScheduler {
  private readonly logger = new Logger(WeatherAlertsScheduler.name);

  constructor(
    private readonly weatherAlertsService: WeatherAlertsService,
  ) {}

  @Cron('*/15 * * * *')
  async handleWeatherAlerts(): Promise<void> {
    this.logger.log('Iniciando verificação de alertas climáticos...');
    const count = await this.weatherAlertsService.processAlerts();
    if (count > 0) {
      this.logger.log(`${count} alerta(s) climático(s) disparado(s)`);
    }
  }
}
