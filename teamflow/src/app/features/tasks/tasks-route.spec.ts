import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Tasks } from './tasks';

describe('task routes', () => {
  it('loads the new task form and persists a task only after a successful response', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(), provideHttpClientTesting(),
        provideRouter([{ path: 'tasks/new', component: Tasks }, { path: 'tasks/:id', component: Tasks }]),
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/tasks/new', Tasks);
    expect(harness.routeNativeElement?.textContent).toContain('Feladatok betöltése');
    http.expectOne('http://localhost:3000/tasks').flush([]);
    harness.detectChanges();
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('Új feladat');
    component.draft = {
      ...component.draft, title: 'Új feladat', project: 'TeamFlow', assignee: 'Kiss Anna',
      dueDate: '2026.12.04.', estimate: '1',
    };
    component.saveTask();
    const create = http.expectOne('http://localhost:3000/tasks');
    expect(create.request.method).toBe('POST');
    expect(create.request.body.id).toBeUndefined();
    create.flush('hiba', { status: 500, statusText: 'Error' });
    expect(component.tasks()).toHaveLength(0);
    expect(component.operationError).toContain('mentése nem sikerült');
    component.saveTask();
    const retry = http.expectOne('http://localhost:3000/tasks');
    retry.flush({ ...retry.request.body, id: 1 });
    expect(component.tasks()).toHaveLength(1);
    http.verify();
  });
});
