import { Component, computed, effect, inject, Injectable, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { isValidDate, textInRange } from '../../shared/validation/validation';
import { TeamMember, TeamStore } from '../team/team';
import { ConfirmDelete } from '../../shared/confirm-delete/confirm-delete';

interface ProjectTask {
  id: number;
  title: string;
  status: string;
  statusClass: string;
  assignee: string;
  dueDate: string;
}

interface ProjectCard {
  id: number;
  name: string;
  description: string;
  dueDate: string;
  startDate: string;
  owner: string;
  status: 'active' | 'archived';
  taskCount: number;
  completedTasks: number;
  members: { userId: number; initials: string; name: string; role: string }[];
  tasks: ProjectTask[];
}

interface ProjectDraft {
  name: string;
  description: string;
  startDate: string;
  dueDate: string;
  owner: string;
  status: 'active' | 'archived';
}

const initialProjects: ProjectCard[] = [
  {
    id: 1,
    name: 'TeamFlow webalkalmazás',
    description: 'A csapat közös feladatkezelő alkalmazása.',
    dueDate: '2026.12.11.',
    startDate: '2026.11.16.',
    owner: 'Kiss Anna',
    status: 'active',
    taskCount: 4,
    completedTasks: 1,
    members: [
      { userId: 1, initials: 'KA', name: 'Kiss Anna', role: 'UI és routing' },
      { userId: 2, initials: 'NB', name: 'Nagy Bence', role: 'API és űrlapok' },
    ],
    tasks: [
      { id: 1, title: 'Reszponzív feladatlista', status: 'Folyamatban', statusClass: 'badge--progress', assignee: 'Kiss Anna', dueDate: '12.04.' },
      { id: 2, title: 'API service réteg', status: 'Tervezett', statusClass: 'badge--planned', assignee: 'Nagy Bence', dueDate: '12.05.' },
      { id: 3, title: 'Dashboard statisztikák', status: 'Kész', statusClass: 'badge--done', assignee: 'Kiss Anna', dueDate: '12.03.' },
      { id: 4, title: 'Űrlap validáció', status: 'Tervezett', statusClass: 'badge--planned', assignee: 'Nagy Bence', dueDate: '12.07.' },
    ],
  },
  {
    id: 2,
    name: 'Dokumentáció és bemutató',
    description: 'Tesztelés, dokumentáció és angol prezentáció.',
    dueDate: '2026.12.11.',
    startDate: '2026.11.16.',
    owner: 'Kiss Anna',
    status: 'active',
    taskCount: 2,
    completedTasks: 0,
    members: [
      { userId: 1, initials: 'KA', name: 'Kiss Anna', role: 'Dokumentáció' },
      { userId: 2, initials: 'NB', name: 'Nagy Bence', role: 'Prezentáció' },
    ],
    tasks: [
      { id: 5, title: 'Projekt részletező', status: 'Folyamatban', statusClass: 'badge--progress', assignee: 'Kiss Anna', dueDate: '12.08.' },
      { id: 6, title: 'Angol prezentáció', status: 'Tervezett', statusClass: 'badge--planned', assignee: 'Nagy Bence', dueDate: '12.11.' },
    ],
  },
];

function createProjectDraft(): ProjectDraft {
  return {
    name: '',
    description: '',
    startDate: '',
    dueDate: '',
    owner: '',
    status: 'active',
  };
}

@Injectable({ providedIn: 'root' })
class ProjectStore {
  readonly projects = signal(initialProjects);

  create(draft: ProjectDraft, owner: TeamMember): number {
    const id = Math.max(0, ...this.projects().map((project) => project.id)) + 1;
    this.projects.update((projects) => [
      ...projects,
      {
        ...draft,
        id,
        taskCount: 0,
        completedTasks: 0,
        members: [{ userId: owner.id, initials: owner.initials, name: owner.name, role: 'Tulajdonos' }],
        tasks: [],
      },
    ]);
    return id;
  }

  setMembers(projectId: number, members: ProjectCard['members']): void {
    this.projects.update((projects) => projects.map((project) => project.id === projectId ? { ...project, members } : project));
  }
}

@Component({
  imports: [CommonModule, FormsModule, RouterLink, Sidebar, ConfirmDelete],
  selector: 'app-projects',
  styleUrl: './projects.css',
  templateUrl: './projects.html',
})
export class Projects {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projectStore = inject(ProjectStore);
  private readonly teamStore = inject(TeamStore);
  readonly projects = this.projectStore.projects;
  readonly teamMembers = this.teamStore.members;
  readonly projectId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: this.route.snapshot.paramMap.get('id') },
  );
  readonly isNew = toSignal(
    this.route.url.pipe(map((segments) => segments.some((segment) => segment.path === 'new'))),
    { initialValue: this.route.snapshot.url.some((segment) => segment.path === 'new') },
  );
  readonly isDetail = computed(() => this.projectId() !== null && !this.isNew());
  readonly selectedProject = computed(
    () => this.projects().find((project) => project.id === Number(this.projectId())) ?? this.projects()[0],
  );
  draft: ProjectDraft = createProjectDraft();
  validationError = '';
  memberFormOpen = false;
  memberUserId = 0;
  memberRole = '';
  editingMemberId: number | null = null;
  memberError = '';
  pendingMemberRemoval: { projectId: number; userId: number; name: string } | null = null;

  createProject(): void {
    const draft = {
      ...this.draft,
      name: this.draft.name.trim(),
      description: this.draft.description.trim(),
      owner: this.draft.owner.trim(),
    };
    const owner = this.teamMembers().find((member) => member.name === draft.owner);
    if (!textInRange(draft.name, 3, 80) || draft.description.length > 1000 ||
        !owner || (draft.status !== 'active' && draft.status !== 'archived') ||
        !isValidDate(draft.startDate) || !isValidDate(draft.dueDate) ||
        draft.dueDate < draft.startDate) {
      this.validationError = 'A név 3–80 karakteres legyen, a leírás legfeljebb 1000 karakteres. A tulajdonos és a dátumok kötelezők; a határidő nem lehet korábbi a kezdésnél.';
      return;
    }
    this.validationError = '';
    const projectId = this.projectStore.create(draft, owner);
    void this.router.navigate(['/projects', projectId]);
  }

  cancelCreate(): void {
    void this.router.navigate(['/projects']);
  }

  startMemberEdit(member?: ProjectCard['members'][number]): void {
    this.editingMemberId = member?.userId ?? null;
    this.memberUserId = member?.userId ?? 0;
    this.memberRole = member?.role ?? '';
    this.memberError = '';
    this.memberFormOpen = true;
  }

  saveMember(): void {
    const project = this.selectedProject();
    const user = this.teamMembers().find((member) => member.id === Number(this.memberUserId));
    const role = this.memberRole.trim();
    if (!user || !textInRange(role, 2, 40) ||
        project.members.some((member) => member.userId === user.id && member.userId !== this.editingMemberId) ||
        (this.editingMemberId !== null && this.editingMemberId !== user.id)) {
      this.memberError = 'Válassz egy még nem szereplő csapattagot; a szerepkör 2–40 karakteres legyen.';
      return;
    }
    const updated = { userId: user.id, name: user.name, initials: user.initials, role };
    const members = this.editingMemberId === null
      ? [...project.members, updated]
      : project.members.map((member) => member.userId === this.editingMemberId ? updated : member);
    this.projectStore.setMembers(project.id, members);
    this.memberFormOpen = false;
  }

  removeMember(userId: number): void {
    const project = this.selectedProject();
    const member = project.members.find((item) => item.userId === userId);
    if (member) this.pendingMemberRemoval = { projectId: project.id, userId, name: member.name };
  }

  confirmMemberRemoval(): void {
    const pending = this.pendingMemberRemoval;
    if (!pending) return;
    const project = this.projects().find((item) => item.id === pending.projectId);
    this.pendingMemberRemoval = null;
    if (project) this.projectStore.setMembers(project.id, project.members.filter((member) => member.userId !== pending.userId));
  }
}
