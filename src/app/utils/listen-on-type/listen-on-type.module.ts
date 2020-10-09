import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListenOnTypeDirective } from './listen-on-type.directive';



@NgModule({
  declarations: [ListenOnTypeDirective],
  imports: [
    CommonModule
  ],
  exports: [ListenOnTypeDirective]
})
export class ListenOnTypeModule { }
