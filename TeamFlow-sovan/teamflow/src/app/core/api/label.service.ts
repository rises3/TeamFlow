import { Injectable } from '@angular/core';
import { CrudService } from './crud.service';
import { Label } from '../../models/label';

@Injectable({ providedIn: 'root' })
export class LabelService extends CrudService<Label> {
  protected readonly path = 'labels';
}
