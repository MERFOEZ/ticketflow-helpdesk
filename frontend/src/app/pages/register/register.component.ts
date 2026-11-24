import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  register() {
    this.error = '';

    if (!this.fullName || !this.email || !this.password) {
      this.error = 'Please fill all fields';
      return;
    }

    const data = { fullName: this.fullName, email: this.email, password: this.password };

    this.auth.register(data).subscribe({
      next: (res) => {
        this.auth.saveUser(res);
        this.router.navigate(['/my-tickets']);
      },
      error: () => {
        this.error = 'Email already exists';
      }
    });
  }
}
