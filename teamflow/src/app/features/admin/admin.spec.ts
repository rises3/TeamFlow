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

  it('shows the labels page by default', () => {
    expect(component.page().title).toBe('Címkék');
    expect(component.items()).toHaveLength(3);
  });

  it('shows the priorities page for the priorities route', async () => {
    const harness = await RouterTestingHarness.create();
    const admin = await harness.navigateByUrl('/admin/priorities', Admin);

    expect(admin.page().title).toBe('Prioritások');
    expect(harness.routeNativeElement?.textContent).toContain('Szint');
  });

  it('requires an immutable unique status key and positive order', async () => {
    const harness = await RouterTestingHarness.create();
    const admin = await harness.navigateByUrl('/admin/statuses', Admin);
    admin.startCreate();
    admin.draft = { ...admin.draft, name: 'Új állapot', key: 'done', order: 1 };
    admin.saveEntry();
    expect(admin.validationError).toBeTruthy();
    expect(admin.items()).toHaveLength(3);
    admin.draft = { ...admin.draft, key: 'new_status', order: 0 };
    admin.saveEntry();
    expect(admin.items()).toHaveLength(3);
    admin.draft = { ...admin.draft, order: 4 };
    admin.saveEntry();
    expect(admin.items()).toHaveLength(4);
    admin.startEdit(admin.items()[3]);
    admin.draft = { ...admin.draft, key: 'changed' };
    admin.saveEntry();
    expect(admin.validationError).toBeTruthy();
    expect(admin.items()[3].key).toBe('new_status');
  });

  it('creates and edits an entry on the selected tab', () => {
    component.startCreate();
    component.draft = { ...component.draft, name: 'Dokumentáció', detail: '#123456' };
    component.saveEntry();

    expect(component.items()).toHaveLength(4);
    expect(component.items()[3]).toMatchObject({ name: 'Dokumentáció', color: '#123456' });

    component.startEdit(component.items()[3]);
    component.draft = { ...component.draft, name: 'Új dokumentáció' };
    component.saveEntry();

    expect(component.items()[3].name).toBe('Új dokumentáció');
    expect(component.items()).toHaveLength(4);
  });

  it('deletes an entry after confirmation', () => {
    component.deleteEntry(component.items()[0]);
    expect(component.items()).toHaveLength(3);
    component.pendingDelete.set(null);
    expect(component.items()).toHaveLength(3);
    component.deleteEntry(component.items()[0]);
    component.confirmDelete();

    expect(component.items()).toHaveLength(2);
    expect(component.items()[0].name).toBe('UI');
  });
});
