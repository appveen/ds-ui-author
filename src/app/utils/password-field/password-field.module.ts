import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PasswordFieldDirective } from './password-field.directive';



@NgModule({
  declarations: [
    PasswordFieldDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    PasswordFieldDirective
  ]
})
export class PasswordFieldModule { }
