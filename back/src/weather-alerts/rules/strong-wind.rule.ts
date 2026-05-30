import { Injectable } from '@nestjs/common';
import { Reminder } from '../../reminders/entities/reminder.entity';
import { WeatherResponseDto } from '../../weather/dto/weather-response.dto';
import { WeatherAlertResult, WeatherRule } from './weather-rule.interface';

@Injectable()
export class StrongWindRule implements WeatherRule {
  private readonly maxWindSpeed = 40;

  evaluate(
    weather: WeatherResponseDto,
    reminder: Reminder,
  ): WeatherAlertResult {
    if (weather.windSpeed <= this.maxWindSpeed) {
      return { shouldNotify: false, title: '', message: '' };
    }

    return {
      shouldNotify: true,
      title: 'Ventos fortes',
      message: `Ventos de ${Math.round(weather.windSpeed)} km/h previstos para o horário do seu lembrete "${reminder.title}". Redobre a atenção.`,
    };
  }
}
