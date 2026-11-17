import { Component, computed, effect, inject, Injectable, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { isValidDate, textInRange } from '../../shared/validation/validation';
import { ConfirmDelete } from '../../shared/confirm-delete/confirm-delete';
import { Task } from '../../models/task';
import { TaskService } from '../../core/api/task.service';

interface TaskChecklist {
  id: number;
  taskId: number;
  text: string;
  done: boolean;
}

interface TaskComment {
  id: number;
  taskId: number;
  author: string;
  body: string;
  createdAt: string;
}

interface TaskTimeEntry {
  id: number;
  taskId: number;
  user: string;
  minutes: number;
  date: string;
  note: string;
}

function createTaskDraft(): Task {
  return {
    id: 0,
    title: '',
    project: '',
    description: '',
    status: 'Tervezett',
    statusClass: 'badge--planned',
    priority: 'Normál',
    assignee: '',
    dueDate: '',
    estimate: '1',
    tracked: '0',
  };
}

@Injectable({ providedIn: 'root' })
class TaskStore {
  private readonly api = inject(TaskService);
  readonly tasks = signal<Task[]>([]);
  readonly loadState = signal<'loading' | 'ready' | 'error'>('loading');
  readonly checklist = signal<TaskChecklist[]>([
    { id: 1, taskId: 1, text: 'Asztali táblázat', done: true },
    { id: 2, taskId: 1, text: 'Mobil kártyák', done: false },
    { id: 3, taskId: 1, text: 'Billentyűzetes bejárás', done: false },
  ]);
  readonly comments = signal<TaskComment[]>([
    { id: 1, taskId: 1, author: 'Nagy Bence', body: 'A mobil nézetnél legyenek kártyák.', createdAt: '2026-11-16T10:00:00.000Z' },
    { id: 2, taskId: 1, author: 'Kiss Anna', body: 'Rendben, a szűrőket is átrendezem.', createdAt: '2026-11-16T10:05:00.000Z' },
  ]);
  readonly timeEntries = signal<TaskTimeEntry[]>([
    { id: 1, taskId: 1, user: 'Kiss Anna', minutes: 90, date: '2026-11-16', note: 'Asztali elrendezés' },
    { id: 2, taskId: 1, user: 'Nagy Bence', minutes: 60, date: '2026-11-16', note: '' },
  ]);

  constructor() {
    this.load();
  }

  load(): void {
    this.loadState.set('loading');
    this.api.list().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.loadState.set('ready');
      },
      error: () => this.loadState.set('error'),
    });
  }

  updateLocal(task: Task): void {
    this.tasks.update((tasks) => tasks.map((item) => item.id === task.id ? task : item));
  }

  removeLocal(id: number): void {
    this.tasks.update((tasks) => tasks.filter((task) => task.id !== id));
    this.checklist.update((items) => items.filter((item) => item.taskId !== id));
    this.comments.update((items) => items.filter((item) => item.taskId !== id));
    this.timeEntries.update((items) => items.filter((item) => item.taskId !== id));
  }
}

