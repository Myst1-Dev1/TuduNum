import { Component, inject, OnInit, signal } from "@angular/core";
import { AppHeaderComponent } from "@shared/components/app-header/app-header.component";
import { BottomNavComponent } from "@shared/components/bottom-nav/bottom-nav.component";
import { CommonModule } from "@angular/common";
import { LucideAngularModule, Search, Mic, Footprints, Bus, Bike, Car, Layers, Compass, Share2 } from "lucide-angular";
import { TravelMode } from "@core/models/map.model";
import { MapService } from "@core/services/map.service";
import { FormsModule } from "@angular/forms";

@Component({  
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: [],
  standalone: true,
  imports: [LucideAngularModule, CommonModule, FormsModule, AppHeaderComponent, BottomNavComponent],
})
export class MapComponent implements OnInit {
  readonly Search = Search;
  readonly Mic = Mic
  readonly Footprints = Footprints
  readonly Bus = Bus
  readonly Bike = Bike
  readonly Car = Car
  readonly Layers = Layers
  readonly Compass = Compass
  readonly Share2 = Share2

  private readonly mapService = inject(MapService);

  readonly travelMode = TravelMode;
  readonly activeMode = signal<TravelMode>(TravelMode.WALKING);
  readonly destinationInput = signal<string>('');
  
  readonly routeInfo = this.mapService.routeInfo;
  readonly loadingRoute = this.mapService.loadingRoute;
  readonly currentAddress = this.mapService.currentAddress;

  private userCoords: { lat: number; lng: number } | null = null;

  ngOnInit(): void {
    this.getUserLocation();
  }

  getUserLocation(): void {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.userCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        // Faz o reverse geocode para descobrir o nome da rua onde o usuário está
        this.mapService.reverseGeocode(this.userCoords.lat, this.userCoords.lng).subscribe();
      });
    }
  }

  // Executado ao dar Enter na busca ou clicar nos botões de transporte
  calculateCurrentRoute(): void {
    const destination = this.destinationInput().trim();
    const origin = this.currentAddress();

    if (!destination || !origin) return;

    this.mapService.getRoute(origin, destination, this.activeMode()).subscribe({
      error: (err) => {
        if (err.status === 501) {
          alert('Este modo de transporte ainda não está disponível.');
        }
      }
    });
  }

  changeMode(mode: TravelMode): void {
    this.activeMode.set(mode);
    // Se já tiver um destino digitado, recalcula a rota automaticamente no novo modo
    if (this.destinationInput()) {
      this.calculateCurrentRoute();
    }
  }
}