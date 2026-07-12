import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, Role } from '@core';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { LocalStorageService } from '@shared/services';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
  imports: [
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
})
export class SigninComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit
{
    private cdr = inject(ChangeDetectorRef);
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private localStorageService = inject(LocalStorageService);

  authForm!: FormGroup;
  submitted = false;
  loading = false;
  error = '';
  hide = true;
  rememberMe = false;

  ngOnInit() {
    this.authForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }
  get f() {
    return this.authForm.controls;
  }
  onSubmit() {
    this.submitted = true;
    this.loading = true;
    this.error = '';

    if (this.authForm.invalid) {
      this.error = 'Username and Password not valid !';
      this.loading = false;
      return;
    }

    this.authService
      .login(
        this.f['username'].value,
        this.f['password'].value,
        this.rememberMe
      )
      .subscribe({
        next: (response) => {
          const role = response.user.roles?.[0];
          this.loading = false;
          if (role?.name === Role.Admin) {
            this.router.navigate(['/admin/dashboard/main']);
          } else if (role?.name === Role.Encargado) {
            this.router.navigate(['/admin/reportes']);
          } else if (role?.name === Role.Vendedor) {
            this.router.navigate(['/admin/ventas']);
          } else {
            this.router.navigate(['/authentication/signin']);
          }
          this.loading = false;
              this.cdr.markForCheck();
        },
        error: (error) => {
          this.error = error;
          this.submitted = false;
          this.loading = false;
        },
      });
  }
}