@Component({
  imports: [CommonModule, FormsModule, RouterLink, Sidebar, ConfirmDelete],
  selector: 'app-tasks',
  styleUrl: './tasks.css',
  templateUrl: './tasks.html',
})
export class Tasks {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly taskStore = inject(TaskStore);
  private readonly taskApi = inject(TaskService);
  readonly tasks = this.taskStore.tasks;
  readonly loadState = this.taskStore.loadState;
  readonly saving = signal(false);
  operationError = '';
  readonly searchText = signal('');
  readonly pendingDelete = signal<Task | null>(null);
  readonly pendingChecklistDelete = signal<TaskChecklist | null>(null);
  readonly filteredTasks = computed(() => {
    const query = this.searchText().trim().toLocaleLowerCase('hu');
    return this.tasks().filter((task) =>
      [task.title, task.description, task.project, task.assignee].some((value) =>
        value.toLocaleLowerCase('hu').includes(query),
      ),
    );
  });
  readonly taskId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: this.route.snapshot.paramMap.get('id') },
  );
  readonly isEditing = toSignal(
    this.route.url.pipe(map((segments) => segments.some((segment) => segment.path === 'edit'))),
    { initialValue: this.route.snapshot.url.some((segment) => segment.path === 'edit') },
  );
  readonly isDetail = computed(() => this.taskId() !== null && this.taskId() !== 'new');
  readonly selectedTask = computed(() => this.tasks().find((task) => task.id === Number(this.taskId())));
  reloadTasks(): void {
    if (this.loadState() !== 'loading') this.taskStore.load();
  }
  readonly isNew = toSignal(
    this.route.url.pipe(map((segments) => segments.some((segment) => segment.path === 'new'))),
    { initialValue: this.route.snapshot.url.some((segment) => segment.path === 'new') },
  );
  draft: Task = createTaskDraft();
  validationError = '';
  checklistText = '';
  editingChecklistId: number | null = null;
  checklistError = '';
  commentBody = '';
  commentError = '';
  timeDraft = { minutes: 0, date: '', note: '' };
  timeError = '';
  readonly checklist = computed(() => this.taskStore.checklist().filter((item) => item.taskId === this.selectedTask()?.id));
  readonly comments = computed(() => this.taskStore.comments().filter((item) => item.taskId === this.selectedTask()?.id));
  readonly timeEntries = computed(() => this.taskStore.timeEntries().filter((item) => item.taskId === this.selectedTask()?.id));

  saveChecklist(): void {
    const task = this.selectedTask();
    if (!task) {
      this.checklistError = 'A feladat nem található.';
      return;
    }
    const text = this.checklistText.trim();
    if (!textInRange(text, 1, 120)) {
      this.checklistError = 'Az ellenőrzőlista szövege 1–120 karakteres legyen.';
      return;
    }
    const taskId = task.id;
    this.taskStore.checklist.update((items) => {
      if (this.editingChecklistId !== null) {
        return items.map((item) => item.id === this.editingChecklistId && item.taskId === taskId ? { ...item, text } : item);
      }
      const id = Math.max(0, ...items.map((item) => item.id)) + 1;
      return [...items, { id, taskId, text, done: false }];
    });
    this.checklistText = '';
    this.editingChecklistId = null;
    this.checklistError = '';
  }

  editChecklist(item: TaskChecklist): void {
    this.editingChecklistId = item.id;
    this.checklistText = item.text;
    this.checklistError = '';
  }

  toggleChecklist(item: TaskChecklist, done: boolean): void {
    this.taskStore.checklist.update((items) => items.map((entry) => entry.id === item.id ? { ...entry, done } : entry));
  }

  deleteChecklist(item: TaskChecklist): void {
    this.pendingChecklistDelete.set(item);
  }

  confirmChecklistDelete(): void {
    const item = this.pendingChecklistDelete();
    if (!item) return;
    this.pendingChecklistDelete.set(null);
    this.taskStore.checklist.update((items) => items.filter((entry) => entry.id !== item.id));
    if (this.editingChecklistId === item.id) {
      this.editingChecklistId = null;
      this.checklistText = '';
    }
  }

  saveComment(): void {
    const task = this.selectedTask();
    if (!task) {
      this.commentError = 'A feladat nem található.';
      return;
    }
    const body = this.commentBody.trim();
    if (!textInRange(body, 1, 500)) {
      this.commentError = 'A hozzászólás 1–500 karakteres legyen.';
      return;
    }
    this.taskStore.comments.update((comments) => [
      ...comments,
      { id: Math.max(0, ...comments.map((comment) => comment.id)) + 1, taskId: task.id, author: 'Kiss Anna', body, createdAt: new Date().toISOString() },
    ]);
    this.commentBody = '';
    this.commentError = '';
  }

  saveTimeEntry(): void {
    const task = this.selectedTask();
    if (!task || this.saving()) {
      this.timeError = 'A feladat nem található, vagy mentés van folyamatban.';
      return;
    }
    const minutes = Number(this.timeDraft.minutes);
    const note = this.timeDraft.note.trim();
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 480 ||
        !isValidDate(this.timeDraft.date) || note.length > 200) {
      this.timeError = 'Az idő 1–480 egész perc, a dátum kötelező, a megjegyzés legfeljebb 200 karakter lehet.';
      return;
    }
    const existingHours = Number(task.tracked.replace(',', '.').replace(/\s*óra$/, ''));
    if (!Number.isFinite(existingHours)) {
      this.timeError = 'A feladat rögzített ideje érvénytelen.';
      return;
    }
    const date = this.timeDraft.date;
    const tracked = `${Number((existingHours + minutes / 60).toFixed(2)).toString().replace('.', ',')} óra`;
    this.timeError = '';
    this.saving.set(true);
    this.taskApi.update(task.id, { tracked }).subscribe({
      next: (updated) => {
        this.taskStore.updateLocal(updated);
        this.taskStore.timeEntries.update((entries) => [
          ...entries,
          { id: Math.max(0, ...entries.map((entry) => entry.id)) + 1, taskId: task.id, user: 'Kiss Anna', minutes, date, note },
        ]);
        this.timeDraft = { minutes: 0, date: '', note: '' };
        this.saving.set(false);
      },
      error: () => {
        this.timeError = 'Az idő rögzítése nem sikerült. Próbáld újra.';
        this.saving.set(false);
      },
    });
  }

  constructor() {
    effect(() => {
      if (this.isNew()) {
        this.draft = createTaskDraft();
      } else if (this.isEditing() && this.selectedTask()) {
        this.draft = { ...this.selectedTask()! };
      }
    });
    effect(() => {
      this.taskId();
      this.checklistText = '';
      this.editingChecklistId = null;
      this.checklistError = '';
      this.commentBody = '';
      this.commentError = '';
      this.timeDraft = { minutes: 0, date: '', note: '' };
      this.timeError = '';
      this.validationError = '';
      this.pendingDelete.set(null);
      this.pendingChecklistDelete.set(null);
    });
  }

  startEditing(): void {
    const task = this.selectedTask();
    if (!task) {
      this.operationError = 'A feladat nem található.';
      return;
    }
    this.draft = { ...task };
    void this.router.navigate(['/tasks', task.id, 'edit']);
  }

  saveTask(): void {
    if (this.saving()) return;
    const title = this.draft.title.trim();
    const description = this.draft.description.trim();
    const estimateText = String(this.draft.estimate).trim().replace(',', '.').replace(/\s*óra$/, '');
    const estimate = Number(estimateText);
    if (!textInRange(title, 3, 80) || description.length > 1000 ||
        !this.draft.project.trim() || !this.draft.assignee.trim() ||
        !this.draft.status.trim() || !this.draft.priority.trim() || !isValidDate(this.draft.dueDate) ||
        !estimateText || !Number.isFinite(estimate) || estimate < 0.5 || estimate > 100) {
      this.validationError = 'A cím 3–80 karakteres, a leírás legfeljebb 1000 karakteres legyen. A projekt, felelős, állapot, prioritás és érvényes határidő kötelező; a becslés 0,5–100 óra lehet.';
      return;
    }
    this.validationError = '';
    this.draft = {
      ...this.draft,
      title,
      description,
      project: this.draft.project.trim(),
      assignee: this.draft.assignee.trim(),
      status: this.draft.status.trim(),
      priority: this.draft.priority.trim(),
      dueDate: this.draft.dueDate.trim(),
      estimate: String(estimate),
      tracked: this.draft.tracked.trim(),
    };
    this.draft.statusClass = {
      Folyamatban: 'badge--progress',
      Tervezett: 'badge--planned',
      Kész: 'badge--done',
    }[this.draft.status] ?? 'badge--planned';
    const isNew = this.isNew();
    const selected = this.selectedTask();
    if (!isNew && !selected) {
      this.validationError = 'A feladat nem található.';
      return;
    }
    const { id: _id, ...data } = this.draft;
    this.saving.set(true);
    this.operationError = '';
    const request = isNew ? this.taskApi.create(data) : this.taskApi.update(selected!.id, data);
    request.subscribe({
      next: (task) => {
        if (isNew) this.taskStore.tasks.update((tasks) => [...tasks, task]);
        else this.taskStore.updateLocal(task);
        this.saving.set(false);
        void this.router.navigate(['/tasks', task.id]);
      },
      error: () => {
        this.operationError = 'A feladat mentése nem sikerült. Próbáld újra.';
        this.saving.set(false);
      },
    });
  }

  cancelEditing(): void {
    const task = this.selectedTask();
    void this.router.navigate(this.isNew() || !task ? ['/tasks'] : ['/tasks', task.id]);
  }

  deleteTask(): void {
    const task = this.selectedTask();
    if (!task) {
      this.operationError = 'A feladat nem található.';
      return;
    }
    this.pendingDelete.set(task);
  }

  confirmDelete(): void {
    const task = this.pendingDelete();
    if (!task || this.saving()) return;
    this.pendingDelete.set(null);
    this.operationError = '';
    this.saving.set(true);
    this.taskApi.remove(task.id).subscribe({
      next: () => {
        this.taskStore.removeLocal(task.id);
        this.saving.set(false);
        void this.router.navigate(['/tasks']);
      },
      error: () => {
        this.operationError = 'A feladat törlése nem sikerült. Próbáld újra.';
        this.saving.set(false);
      },
    });
  }
}
