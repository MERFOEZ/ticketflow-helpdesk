import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5080/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(data: any) {
    return this.http.post<any>(this.apiUrl + '/login', data);
  }

  register(data: any) {
    return this.http.post<any>(this.apiUrl + '/register', data);
  }

  // save token after login/register
  saveUser(res: any) {
    localStorage.setItem('token', res.token);
    localStorage.setItem('role', res.role);
    localStorage.setItem('name', res.name);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getRole() {
    return localStorage.getItem('role');
  }

  getName() {
    return localStorage.getItem('name');
  }

  isLoggedIn() {
    return this.getToken() != null;
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
