// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { inject } from '@angular/core';
import { provideAppInitializer } from '@angular/core';
import { AuthService } from './app/core/services/auth/authService';

const appWithSession = {
  ...appConfig,
  providers: [
    ...(appConfig.providers ?? []),
    provideAppInitializer(async () => {
      const auth = inject(AuthService);
      try {
        await auth.restoreSession();
      } catch {
      }
    }),
  ],
};

bootstrapApplication(App, appWithSession)
  .catch(err => console.error(err));
