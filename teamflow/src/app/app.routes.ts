import { Routes } from '@angular/router';
import { Tasks } from './tasks/tasks';
import { Statuses } from './statuses/statuses';
import { Priorities } from './priorities/priorities';
import { Comments } from './comments/comments';
import { Checklistitems } from './checklistitems/checklistitems';
import { Projects } from './projects/projects';
import { Team } from './team/team';

export const routes: Routes = [
     {path: "", component: Tasks},
     {path: "tasks/new", component: Tasks},
     {path: "tasks/:id", component: Tasks},
     {path: "tasks/:id/edit", component: Tasks},
     {path: "projects", component: Projects},
     {path: "projects/:id", component: Projects},
     {path: "team", component: Team},
     {path: "statuses", component: Statuses},
     {path: "priorities", component: Priorities},
     {path: "comments", component: Comments},
     {path: "checklistitems", component: Checklistitems},



];
