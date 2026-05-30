import { Component, input, forwardRef, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="flex flex-col w-full gap-1.5">
      @if (label()) {
        <label [for]="id()" class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {{ label() }}
        </label>
      }
      <div class="relative flex items-center">
        <input
          [id]="id()"
          [type]="type()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onBlur()"
          [class]="inputClass()"
        />
      </div>
      @if (error()) {
        <span class="text-xs font-semibold text-rose-500 animate-fade-in">
          {{ error() }}
        </span>
      }
    </div>
  `
})
export class InputComponent implements ControlValueAccessor {
  id = input<string>(`input-${Math.random().toString(36).substring(2, 9)}`);
  label = input<string>('');
  type = input<'text' | 'password' | 'email' | 'number' | 'date'>('text');
  placeholder = input<string>('');
  error = input<string>('');

  inputClass = computed(() => {
    const base = 'w-full px-4 py-3 bg-white dark:bg-dark-card border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed';
    const normal = 'border-slate-200 dark:border-dark-border focus:ring-brand-500/20 focus:border-brand-500';
    const hasError = 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10';
    return this.error() ? `${base} ${hasError}` : `${base} ${normal}`;
  });

  value = signal<string>('');
  disabled = signal<boolean>(false);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onChange: (value: string) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onTouch: () => void = () => {};

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.onChange(val);
  }

  onBlur(): void {
    this.onTouch();
  }

  writeValue(val: string | null): void {
    this.value.set(val || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
