import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, ValidationErrors, AbstractControl } from '@angular/forms';
import { AuthService } from '@core/auth/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-[#0b1329] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#1d2d54] via-[#0b1329] to-[#050a18] p-4 font-sans select-none antialiased">
      <div class="w-full max-w-[400px] flex flex-col items-center">
        
        <div class="text-center mb-8 flex flex-col items-center">
          <div class="w-16 h-16 bg-[#16223f] border border-[#2a3c66] rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(59,130,246,0.15)] mb-4">
            <svg class="w-8 h-8 text-[#3b82f6]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0-4H7V7h10v2z" opacity="0.3"/>
              <rect x="6" y="6" width="12" height="12" rx="2" fill="none" stroke="#3b82f6" stroke-width="2"/>
              <circle cx="10" cy="12" r="1.5" fill="#3b82f6"/>
              <rect x="13" y="11" width="3" height="2" rx="0.5" fill="#3b82f6"/>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-white tracking-wide drop-shadow-[0_0_12px_rgba(255,255,255,0.1)]">TuduNum</h1>
          <p class="text-gray-400 text-sm mt-2 font-medium tracking-tight">Domine seu tempo, domine seu mundo.</p>
        </div>

        <div class="w-full bg-[#111c35]/70 backdrop-blur-md border border-[#1e2d4a] rounded-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
          <h2 class="text-2xl font-semibold text-white mb-6">
            {{ mode() === 'login' ? 'Bem vindo' : 'Crie sua Conta' }}
          </h2>

          <div *ngIf="errorMessage()" class="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2" role="alert">
            <span class="text-xs font-medium text-rose-400">{{ errorMessage() }}</span>
          </div>

          <form *ngIf="mode() === 'login'" [formGroup]="loginForm" (ngSubmit)="onSubmitLogin()" novalidate class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-400 mb-2 tracking-wider">Endereço de Email</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                </span>
                <input formControlName="email" type="email" placeholder="name&#64;company.com" 
                  class="w-full bg-[#16223f] border border-[#22345a] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all" />
              </div>
            </div>

            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="text-xs font-semibold text-gray-400 tracking-wider">Senha</label>
                <a href="#" class="text-xs font-semibold text-[#3b82f6] hover:underline">Esqueceu a senha?</a>
              </div>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </span>
                <input formControlName="password" [type]="showLoginPassword() ? 'text' : 'password'" placeholder="••••••••" 
                  class="w-full bg-[#16223f] border border-[#22345a] rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all" />
                <button type="button" (click)="showLoginPassword.set(!showLoginPassword())" class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-500 hover:text-gray-300">
                  <svg *ngIf="!showLoginPassword()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  <svg *ngIf="showLoginPassword()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                </button>
              </div>
            </div>

            <button type="submit" [disabled]="loginForm.invalid || isSubmitting()"
              class="w-full bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 disabled:pointer-events-none text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2 shadow-[0_4px_20px_rgba(59,130,246,0.3)]">
              <span>{{ isSubmitting() ? 'Entrando...' : 'Entrar' }}</span>
              <svg *ngIf="!isSubmitting()" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </form>

          <form *ngIf="mode() === 'register'" [formGroup]="registerForm" (ngSubmit)="onSubmitRegister()" novalidate class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-400 mb-2 tracking-wider">Nome Completo</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </span>
                <input formControlName="name" type="text" placeholder="John Doe" 
                  class="w-full bg-[#16223f] border border-[#22345a] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#3b82f6] transition-all" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-400 mb-2 tracking-wider">Endereço de Email</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                </span>
                <input formControlName="email" type="email" placeholder="name&#64;company.com" 
                  class="w-full bg-[#16223f] border border-[#22345a] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#3b82f6] transition-all" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-400 mb-2 tracking-wider">Senha</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </span>
                <input formControlName="password" [type]="showRegisterPassword() ? 'text' : 'password'" placeholder="••••••••" 
                  class="w-full bg-[#16223f] border border-[#22345a] rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#3b82f6] transition-all" />
                <button type="button" (click)="showRegisterPassword.set(!showRegisterPassword())" class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-500 hover:text-gray-300">
                  <svg *ngIf="!showRegisterPassword()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  <svg *ngIf="showRegisterPassword()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                </button>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-400 mb-2 tracking-wider">Confirme a senha</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </span>
                <input formControlName="confirmPassword" [type]="showRegisterConfirmPassword() ? 'text' : 'password'" placeholder="••••••••" 
                  class="w-full bg-[#16223f] border border-[#22345a] rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#3b82f6] transition-all" />
                <button type="button" (click)="showRegisterConfirmPassword.set(!showRegisterConfirmPassword())" class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-500 hover:text-gray-300">
                  <svg *ngIf="!showRegisterConfirmPassword()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  <svg *ngIf="showRegisterConfirmPassword()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                </button>
              </div>
            </div>

            <button type="submit" [disabled]="registerForm.invalid || isSubmitting()"
              class="w-full bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2">
              <span>{{ isSubmitting() ? 'Criando...' : 'Criar Conta' }}</span>
            </button>
          </form>

          <div class="relative my-6 flex items-center justify-center">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-[#1e2d4a]"></div>
            </div>
            <span class="relative bg-[#15223e] px-3 text-[10px] font-bold tracking-wider text-gray-500 uppercase">Ou continue com</span>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <button type="button" class="flex items-center justify-center gap-2 bg-[#16223f] hover:bg-[#1c2b4f] border border-[#22345a] rounded-xl py-2.5 text-xs font-semibold text-white transition-colors">
              <svg class="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.227C18.423 1.487 15.62 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.854 11.57-11.77 0-.79-.085-1.39-.188-1.945H12.24z"/>
              </svg>
              <span>Google</span>
            </button>

            <button type="button" class="flex items-center justify-center gap-2 bg-[#16223f] hover:bg-[#1c2b4f] border border-[#22345a] rounded-xl py-2.5 text-xs font-semibold text-white transition-colors">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.57 2.95-1.39z"/>
              </svg>
              <span>Apple</span>
            </button>
          </div>
        </div>

        <div class="mt-6 text-center text-xs tracking-wide">
          <span class="text-gray-500">
            {{ mode() === 'login' ? "Não tem uma conta?" : "Já tem uma conta?" }}
          </span>
          <button (click)="toggleMode()" class="ml-1 font-semibold text-gray-300 hover:text-white transition-colors focus:outline-none underline decoration-[#1e2d4a] hover:decoration-[#3b82f6]">
            {{ mode() === 'login' ? 'Criar conta' : 'Entrar' }}
          </button>
        </div>

      </div>
    </div>
  `
})
export default class AuthPageComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  public mode = signal<'login' | 'register'>('login');
  public isSubmitting = signal(false);
  public errorMessage = signal<string | null>(null);

  // Signals para visibilidade de senhas
  public showLoginPassword = signal(false);
  public showRegisterPassword = signal(false);
  public showRegisterConfirmPassword = signal(false);

  public loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  public registerForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: passwordMatchValidator });

  public toggleMode(): void {
    this.mode.set(this.mode() === 'login' ? 'register' : 'login');
    this.errorMessage.set(null);
    // Reseta a visibilidade ao alternar telas
    this.showLoginPassword.set(false);
    this.showRegisterPassword.set(false);
    this.showRegisterConfirmPassword.set(false);
  }

  private markAllAsTouched(form: ReturnType<typeof this.fb.group>): void {
    Object.values(form.controls).forEach(control => control.markAsTouched());
    if (form.errors) form.updateValueAndValidity();
  }

  public onSubmitLogin(): void {
    this.errorMessage.set(null);
    if (this.loginForm.invalid) {
      this.markAllAsTouched(this.loginForm);
      return;
    }

    this.isSubmitting.set(true);
    const { email, password } = this.loginForm.value;

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Email ou senha inválidos');
      }
    });
  }

  public onSubmitRegister(): void {
    this.errorMessage.set(null);
    if (this.registerForm.invalid) {
      this.markAllAsTouched(this.registerForm);
      return;
    }

    this.isSubmitting.set(true);
    const { name, email, password } = this.registerForm.value;

    this.authService.register({ name: name!, email: email!, password: password! }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Erro ao criar conta. Tente novamente.');
      }
    });
  }
}