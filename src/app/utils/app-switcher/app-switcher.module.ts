import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppSwitcherComponent } from './app-switcher.component';
import { IconsModule } from 'src/app/utils/icons/icons.module';
import { FilterPipeModule } from '../pipes/filter.module';
import { OrderByModule } from '../pipes/order-by/order-by.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    RouterModule,
    IconsModule,
    FilterPipeModule,
    OrderByModule
  ],
  declarations: [AppSwitcherComponent],
  exports: [AppSwitcherComponent]
})
export class AppSwitcherModule { }
