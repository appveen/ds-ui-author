import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthUsersComponent } from './auth-users.component';
import { AzureUsersComponent } from './azure-users/azure-users.component';
import { LdapUsersComponent } from './ldap-users/ldap-users.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [AuthUsersComponent, AzureUsersComponent, LdapUsersComponent],
  exports: [AuthUsersComponent, AzureUsersComponent, LdapUsersComponent]
})
export class AuthUsersModule { }
