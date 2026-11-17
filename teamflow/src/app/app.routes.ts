import { Routes } from '@angular/router';
import { Tasks } from './features/tasks/tasks';
import { Projects } from './features/projects/projects';
import { Team } from './features/team/team';
import { Admin } from './features/admin/admin';
import { NotFound } from './features/not-found/not-found';
import { Dashboard } from './features/dashboard/dashboard';

export const routes: Routes = [
     {path: "", redirectTo: "dashboard", pathMatch: "full"},
     {path: "dashboard", component: Dashboard},
     {path: "tasks", component: Tasks},
     {path: "tasks/new", component: Tasks},
     {path: "tasks/:id", component: Tasks},
     {path: "tasks/:id/edit", component: Tasks},
     {path: "projects", component: Projects},
     {path: "projects/new", component: Projects},
     {path: "projects/:id", component: Projects},
     {path: "team", component: Team},
     {path: "admin", redirectTo: "admin/labels", pathMatch: "full"},
     {path: "admin/:resource", component: Admin},
     {path: "**", component: NotFound}
     



];
