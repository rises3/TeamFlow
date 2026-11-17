import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { textInRange } from '../../shared/validation/validation';
import { ConfirmDelete } from '../../shared/confirm-delete/confirm-delete';

type AdminResource = 'labels' | 'statuses' | 'priorities';

interface AdminEntry {
  id: number;
  name: string;
  detail: string;
  color?: string;
  key?: string;
  order?: number;
}

const entries: Record<AdminResource, AdminEntry[]> = {
  labels: [
    { id: 1, name: 'Frontend', detail: '#315CF8', color: '#315CF8' },
    { id: 2, name: 'UI', detail: '#7C3AED', color: '#7C3AED' },
    { id: 3, name: 'API', detail: '#0F766E', color: '#0F766E' },
  ],
  statuses: [
    { id: 1, name: 'Tervezett', detail: 'planned', color: '#64748B', key: 'planned', order: 1 },
    { id: 2, name: 'Folyamatban', detail: 'in_progress', color: '#315CF8', key: 'in_progress', order: 2 },
    { id: 3, name: 'Kész', detail: 'done', color: '#0F766E', key: 'done', order: 3 },
  ],
  priorities: [
    { id: 1, name: 'Alacsony', detail: '1' },
    { id: 2, name: 'Normál', detail: '2' },
    { id: 3, name: 'Magas', detail: '3' },
  ],
};

function copyEntries(): Record<AdminResource, AdminEntry[]> {
  return {
    labels: entries.labels.map((entry) => ({ ...entry })),
    statuses: entries.statuses.map((entry) => ({ ...entry })),
    priorities: entries.priorities.map((entry) => ({ ...entry })),
  };
}

const resourceDetails: Record<AdminResource, { title: string; description: string; addLabel: string; column: string }> = {
  labels: { title: 'Címkék', description: 'Címkék, állapotok és prioritások kezelése.', addLabel: '+ Új címke', column: 'Szín' },
  statuses: { title: 'Állapotok', description: 'A feladatok állapotainak kezelése.', addLabel: '+ Új állapot', column: 'Szín' },
  priorities: { title: 'Prioritások', description: 'A feladatok prioritási szintjeinek kezelése.', addLabel: '+ Új prioritás', column: 'Szint' },
};

@Component({
  imports: [CommonModule, FormsModule, RouterLink, Sidebar, ConfirmDelete],
  selector: 'app-admin',
  templateUrl: './admin.html',
})
export class Admin {
  private readonly route = inject(ActivatedRoute);
  private readonly routeResource = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('resource'))),
    { initialValue: this.route.snapshot.paramMap.get('resource') },
  );

  readonly resource = computed<AdminResource>(() => {
    const resource = this.routeResource();
    return resource === 'statuses' || resource === 'priorities' ? resource : 'labels';
  });
  readonly page = computed(() => resourceDetails[this.resource()]);
  private readonly data = signal(copyEntries());
  readonly items = computed(() => this.data()[this.resource()]);
  readonly formOpen = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly pendingDelete = signal<{ item: AdminEntry; resource: AdminResource } | null>(null);
  draft: AdminEntry = { id: 0, name: '', detail: '', color: '#315CF8' };
  validationError = '';

  startCreate(): void {
    this.validationError = '';
    const resource = this.resource();
    const nextLevel = Math.max(0, ...this.items().map((item) => Number(item.detail) || 0)) + 1;
    this.draft = {
      id: 0,
      name: '',
      detail: resource === 'priorities' ? String(nextLevel) : '#315CF8',
      color: '#315CF8',
      key: '',
      order: resource === 'statuses' ? Math.max(0, ...this.items().map((item) => item.order ?? 0)) + 1 : undefined,
    };
    this.editingId.set(null);
    this.formOpen.set(true);
  }

  startEdit(item: AdminEntry): void {
    this.validationError = '';
    this.draft = { ...item, detail: item.color ?? item.detail };
    this.editingId.set(item.id);
    this.formOpen.set(true);
  }

  saveEntry(): void {
    const name = this.draft.name.trim();
    const detail = String(this.draft.detail).trim();
    const resource = this.resource();
    const currentEntries = this.data()[resource];
    const key = this.draft.key?.trim() ?? '';
    const order = Number(this.draft.order);
    const original = currentEntries.find((item) => item.id === this.editingId());
    if (!textInRange(name, 2, 30) ||
        (resource === 'priorities' && (!Number.isInteger(Number(detail)) || Number(detail) < 1)) ||
        (resource !== 'priorities' && !/^#[0-9a-f]{6}$/i.test(detail)) ||
        (resource === 'statuses' && (!/^[a-z][a-z0-9_]*$/.test(key) ||
          !Number.isInteger(order) || order < 1 ||
          (original !== undefined && original.key !== key) ||
          currentEntries.some((item) => item.id !== this.editingId() && item.key === key)))) {
      this.validationError = 'A név 2–30 karakteres legyen. A szín #RRGGBB formátumú, a szint és a sorrend pozitív egész, az állapot kulcsa egyedi kisbetűs technikai név legyen.';
      return;
    }
    this.validationError = '';
    const color = resource === 'priorities' ? undefined : detail;
    const id = this.editingId() ?? Math.max(0, ...currentEntries.map((item) => item.id)) + 1;
    const updatedEntry: AdminEntry = resource === 'statuses'
      ? { id, name, detail: key, color, key, order }
      : { id, name, detail, color };
    this.data.update((data) => ({
      ...data,
      [resource]: this.editingId() === null
        ? [...data[resource], updatedEntry]
        : data[resource].map((item) => item.id === id ? updatedEntry : item),
    }));
    this.cancelForm();
  }

  deleteEntry(item: AdminEntry): void {
    this.pendingDelete.set({ item, resource: this.resource() });
  }

  confirmDelete(): void {
    const pending = this.pendingDelete();
    if (!pending) return;
    this.pendingDelete.set(null);
    this.data.update((data) => ({
      ...data,
      [pending.resource]: data[pending.resource].filter((entry) => entry.id !== pending.item.id),
    }));
  }

  cancelForm(): void {
    this.formOpen.set(false);
    this.editingId.set(null);
  }
}
