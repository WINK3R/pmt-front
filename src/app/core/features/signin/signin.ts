import {Component, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AuthService} from '../../services/auth/authService';

@Component({
  selector: 'app-signin',
  imports: [
    RouterLink,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './signin.html',
  styleUrl: './signin.css'
})
export class Signin {
  email = '';
  password = '';
  private auth = inject(AuthService);
  private router = inject(Router);

  onSubmit() {
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => console.error('Login failed', err)
    });
  }

}
