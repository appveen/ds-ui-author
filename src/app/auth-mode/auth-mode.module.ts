import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthModeComponent } from './auth-mode.component';
import { LdapComponent } from '../auth-mode/ldap/ldap.component';
import { AzureComponent } from './azure/azure.component';
import { TimeoutTriggerModule } from '../utils/directives/timeout-trigger/timeout-trigger.module';
import { FilterPipeModule } from '../utils/pipes/filter.module';

const routes: Routes = [
  {
    path: '', component: AuthModeComponent, children: [
      { path: 'azure', component: AzureComponent },
      { path: 'ldap', component: LdapComponent }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    TimeoutTriggerModule,
    NgbModule,
    FilterPipeModule
  ],
  declarations: [
    AuthModeComponent,
    LdapComponent,
    AzureComponent
  ],
  exports: [RouterModule]
})
export class AuthModeModule { }
