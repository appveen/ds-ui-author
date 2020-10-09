import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndexToPosPipe } from './index-to-pos.pipe';



@NgModule({
  declarations: [IndexToPosPipe],
  imports: [
    CommonModule
  ],
  exports: [IndexToPosPipe]
})
export class IndexToPosModule { }
