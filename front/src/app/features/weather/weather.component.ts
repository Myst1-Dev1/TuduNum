/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { Component, OnInit } from "@angular/core"; // 1. Component importado do Angular Core
import { CommonModule } from "@angular/common";
import { Cloud, CloudDrizzle, Compass, LucideAngularModule, MapPin, Sun } from "lucide-angular"; // 2. Tiramos o 'Component' daqui
import { AppHeaderComponent, BottomNavComponent } from "@shared/components";

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
    
    ngOnInit(): void {
        // Seu código de inicialização entra aqui depois
    }
}