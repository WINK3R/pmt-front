import {Component, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../services/auth/authService';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-signup',
  imports: [
    RouterLink,
    FormsModule
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {
  username = '';
  email = '';
  password = '';
  private auth = inject(AuthService);
  private router = inject(Router);

  onSubmit() {
    this.auth.register(this.username, this.email, this.password).subscribe({
      next: () => {
        this.auth.login(this.email, this.password).subscribe({
          next: () => this.router.navigate(['/dashboard']),
          error: err => console.error('Login failed', err)
        });
      },
      error: err => console.error('Sign Up failed', err)
    });
  }
}
