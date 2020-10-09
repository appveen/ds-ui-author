import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FilterTeamPipe} from 'src/app/utils/pipes/filter-team.pipe';

@NgModule({
    declarations: [FilterTeamPipe],
    imports: [CommonModule],
    exports: [FilterTeamPipe]
})
export class FilterTeamModule { }
