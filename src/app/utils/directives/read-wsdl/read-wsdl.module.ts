import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReadWsdlDirective } from './read-wsdl.directive';

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule
    ],
    declarations: [ReadWsdlDirective],
    exports: [ReadWsdlDirective]
})
export class ReadWsdlModule { }
