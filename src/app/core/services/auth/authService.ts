import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, firstValueFrom, switchMap, tap} from 'rxjs';

export interface User {
  id: string;
  email: string;
  displayName: string;
}

export interface LoginResponse { accessToken: string; email: string; }


@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/auth'; // adjust to your backend

  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  get currentUser() { return this.userSubject.value; }
  isAuthenticated() { return !!this.userSubject.value; }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      { email, password },
      { withCredentials: true }
    ).pipe(
      switchMap(() => this.fetchCurrentUser())
    );
  }

  register(username: string, email: string, password: string) {
    return this.http.post<User>(
      `${this.apiUrl}/register`,
      { username, email, password }
    )
  }

  fetchCurrentUser() {
    return this.http.get<User>(`${this.apiUrl}/me`, { withCredentials: true })
      .pipe(tap(user => this.userSubject.next(user)));
  }

  async restoreSession(): Promise<User | null> {
    try {
      return await firstValueFrom(
        this.fetchCurrentUser().pipe()
      );
    } catch {
      this.userSubject.next(null);
      return null;
    }
  }

  logout() {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .subscribe(() => this.userSubject.next(null));
  }
}
