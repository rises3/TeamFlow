import { Injectable } from '@angular/core';
import { CrudService } from './crud.service';
import { User } from '../../models/user';

@Injectable({ providedIn: 'root' })
export class UserService extends CrudService<User> {
  protected readonly path = 'users';
}
