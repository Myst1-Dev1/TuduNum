import { Injectable } from '@nestjs/common';
import { Reminder } from '../../reminders/entities/reminder.entity';
import { WeatherResponseDto } from '../../weather/dto/weather-response.dto';
import { WeatherAlertResult, WeatherRule } from './weather-rule.interface';

@Injectable()
export class ExtremeHeatRule implements WeatherRule {
  private readonly maxTemperature = 35;

  evaluate(
    weather: WeatherResponseDto,
    reminder: Reminder,
  ): WeatherAlertResult {
    if (weather.temperature <= this.maxTemperature) {
      return { shouldNotify: false, title: '', message: '' };
    }

    return {
      shouldNotify: true,
      title: 'Calor extremo',
      message: `Temperatura de ${Math.round(weather.temperature)}°C prevista para o horário do seu lembrete "${reminder.title}". Mantenha-se hidratado.`,
    };
  }
}
