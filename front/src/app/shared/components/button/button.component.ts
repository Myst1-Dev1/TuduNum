import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      (click)="onClick($event)"
      [class]="buttonClass()"
    >
      @if (loading()) {
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Carregando...
      } @else {
        <ng-content></ng-content>
      }
    </button>
  `
})
export class ButtonComponent {
  type = input<'button' | 'submit' | 'reset'>('button');
  variant = input<'primary' | 'secondary' | 'outline' | 'danger'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);

  clicked = output<MouseEvent>();

  onClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }

  buttonClass(): string {
    const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 duration-200 select-none';
    
    // Variant classes
    const variants = {
      primary: 'bg-brand-500 hover:bg-brand-600 text-white shadow-premium hover:shadow-brand-500/20 focus:ring-brand-500',
      secondary: 'bg-slate-100 hover:bg-slate-200 dark:bg-dark-card dark:hover:bg-dark-border text-slate-800 dark:text-slate-100 focus:ring-slate-300',
      outline: 'border-2 border-slate-200 hover:border-slate-300 dark:border-dark-border dark:hover:border-dark-border dark:hover:bg-dark-card/30 text-slate-700 dark:text-slate-200 focus:ring-brand-500',
      danger: 'bg-rose-500 hover:bg-rose-600 text-white shadow-premium focus:ring-rose-500'
    };

    // Size classes
    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base'
    };

    const disabledState = (this.disabled() || this.loading()) ? 'opacity-50 cursor-not-allowed' : 'active:scale-95 cursor-pointer';

    return `${base} ${variants[this.variant()]} ${sizes[this.size()]} ${disabledState}`;
  }
}
