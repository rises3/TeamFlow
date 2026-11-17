import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { Task } from '../../models/task';
import { Tasks } from './tasks';

const tasks: Task[] = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  title: index === 1 ? 'API service réteg' : `Feladat ${index + 1}`,
  project: 'TeamFlow', description: 'Leírás', status: 'Tervezett',
  statusClass: 'badge--planned', priority: 'Magas', assignee: 'Kiss Anna',
  dueDate: '2026.12.04.', estimate: '6 óra', tracked: '2,5 óra',
}));

describe('Tasks', () => {
  let component: Tasks;
  let fixture: ComponentFixture<Tasks>;
  let http: HttpTestingController;
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  beforeEach(async () => {
    params = new BehaviorSubject(convertToParamMap({}));
    await TestBed.configureTestingModule({
      imports: [Tasks],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'tasks/new', component: Tasks },
          { path: 'tasks/:id/edit', component: Tasks },
          { path: 'tasks/:id', component: Tasks },
        ]),
        { provide: ActivatedRoute, useValue: {
          paramMap: params.asObservable(), url: of([]),
          snapshot: { paramMap: params.value, url: [] },
        } },
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Tasks);
    component = fixture.componentInstance;
    http.expectOne('http://localhost:3000/tasks').flush(tasks);
    await fixture.whenStable();
  });

  it('updates a task only after the API confirms the change', () => {
    params.next(convertToParamMap({ id: 1 }));
    component.draft = { ...tasks[0], title: 'Módosított feladat' };
    component.saveTask();
    const request = http.expectOne('http://localhost:3000/tasks/1');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body.title).toBe('Módosított feladat');
    expect(component.tasks()[0].title).toBe('Feladat 1');
    request.flush({ ...tasks[0], title: 'Módosított feladat' });
    expect(component.tasks()[0].title).toBe('Módosított feladat');
  });

  it('does not replace a failed edit in the list', () => {
    params.next(convertToParamMap({ id: 1 }));
    component.draft = { ...tasks[0], title: 'Módosított feladat' };
    component.saveTask();
    http.expectOne('http://localhost:3000/tasks/1').flush('hiba', { status: 500, statusText: 'Error' });
    expect(component.tasks()[0].title).toBe('Feladat 1');
    expect(component.operationError).toContain('mentése nem sikerült');
  });

  it('does not show an unrelated task for an unknown identifier', () => {
    params.next(convertToParamMap({ id: 999 }));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Feladat nem található');
    expect(component.selectedTask()).toBeUndefined();
  });

  afterEach(() => http.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filters as the user searches and restores the list when cleared', async () => {
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = '  API  ';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.filteredTasks().map((task) => task.title)).toEqual(['API service réteg']);
    expect(fixture.nativeElement.textContent).toContain('1 / 6 feladat');
    input.value = 'nincs ilyen';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.filteredTasks()).toHaveLength(0);
    expect(fixture.nativeElement.textContent).toContain('Nincs találat');
    const clear = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find((button) => button.textContent?.includes('Keresés törlése'));
    expect(clear).toBeTruthy();
    clear?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.filteredTasks()).toHaveLength(6);
    expect(input.value).toBe('');
  });

  it('only removes a task after confirmation', () => {
    params.next(convertToParamMap({ id: 1 }));
    component.deleteTask();
    expect(component.tasks()).toHaveLength(6);
    component.pendingDelete.set(null);
    expect(component.tasks()).toHaveLength(6);
    component.deleteTask();
    component.confirmDelete();
    const request = http.expectOne('http://localhost:3000/tasks/1');
    expect(request.request.method).toBe('DELETE');
    expect(component.tasks()).toHaveLength(6);
    request.flush(null);
    expect(component.tasks()).toHaveLength(5);
  });

  it('shows loading and server error and retries the request', () => {
    component.reloadTasks();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Feladatok betöltése');
    http.expectOne('http://localhost:3000/tasks').flush('hiba', { status: 503, statusText: 'Unavailable' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Nem érhető el a kiszolgáló');
    const retry = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find((button) => button.textContent?.includes('Újrapróbálás'));
    retry?.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Feladatok betöltése');
    http.expectOne('http://localhost:3000/tasks').flush(tasks);
    fixture.detectChanges();
    expect(component.loadState()).toBe('ready');
    expect(component.tasks()).toHaveLength(6);
  });

  it('preserves the task when the delete request fails', () => {
    params.next(convertToParamMap({ id: 1 }));
    component.deleteTask();
    component.confirmDelete();
    http.expectOne('http://localhost:3000/tasks/1').flush('hiba', { status: 500, statusText: 'Error' });
    expect(component.tasks()).toHaveLength(6);
    expect(component.operationError).toContain('törlése nem sikerült');
  });

  it('rejects an invalid task without changing the store', () => {
    component.draft = {
      ...component.draft, title: '  ', project: 'TeamFlow', assignee: 'Kiss Anna',
      dueDate: '2026.12.04.', estimate: '101',
    };
    const count = component.tasks().length;
    component.saveTask();
    expect(component.validationError).toBeTruthy();
    expect(component.tasks()).toHaveLength(count);
  });

  it('validates checklist text, comments and time entries', () => {
    params.next(convertToParamMap({ id: 1 }));
    const checklistCount = component.checklist().length;
    component.checklistText = '   ';
    component.saveChecklist();
    expect(component.checklistError).toBeTruthy();
    expect(component.checklist()).toHaveLength(checklistCount);
    component.checklistText = '  Új elem  ';
    component.saveChecklist();
    expect(component.checklist().at(-1)?.text).toBe('Új elem');

    const commentCount = component.comments().length;
    component.commentBody = ' '.repeat(5);
    component.saveComment();
    expect(component.comments()).toHaveLength(commentCount);
    component.commentBody = '  Teszt  ';
    component.saveComment();
    expect(component.comments().at(-1)?.body).toBe('Teszt');
    expect(component.comments().at(-1)?.createdAt).toMatch(/Z$/);

    const entryCount = component.timeEntries().length;
    component.timeDraft = { minutes: 481, date: '2026-12-01', note: '' };
    component.saveTimeEntry();
    expect(component.timeEntries()).toHaveLength(entryCount);
    component.timeDraft = { minutes: 480, date: '2026-12-01', note: '  Munka  ' };
    component.saveTimeEntry();
    const request = http.expectOne('http://localhost:3000/tasks/1');
    expect(request.request.method).toBe('PATCH');
    request.flush({ ...tasks[0], tracked: '10,5 óra' });
    expect(component.timeEntries().at(-1)?.note).toBe('Munka');
  });
});
