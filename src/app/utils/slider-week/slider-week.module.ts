import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SliderWeekComponent } from './slider-week.component';
import { SearchTermModule } from '../search-term/search-term.module';
import { ClickOutsideModule } from '../directives/click-outside/click-outside.module';



@NgModule({
  declarations: [SliderWeekComponent],
  imports: [
    CommonModule,
    FormsModule,
    SearchTermModule,
    ClickOutsideModule
  ],
  exports: [SliderWeekComponent]
})
export class SliderWeekModule { }
