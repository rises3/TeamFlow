import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CrudService } from './crud.service';
import { ProjectMember } from '../../models/project-member';

@Injectable({ providedIn: 'root' })
export class ProjectMemberService extends CrudService<ProjectMember> {
  protected readonly path = 'projectMembers';

  listByProject(projectId: number): Observable<ProjectMember[]> {
    return this.list(new HttpParams().set('projectId', projectId));
  }

  listByUser(userId: number): Observable<ProjectMember[]> {
    return this.list(new HttpParams().set('userId', userId));
  }
}
