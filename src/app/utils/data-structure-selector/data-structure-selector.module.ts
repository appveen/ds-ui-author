import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DataStructureSelectorComponent } from './data-structure-selector.component';
import { RoundRadioModule } from '../round-radio/round-radio.module';
import { DataFormatSelectorComponent } from './data-format-selector/data-format-selector.component';
import { CustomFormatSelectorComponent } from './custom-format-selector/custom-format-selector.component';
import { SearchBoxModule } from '../search-box/search-box.module';
import { AutoFocusModule } from '../directives/auto-focus/auto-focus.module';



@NgModule({
  declarations: [
    DataStructureSelectorComponent,
    DataFormatSelectorComponent,
    CustomFormatSelectorComponent
  ],
  imports: [
    CommonModule,
    RoundRadioModule,
    FormsModule,
    ReactiveFormsModule,
    SearchBoxModule,
    AutoFocusModule
  ],
  exports: [DataStructureSelectorComponent]
})
export class DataStructureSelectorModule { }
