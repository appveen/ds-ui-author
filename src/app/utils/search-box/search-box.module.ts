import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SearchBoxComponent } from 'src/app/utils/search-box/search-box.component';
import { ClickOutsideModule } from '../directives/click-outside/click-outside.module';
import { AutoFocusModule } from '../directives/auto-focus/auto-focus.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    ClickOutsideModule,
    AutoFocusModule
  ],
  declarations: [SearchBoxComponent],
  exports: [SearchBoxComponent]
})
export class SearchBoxModule { }
