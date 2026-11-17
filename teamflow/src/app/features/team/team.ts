import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface TeamMember {
  id: number;
  initials: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

type MemberFormMode = 'create' | 'edit' | null;

@Component({
  imports: [CommonModule, FormsModule, RouterLink],
  selector: 'app-team',
  styleUrl: './team.css',
  templateUrl: './team.html',
})
export class Team {
  readonly members = signal<TeamMember[]>([]);
  readonly activeMemberCount = computed(() => this.members().filter((member) => member.active).length);
  readonly formMode = signal<MemberFormMode>(null);
  draft: Omit<TeamMember, 'id'> & { id?: number } = {
    initials: '', name: '', email: '', role: '', active: true,
  };

  startCreate(): void {
  }

  startEdit(_member: TeamMember): void {
  }

  saveMember(): void {
  }

  cancelForm(): void {
  }

  deleteMember(_member: TeamMember): void {
  }
}
