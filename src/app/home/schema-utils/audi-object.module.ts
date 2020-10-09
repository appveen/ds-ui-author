import { NgModule } from '@angular/core';
import { ObjectPipeCounter } from 'src/app/home/schema-utils/audit-object.pipe';
import {CommonModule} from '@angular/common';

@NgModule({
    declarations: [ObjectPipeCounter],
    imports: [CommonModule],
    exports: [ObjectPipeCounter]
})
export class AudiObjectModule {}
