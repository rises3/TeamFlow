import { Injectable } from '@angular/core';
import { Task } from '../../models/task';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class TaskService extends CrudService<Task> {
  protected readonly path = 'tasks';
}
