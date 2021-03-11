import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserListCellRendererComponent } from './user-list-cell-renderer.component';
import { DateFormatModule } from '../date-format/date-format.module';

@NgModule({
    declarations: [UserListCellRendererComponent],
    imports: [CommonModule, DateFormatModule],
    exports: [UserListCellRendererComponent]
})
export class UserListCellRendererModule {}
