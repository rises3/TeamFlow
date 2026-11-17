import { Component, computed, inject, Injectable, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { textInRange } from '../../shared/validation/validation';
import { ConfirmDelete } from '../../shared/confirm-delete/confirm-delete';

export interface TeamMember {
  id: number;
  initials: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

const initialMembers: TeamMember[] = [
  {
    id: 1,
    initials: 'KA',
    name: 'Kiss Anna',
    email: 'anna@example.com',
    role: 'Frontend fejlesztő',
    active: true,
  },
  {
    id: 2,
    initials: 'NB',
    name: 'Nagy Bence',
    email: 'bence@example.com',
    role: 'Frontend fejlesztő',
    active: true,
  },
];

type MemberFormMode = 'create' | 'edit' | null;

function createMemberDraft(): Omit<TeamMember, 'id'> {
  return {
    initials: '',
    name: '',
    email: '',
    role: '',
    active: true,
  };
}

@Injectable({ providedIn: 'root' })
export class TeamStore {
  readonly members = signal(initialMembers);

  save(member: TeamMember): void {
    this.members.update((members) => {
      const exists = members.some((item) => item.id === member.id);
      return exists
        ? members.map((item) => item.id === member.id ? { ...member } : item)
        : [...members, { ...member }];
    });
  }

  remove(id: number): void {
    this.members.update((members) => members.filter((member) => member.id !== id));
  }
}

@Component({
  imports: [CommonModule, FormsModule, Sidebar, ConfirmDelete],
  selector: 'app-team',
  styleUrl: './team.css',
  templateUrl: './team.html',
})
export class Team {
  private readonly teamStore = inject(TeamStore);
  readonly members = this.teamStore.members;
  readonly activeMemberCount = computed(() => this.members().filter((member) => member.active).length);
  readonly formMode = signal<MemberFormMode>(null);
  readonly pendingDelete = signal<TeamMember | null>(null);
  draft: Omit<TeamMember, 'id'> & { id?: number } = createMemberDraft();
  validationError = '';

  startCreate(): void {
    this.validationError = '';
    this.draft = createMemberDraft();
    this.formMode.set('create');
  }

  startEdit(member: TeamMember): void {
    this.validationError = '';
    this.draft = { ...member };
    this.formMode.set('edit');
  }

  saveMember(): void {
    const name = this.draft.name.trim();
    const email = this.draft.email.trim();
    const role = this.draft.role.trim();
    if (!textInRange(name, 2, 60) || !textInRange(role, 2, 40) ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        this.members().some((member) => member.id !== this.draft.id && member.email.toLowerCase() === email.toLowerCase()) ||
        typeof this.draft.active !== 'boolean') {
      this.validationError = 'A név 2–60, a szerepkör 2–40 karakteres legyen; az e-mail-cím legyen helyes és egyedi.';
      return;
    }
    this.validationError = '';

    const initials = name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0].toLocaleUpperCase())
      .join('');
    const id = this.draft.id ?? Math.max(0, ...this.members().map((member) => member.id)) + 1;

    this.teamStore.save({
      id,
      initials,
      name,
      email,
      role,
      active: this.draft.active,
    });
    this.formMode.set(null);
  }

  cancelForm(): void {
    this.formMode.set(null);
  }

  deleteMember(member: TeamMember): void {
    this.pendingDelete.set(member);
  }

  confirmDelete(): void {
    const member = this.pendingDelete();
    if (!member) return;
    this.pendingDelete.set(null);
    this.teamStore.remove(member.id);
  }
}
