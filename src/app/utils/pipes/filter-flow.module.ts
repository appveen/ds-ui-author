import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterFlowPipe } from 'src/app/utils/pipes/filter-flow.pipe';


@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [FilterFlowPipe],
    exports: [FilterFlowPipe]
})
export class FilterFlowPipeModule { }
