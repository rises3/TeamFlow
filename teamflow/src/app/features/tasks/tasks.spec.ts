import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Tasks } from './tasks';

describe('Tasks', () => {
  let component: Tasks;
  let fixture: ComponentFixture<Tasks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tasks],
      providers: [
        provideRouter([
          { path: 'tasks/new', component: Tasks },
          { path: 'tasks/:id/edit', component: Tasks },
          { path: 'tasks/:id', component: Tasks },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Tasks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the new task form on /tasks/new', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/tasks/new', Tasks);

    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('Új feladat');
  });
});
