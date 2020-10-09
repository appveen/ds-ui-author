import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SliderMonthComponent } from './slider-month.component';
import { SearchTermModule } from '../search-term/search-term.module';
import { ClickOutsideModule } from '../directives/click-outside/click-outside.module';



@NgModule({
  declarations: [SliderMonthComponent],
  imports: [
    CommonModule,
    FormsModule,
    SearchTermModule,
    ClickOutsideModule
  ],
  exports: [SliderMonthComponent]
})
export class SliderMonthModule { }
