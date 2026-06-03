import { Component, inject, Input, OnInit } from "@angular/core"; // 1. Component importado do Angular Core
import { CommonModule } from "@angular/common";
import { Cloud, CloudDrizzle, Compass, LucideAngularModule, MapPin, Sun } from "lucide-angular"; // 2. Tiramos o 'Component' daqui
import { AppHeaderComponent, BottomNavComponent } from "@shared/components";
import { WeatherService } from "@core/services/weather.service";

@Component({
    selector: 'app-weather',
    templateUrl: './weather.component.html', // Nota: ajuste para templateUrl se for um arquivo externo
    styleUrls: [], // Nota: ajuste para styleUrls (no plural) se for uma array
    standalone: true,
    imports: [LucideAngularModule, CommonModule, AppHeaderComponent, BottomNavComponent],
})
export class WeatherComponent implements OnInit {
    readonly Cloud = Cloud;
    readonly CloudDrizzle = CloudDrizzle;
    readonly Sun = Sun;
    readonly MapPin = MapPin;
    readonly Compass = Compass;

    readonly today = new Date();

    @Input() city = 'Rio de Janeiro'; // Cidade padrão caso recusem a geolocalização
    
    private readonly weatherService = inject(WeatherService);
    
    readonly weather = this.weatherService.weather;
    readonly hourlyForecast = this.weatherService.hourlyForecast;

    ngOnInit(): void {
        this.loadWeatherWithGeolocation();
    }

    private loadWeatherWithGeolocation(): void {
        // Verifica se o navegador do usuário suporta Geolocalização
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                // 1º Argumento: Callback de Sucesso (Executado se o usuário aceitar)
                (position) => {
                    const { latitude, longitude } = position.coords;
                    
                    // Dispara as chamadas por coordenadas recebidas do GPS/Rede
                    this.weatherService.getByCoordinates(latitude, longitude).subscribe();
                    this.weatherService.getHourlyForecastByCoordinates(latitude, longitude).subscribe();
                },
                // 2º Argumento: Callback de Erro (Executado se recusar ou falhar)
                (err) => {
                    console.warn('Usuário negou ou falhou ao obter geolocalização. Usando fallback.', err);
                    this.loadFallbackCity();
                },
                // 3º Argumento: Objeto de Opções nativo
                {
                    timeout: 10000,          // Tempo limite de 10 segundos
                    enableHighAccuracy: true // Tenta obter localização precisa
                }
            );
        } else {
            this.loadFallbackCity();
        }
    }

    // Método auxiliar para disparar a busca padrão por string
    private loadFallbackCity(): void {
        this.weatherService.getByCity(this.city).subscribe();
        this.weatherService.getHourlyForecast(this.city).subscribe();
    }
}