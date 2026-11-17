import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Team } from './team';

describe('Team', () => {
  let component: Team;
  let fixture: ComponentFixture<Team>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Team],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Team);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('rejects duplicate emails and invalid trimmed names', () => {
    component.startCreate();
    component.draft = { ...component.draft, name: '   ', email: 'new@example.com', role: 'Fejlesztő' };
    component.saveMember();
    expect(component.validationError).toBeTruthy();
    expect(component.members()).toHaveLength(2);
    component.draft = { ...component.draft, name: 'Új tag', email: ' ANNA@EXAMPLE.COM ' };
    component.saveMember();
    expect(component.validationError).toBeTruthy();
    expect(component.members()).toHaveLength(2);
  });

  it('creates a team member', () => {
    component.startCreate();
    component.draft = {
      ...component.draft,
      name: 'Éva Minta',
      email: 'eva@example.com',
      role: 'Backend fejlesztő',
    };

    component.saveMember();

    expect(component.members()).toHaveLength(3);
    expect(component.members()[2]).toMatchObject({
      name: 'Éva Minta',
      initials: 'ÉM',
      email: 'eva@example.com',
    });
  });

  it('updates and deletes a team member', () => {
    component.startEdit(component.members()[0]);
    component.draft = { ...component.draft, role: 'Projektvezető' };
    component.saveMember();

    expect(component.members()[0].role).toBe('Projektvezető');
    expect(component.members()).toHaveLength(2);

    component.deleteMember(component.members()[0]);
    expect(component.members()).toHaveLength(2);
    component.pendingDelete.set(null);
    expect(component.members()).toHaveLength(2);
    component.deleteMember(component.members()[0]);
    component.confirmDelete();

    expect(component.members()).toHaveLength(1);
    expect(component.members()[0].name).toBe('Nagy Bence');
  });
});
