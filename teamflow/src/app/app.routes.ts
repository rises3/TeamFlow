import { Routes } from '@angular/router';
import { Tasks } from './tasks/tasks';
import { Statuses } from './statuses/statuses';
import { Priorities } from './priorities/priorities';
import { Comments } from './comments/comments';
import { Checklistitems } from './checklistitems/checklistitems';

export const routes: Routes = [
     {path: "", component: Tasks},
     {path: "statuses", component: Statuses},
     {path: "priorities", component: Priorities},
     {path: "comments", component: Comments},
     {path: "checklistitems", component: Checklistitems}


];
