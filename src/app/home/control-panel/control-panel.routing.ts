import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ControlPanelComponent } from './control-panel.component';
import { UserComponent } from './user/user.component';
import { ControlPanelGuard } from '../../utils/guards/control-panel.guard';
import { SelectedAccessComponent } from './selected-access/selectedAccess.component';
import { UserGroupComponent } from './user-group/user-group.component';
import { UserGroupManageComponent } from './user-group/user-group-manage/user-group-manage.component';
import { UserGuard } from 'src/app/utils/guards/user.guard';
import { GroupGuard } from 'src/app/utils/guards/group.guard';
import { RouteGuard } from 'src/app/utils/guards/route.guard';
import { BookmarksComponent } from './bookmarks/bookmarks.component';
import { BookmarkGuard } from 'src/app/utils/guards/bookmark.guard';
import { WorkitemsComponent } from 'src/app/home/control-panel/workitems/workitems.component';
import { BulkImportComponent } from './user/bulk-import/bulk-import.component';
import { BulkImportStatusComponent } from './user/bulk-import-status/bulk-import-status.component';

const controlPanelRoutes: Routes = [
  {
    path: '',
    component: ControlPanelComponent,
    canActivate: [ControlPanelGuard],
    canActivateChild: [ControlPanelGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'user' },
      { path: 'user', component: UserComponent, canActivate: [UserGuard] },
      { path: 'user/bulk-import', component: BulkImportComponent, canActivate: [UserGuard] },
      { path: 'user/bulk-import/:id', component: BulkImportStatusComponent, canActivate: [UserGuard] },
      { path: 'gr', component: UserGroupComponent, canActivate: [GroupGuard] },
      { path: 'gm/:id', component: UserGroupManageComponent, canActivate: [GroupGuard], canDeactivate: [RouteGuard] },
      { path: 'selectedaccess', component: SelectedAccessComponent },
      // { path: 'bookmarks', component: BookmarksComponent, canActivate: [BookmarkGuard] },
      { path: 'workflow', component: WorkitemsComponent }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(
      controlPanelRoutes
    )
  ],
  exports: [
    RouterModule
  ],
  providers: []
})
export class ControlPanelRoutingModule { }
