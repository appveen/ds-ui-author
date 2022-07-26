import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ServiceImportWizardComponent } from './service-import-wizard.component';



@NgModule({
  declarations: [ServiceImportWizardComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
  ],
  exports: [
    ServiceImportWizardComponent
  ]
})
export class ServiceImportWizardModule { }
