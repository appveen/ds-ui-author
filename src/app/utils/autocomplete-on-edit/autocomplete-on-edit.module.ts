import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutocompleteOnEditComponent } from './autocomplete-on-edit.component';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';



@NgModule({
  declarations: [
    AutocompleteOnEditComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbTypeaheadModule
  ],
  exports: [AutocompleteOnEditComponent]
})
export class AutocompleteOnEditModule { }
