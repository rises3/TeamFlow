import { Routes } from '@angular/router';
import { Tasks } from './features/tasks/tasks';
import { Projects } from './features/projects/projects';
import { Team } from './features/team/team';
import { NotFound } from './features/not-found/not-found';

export const routes: Routes = [
     {path: "", redirectTo: "dashboard"},
     {path: "dashboard", component: Tasks},
     {path: "tasks/new", component: Tasks},
     {path: "tasks/:id", component: Tasks},
     {path: "tasks/:id/edit", component: Tasks},
     {path: "projects", component: Projects},
     {path: "projects/:id", component: Projects},
     {path: "team", component: Team},
     {path: "admin/:resource", component: Team},
     {path: "**", component: NotFound}
     



];
