import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrettyJsonPipe } from './pretty-json.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [PrettyJsonPipe],
  exports: [PrettyJsonPipe],
  providers: [PrettyJsonPipe]
})
export class PrettyJsonModule { }
