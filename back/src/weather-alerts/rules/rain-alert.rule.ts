import { Injectable } from '@nestjs/common';
import { Reminder } from '../../reminders/entities/reminder.entity';
import { WeatherResponseDto } from '../../weather/dto/weather-response.dto';
import { WeatherAlertResult, WeatherRule } from './weather-rule.interface';

@Injectable()
export class RainAlertRule implements WeatherRule {
  private readonly rainKeywords = [
    'chuva',
    'rain',
    'drizzle',
    'garoa',
    'pancada',
    'trovoada',
    'thunderstorm',
  ];

  evaluate(
    weather: WeatherResponseDto,
    reminder: Reminder,
  ): WeatherAlertResult {
    const description = weather.description.toLowerCase();
    const isRainy = this.rainKeywords.some((keyword) =>
      description.includes(keyword),
    );

    if (!isRainy) {
      return { shouldNotify: false, title: '', message: '' };
    }

    return {
      shouldNotify: true,
      title: 'Previsão de chuva',
      message: `Previsão de chuva próximo ao horário do seu lembrete "${reminder.title}". Considere sair mais cedo.`,
    };
  }
}
