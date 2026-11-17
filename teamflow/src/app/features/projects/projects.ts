import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

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
  taskCount: number;
  completedTasks: number;
  members: { initials: string; name: string; role: string }[];
  tasks: ProjectTask[];
}

interface ProjectDraft {
  name: string;
  description: string;
  startDate: string;
  dueDate: string;
  owner: string;
}

@Component({
  imports: [CommonModule, FormsModule, RouterLink],
  selector: 'app-projects',
  styleUrl: './projects.css',
  templateUrl: './projects.html',
})
export class Projects {
  private readonly route = inject(ActivatedRoute);
  readonly projects = computed<ProjectCard[]>(() => []);
  readonly projectId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: this.route.snapshot.paramMap.get('id') },
  );
  readonly isNew = toSignal(
    this.route.url.pipe(map((segments) => segments.some((segment) => segment.path === 'new'))),
    { initialValue: this.route.snapshot.url.some((segment) => segment.path === 'new') },
  );
  readonly isDetail = computed(() => this.projectId() !== null && !this.isNew());
  readonly selectedProject = computed<ProjectCard>(() => ({
    id: 0,
    name: '',
    description: '',
    dueDate: '',
    startDate: '',
    owner: '',
    taskCount: 0,
    completedTasks: 0,
    members: [],
    tasks: [],
  }));
  draft: ProjectDraft = { name: '', description: '', startDate: '', dueDate: '', owner: '' };

  createProject(): void {
  }

  cancelCreate(): void {
  }
}
