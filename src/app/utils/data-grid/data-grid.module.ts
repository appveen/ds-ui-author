import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { DataGridComponent } from './data-grid.component';
import { TableCheckboxModule } from '../table-checkbox/table-checkbox.module';
import { ClickOutsideModule } from '../directives/click-outside/click-outside.module';
import { DataGridRowComponent } from './data-grid-row/data-grid-row.component';
import { DataGridCellComponent } from './data-grid-cell/data-grid-cell.component';
import { DataGridHeaderComponent } from './data-grid-header/data-grid-header.component';
import { RoundCheckModule } from '../round-check/round-check.module';
import { LoadingPlaceholderModule } from '../loading-placeholder/loading-placeholder.module';
import { DataGridDirective } from './data-grid.directive';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        TableCheckboxModule,
        ClickOutsideModule,
        RoundCheckModule,
        LoadingPlaceholderModule
    ],
    declarations: [DataGridComponent, DataGridRowComponent, DataGridCellComponent, DataGridHeaderComponent, DataGridDirective],
    exports: [DataGridComponent, DataGridRowComponent, DataGridCellComponent, DataGridHeaderComponent, DataGridDirective]
})
export class DataGridModule { }
