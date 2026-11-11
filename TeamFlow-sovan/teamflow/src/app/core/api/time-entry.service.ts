import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CrudService } from './crud.service';
import { TimeEntry } from '../../models/time-entry';

@Injectable({ providedIn: 'root' })
export class TimeEntryService extends CrudService<TimeEntry> {
  protected readonly path = 'timeEntries';

  listByTask(taskId: number): Observable<TimeEntry[]> {
    return this.list(new HttpParams().set('taskId', taskId));
  }

  listByUser(userId: number): Observable<TimeEntry[]> {
    return this.list(new HttpParams().set('userId', userId));
  }
}
