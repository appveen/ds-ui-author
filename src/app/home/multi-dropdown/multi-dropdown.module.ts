import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiDropdownComponent } from './multi-dropdown.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';



@NgModule({
  imports: [
    CommonModule,
    NgbDropdownModule
  ],
  declarations: [MultiDropdownComponent],
  exports: [MultiDropdownComponent]
})
export class MultiDropdownModule { }
