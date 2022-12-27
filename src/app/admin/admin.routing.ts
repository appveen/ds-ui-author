import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from 'src/app/admin/admin.component';
import { AppListComponent } from 'src/app/admin/app-list/app-list.component';
import { UserListComponent } from 'src/app/admin/user-list/user-list.component';
import { AppManageComponent } from 'src/app/admin/app-manage/app-manage.component';
import { AgentsComponent } from './agents/agents.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'apps' },
      { path: 'apps', component: AppListComponent },
      { path: 'apps/:id', component: AppManageComponent },
      { path: 'users', component: UserListComponent },
      { path: 'agents', component: AgentsComponent },
      { path: 'integration', component: AgentsComponent },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
