import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SizePipe } from './size.pipe';



@NgModule({
  declarations: [SizePipe],
  imports: [
    CommonModule
  ],
  exports: [SizePipe]
})
export class SizeModule { }
