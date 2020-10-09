import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShortcutService } from './shortcut.service';
import { ShortcutDirective } from './shortcut.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [ShortcutDirective],
  exports: [ShortcutDirective],
  providers: [ShortcutService]
})
export class ShortcutModule { }
