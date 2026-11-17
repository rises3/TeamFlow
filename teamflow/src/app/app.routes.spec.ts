import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { Dashboard } from './features/dashboard/dashboard';

describe('app routes', () => {
  it('redirects the root URL to the dashboard', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/', Dashboard);

    expect(TestBed.inject(Router).url).toBe('/dashboard');
    expect(harness.routeNativeElement?.querySelector('h1')).toBeTruthy();
  });
});
