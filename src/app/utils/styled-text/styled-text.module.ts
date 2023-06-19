import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StyledTextComponent } from './styled-text.component';
import { FormsModule } from '@angular/forms';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { EditorModule } from '../editor/editor.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbTypeaheadModule,
    EditorModule
  ],
  exports: [StyledTextComponent],
  declarations: [StyledTextComponent]
})
export class StyledTextModule { }
