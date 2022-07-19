import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonotypeEditorComponent } from './monotype-editor.component';



@NgModule({
  declarations: [MonotypeEditorComponent],
  imports: [
    CommonModule
  ],
  exports: [MonotypeEditorComponent]
})
export class MonotypeEditorModule { }
