import { Component, OnInit, ViewChild, inject, signal } from "@angular/core";
import { CommonModule } from '@angular/common';
import { CreateReminderRequest } from '@core/models/reminder.model';
import { RemindersService } from '@core/services/reminders.service';
import {
    AppHeaderComponent,
    BottomNavComponent,
    CalendarWidgetComponent,
    ModalComponent,
    ReminderCardComponent,
    WeatherSummaryCardComponent,
} from '@shared/components';
import { LucideAngularModule, Plus } from 'lucide-angular';

@Component({
    selector: "app-dashboard",
    templateUrl: "./dashboard.component.html",
    styleUrls: ["./dashboard.component.css"],
    imports: [
        CommonModule,
        LucideAngularModule,
        AppHeaderComponent,
        CalendarWidgetComponent,
        WeatherSummaryCardComponent,
        ReminderCardComponent,
        ModalComponent,
        BottomNavComponent,
    ],
    standalone: true
})
export class DashboardComponent implements OnInit {
    @ViewChild(ModalComponent) private modal?: ModalComponent;

    readonly Plus = Plus;
    readonly calendarDate = new Date();
    readonly selectedDate = new Date();
    readonly isModalOpen = signal(false);
    readonly createLoading = signal(false);
    readonly createError = signal<string | null>(null);
    readonly createSuccess = signal(false);

    private readonly remindersService = inject(RemindersService);
    readonly reminders = this.remindersService.reminders;

    ngOnInit(): void {
        this.remindersService.loadReminders().subscribe({
            error: () => {
                // O servico ja expoe o erro global; a Dashboard mantem a tela renderizavel.
            },
        });
    }

    openReminderModal(): void {
        this.createError.set(null);
        this.createSuccess.set(false);
        this.isModalOpen.set(true);
    }

    closeReminderModal(): void {
        if (this.createLoading()) {
            return;
        }

        this.isModalOpen.set(false);
        this.createError.set(null);
        this.createSuccess.set(false);
        this.modal?.reset();
    }

    createReminder(payload: CreateReminderRequest): void {
        this.createLoading.set(true);
        this.createError.set(null);
        this.createSuccess.set(false);

        this.remindersService.createReminder(payload).subscribe({
            next: () => {
                this.createLoading.set(false);
                this.createSuccess.set(true);
                this.isModalOpen.set(false);
                this.modal?.reset();
            },
            error: (error) => {
                this.createLoading.set(false);
                this.createError.set(error?.error?.message || 'Erro ao criar lembrete');
            },
        });
    }
}
