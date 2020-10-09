import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchTermDirective } from './search-term.directive';



@NgModule({
  declarations: [SearchTermDirective],
  imports: [
    CommonModule
  ],
  exports: [SearchTermDirective]
})
export class SearchTermModule { }
