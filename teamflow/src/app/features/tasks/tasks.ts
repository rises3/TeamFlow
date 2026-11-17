import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

interface Task {
  id: number;
  title: string;
  project: string;
  description: string;
  status: string;
  statusClass: string;
  priority: string;
  assignee: string;
  dueDate: string;
  estimate: string;
  tracked: string;
}

const emptyTask: Task = {
  id: 0, title: '', project: '', description: '', status: '', statusClass: '',
  priority: '', assignee: '', dueDate: '', estimate: '', tracked: '',
};

@Component({
  imports: [CommonModule, FormsModule, RouterLink],
  selector: 'app-tasks',
  styleUrl: './tasks.css',
  templateUrl: './tasks.html',
})
export class Tasks {
  private readonly route = inject(ActivatedRoute);
  readonly tasks = computed<Task[]>(() => []);
  readonly taskId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: this.route.snapshot.paramMap.get('id') },
  );
  readonly isEditing = toSignal(
    this.route.url.pipe(map((segments) => segments.some((segment) => segment.path === 'edit'))),
    { initialValue: this.route.snapshot.url.some((segment) => segment.path === 'edit') },
  );
  readonly isDetail = computed(() => this.taskId() !== null && this.taskId() !== 'new');
  readonly selectedTask = computed(() => emptyTask);
  readonly isNew = toSignal(
    this.route.url.pipe(map((segments) => segments.some((segment) => segment.path === 'new'))),
    { initialValue: this.route.snapshot.url.some((segment) => segment.path === 'new') },
  );
  draft: Task = { ...emptyTask };

  startEditing(): void {
  }

  saveTask(): void {
  }

  cancelEditing(): void {
  }

  deleteTask(): void {
  }
}
