import { Reminder } from '../../reminders/entities/reminder.entity';
import { WeatherResponseDto } from '../../weather/dto/weather-response.dto';

export interface WeatherAlertResult {
  shouldNotify: boolean;
  title: string;
  message: string;
}

export interface WeatherRule {
  evaluate(
    weather: WeatherResponseDto,
    reminder: Reminder,
  ): WeatherAlertResult;
}
