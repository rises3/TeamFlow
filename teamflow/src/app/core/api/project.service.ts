import { Injectable } from '@angular/core';
import { CrudService } from './crud.service';
import { Project } from '../../models/project';

@Injectable({ providedIn: 'root' })
export class ProjectService extends CrudService<Project> {
  protected readonly path = 'projects';
}
