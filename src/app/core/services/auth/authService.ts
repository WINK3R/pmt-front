import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

export interface User {
  id: string;
  email: string;
  displayName: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/auth'; // adjust to your backend

  currentUser: User | null = null;

  login(email: string, password: string) {
    return this.http.post<User>(
      `${this.apiUrl}/login`,
      { email, password },
    ).pipe(
      tap(user => this.currentUser = user)
    );
  }

  register(username: string, email: string, password: string) {
    return this.http.post<User>(
      `${this.apiUrl}/register`,
      { username, email, password }
    ).pipe(
      tap(user => this.currentUser = user)
    );
  }

  fetchCurrentUser() {
    return this.http.get<User>(`${this.apiUrl}/me`, { withCredentials: true })
      .pipe(tap(user => this.currentUser = user));
  }

  logout() {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .pipe(tap(() => this.currentUser = null));
  }

  isAuthenticated(): boolean {
    return this.currentUser != null;
  }
}
