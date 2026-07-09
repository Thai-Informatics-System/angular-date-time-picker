import { ApplicationConfig, provideZoneChangeDetection, ANIMATION_MODULE_TYPE } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    { provide: ANIMATION_MODULE_TYPE, useValue: 'NoopAnimations' },
  ]
};
