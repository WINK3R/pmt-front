import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/authService';
import { of, switchMap } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  return auth.fetchCurrentUser().pipe(
    switchMap(() => of(true)),
    (_) => {
      router.navigate(['/signin']);
      return of(false);
    }
  );
};
