import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Projects } from './projects';

describe('Projects', () => {
  let component: Projects;
  let fixture: ComponentFixture<Projects>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Projects],
      providers: [
        provideRouter([
          { path: 'projects/new', component: Projects },
          { path: 'projects/:id', component: Projects },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Projects);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('rejects a project with an end date before its start date', () => {
    component.draft = { name: 'Projekt', description: '', owner: 'Kiss Anna', status: 'active', startDate: '2026-12-10', dueDate: '2026-12-09' };
    const count = component.projects().length;
    component.createProject();
    expect(component.validationError).toBeTruthy();
    expect(component.projects()).toHaveLength(count);
  });

  it('rejects duplicate project members', () => {
    const count = component.selectedProject().members.length;
    component.startMemberEdit();
    component.memberUserId = 1;
    component.memberRole = 'Fejlesztő';
    component.saveMember();
    expect(component.memberError).toBeTruthy();
    expect(component.selectedProject().members).toHaveLength(count);
  });

  it('shows project details for an opened project', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/projects/1', Projects);

    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('TeamFlow webalkalmazás');
    expect(harness.routeNativeElement?.textContent).toContain('Projekt tagok');
    expect(harness.routeNativeElement?.textContent).toContain('Kapcsolódó feladatok');
  });

  it('shows the new project form on /projects/new', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/projects/new', Projects);

    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('Új projekt');
  });
});
