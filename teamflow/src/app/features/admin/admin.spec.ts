import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Admin } from './admin';

describe('Admin', () => {
  let component: Admin;
  let fixture: ComponentFixture<Admin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Admin],
      providers: [
        provideRouter([
          { path: 'admin/:resource', component: Admin },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Admin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts with an empty labels list', () => {
    expect(component.page().title).toBe('Címkék');
    expect(component.items()).toEqual([]);
  });

  it('shows the priorities page for the priorities route', async () => {
    const harness = await RouterTestingHarness.create();
    const admin = await harness.navigateByUrl('/admin/priorities', Admin);

    expect(admin.page().title).toBe('Prioritások');
    expect(harness.routeNativeElement?.textContent).toContain('Szint');
  });
});
