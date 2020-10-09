import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppManageComponent } from './app-manage.component';
import { RouterModule, Routes } from '@angular/router';
import { IconsModule } from 'src/app/utils/icons/icons.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ColorPickerModule } from 'src/app/utils/color-picker/color-picker.module';
import { ClickOutsideModule } from 'src/app/utils/directives/click-outside/click-outside.module';
import { AppCenterPreviewModule } from 'src/app/utils/app-center-preview/app-center-preview.module';
import { SearchBoxModule } from 'src/app/utils/search-box/search-box.module';
import { FilterUserModule } from 'src/app/utils/pipes/filter-user.module';
import { BasicInfoModule } from 'src/app/utils/basic-info/basic-info.module';
import { DeleteModalModule } from 'src/app/utils/delete-modal/delete-modal.module';
import { AppPanelGuard } from 'src/app/utils/guards/app-panel.guard';
import { CheckboxModule } from 'src/app/utils/checkbox/checkbox.module';
import { UploadImageModule } from 'src/app/utils/upload-image/upload-image.module';
const routes: Routes = [
  { path: '', component: AppManageComponent, canActivate: [AppPanelGuard] },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    IconsModule,
    NgbModule,
    FormsModule,
    ColorPickerModule,
    ReactiveFormsModule,
    ClickOutsideModule,
    AppCenterPreviewModule,
    SearchBoxModule,
    FilterUserModule,
    BasicInfoModule,
    DeleteModalModule,
    CheckboxModule,
    UploadImageModule
  ],
  exports: [
    RouterModule
  ],
  declarations: [AppManageComponent]
})
export class AppManageModule { }
