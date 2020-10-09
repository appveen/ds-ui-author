import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FileControlComponent } from './file-control.component';
import { SizeModule } from '../pipes/size/size.module';



@NgModule({
  declarations: [FileControlComponent],
  imports: [
    CommonModule,
    FormsModule,
    SizeModule
  ],
  exports: [FileControlComponent],
})
export class FileControlModule { }
