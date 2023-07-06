import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SideCanvasComponent } from './side-canvas.component';



@NgModule({
  declarations: [
    SideCanvasComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SideCanvasComponent
  ]
})
export class SideCanvasModule { }
