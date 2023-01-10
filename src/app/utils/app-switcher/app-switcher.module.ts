import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppSwitcherComponent } from './app-switcher.component';
import { FilterPipeModule } from '../pipes/filter.module';
import { OrderByModule } from '../pipes/order-by/order-by.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ClickOutsideModule } from '../directives/click-outside/click-outside.module';

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    RouterModule,
    FilterPipeModule,
    OrderByModule,
    ClickOutsideModule
  ],
  declarations: [AppSwitcherComponent],
  exports: [AppSwitcherComponent]
})
export class AppSwitcherModule { }
