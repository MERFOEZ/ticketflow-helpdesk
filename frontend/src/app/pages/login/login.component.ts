import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.error = '';

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.auth.saveUser(res);

        if (res.role == 'Admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/my-tickets']);
        }
      },
      error: () => {
        this.error = 'Wrong email or password';
      }
    });
  }
}
