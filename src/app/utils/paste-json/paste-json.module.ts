import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PasteJsonDirective } from './paste-json.directive';



@NgModule({
  declarations: [
    PasteJsonDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [PasteJsonDirective]
})
export class PasteJsonModule { }
