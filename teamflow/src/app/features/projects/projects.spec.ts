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

  it('keeps the project detail template available for an opened project', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/projects/1', Projects);

    expect(harness.routeNativeElement?.querySelector('.project-detail')).toBeTruthy();
    expect(harness.routeNativeElement?.textContent).toContain('Projekt tagok');
    expect(harness.routeNativeElement?.textContent).toContain('Kapcsolódó feladatok');
  });

  it('shows the new project form on /projects/new', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/projects/new', Projects);

    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('Új projekt');
  });
});
