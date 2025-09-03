import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, firstValueFrom, switchMap, tap} from 'rxjs';
import {Router} from '@angular/router';
import {UserDTO} from '../../models/dtos/dto';


export interface LoginResponse { accessToken: string; email: string; }


@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:8080/api/auth';

  private userSubject = new BehaviorSubject<UserDTO | undefined>(undefined);
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
    return this.http.post<UserDTO>(
      `${this.apiUrl}/register`,
      { username, email, password }
    )
  }

  fetchCurrentUser() {
    return this.http.get<UserDTO>(`${this.apiUrl}/me`, { withCredentials: true })
      .pipe(tap(user => this.userSubject.next(user)));
  }

  async restoreSession(): Promise<UserDTO | undefined> {
    try {
      return await firstValueFrom(
        this.fetchCurrentUser().pipe()
      );
    } catch {
      this.userSubject.next(undefined);
      return undefined;
    }
  }

  logout() {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .subscribe(() => {
        this.userSubject.next(undefined);
        this.router.navigate(['/signin']);
      });
  }
}
