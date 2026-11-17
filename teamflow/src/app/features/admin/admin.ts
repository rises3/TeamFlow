import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

type AdminResource = 'labels' | 'statuses' | 'priorities';

interface AdminEntry {
  id: number;
  name: string;
  detail: string;
  color?: string;
}

const resourceDetails: Record<AdminResource, { title: string; description: string; addLabel: string; column: string }> = {
  labels: { title: 'Címkék', description: 'Címkék, állapotok és prioritások kezelése.', addLabel: '+ Új címke', column: 'Szín' },
  statuses: { title: 'Állapotok', description: 'A feladatok állapotainak kezelése.', addLabel: '+ Új állapot', column: 'Szín' },
  priorities: { title: 'Prioritások', description: 'A feladatok prioritási szintjeinek kezelése.', addLabel: '+ Új prioritás', column: 'Szint' },
};

@Component({
  imports: [CommonModule, RouterLink],
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
  readonly items = computed<AdminEntry[]>(() => []);
}
