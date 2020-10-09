import { NgModule, ErrorHandler, enableProdMode } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';

import { AppComponent } from './app.component';
import { CommonService } from './utils/services/common.service';
import { ErrorService } from './utils/services/error.service';
import { LoginComponent } from './login/login.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthGuard } from './utils/guards/auth.guard';
import { RouteGuard } from './utils/guards/route.guard';
import { ControlPanelGuard } from './utils/guards/control-panel.guard';
import { EntityGuard } from './utils/guards/entity.guard';
import { LibraryGuard } from './utils/guards/library.guard';
import { BuilderGuard } from './utils/guards/builder.guard';
import { LoadingModule } from './utils/loading/loading.module';
import { PartnerGuard } from './utils/guards/partner.guard';
import { AppService } from './utils/services/app.service';
import { ShortcutModule } from './utils/shortcut/shortcut.module';
import { ShortcutService } from './utils/shortcut/shortcut.service';
import { NotFoundComponent } from 'src/app/not-found/not-found.component';
import { AutoLogoutDirective } from './utils/directives/session/auto-logout.directive';
import { IconsModule } from './utils/icons/icons.module';
import { AutoFocusModule } from 'src/app/utils/directives/auto-focus/auto-focus.module';
import { ReqResInterceptorService } from './utils/services/req-res-interceptor.service';
import { SortablejsModule } from 'ngx-sortablejs';
// enableProdMode();

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NotFoundComponent,
    AutoLogoutDirective,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    AutoFocusModule,
    NgbModule,
    ToastrModule.forRoot({
      enableHtml: true,
      positionClass: 'toast-top-center',
      maxOpened: 1,
      autoDismiss: true,
      preventDuplicates: true
    }),
    LoadingModule,
    ShortcutModule,
    IconsModule,
    AutoFocusModule,
    SortablejsModule.forRoot({ animation: 150 })
  ],
  providers: [
    {
      provide: ErrorHandler,
      useClass: ErrorService
    },
    CommonService,
    AppService,
    ShortcutService,
    AuthGuard,
    RouteGuard,
    ControlPanelGuard,
    EntityGuard,
    LibraryGuard,
    BuilderGuard,
    ToastrService,
    PartnerGuard,
    CookieService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ReqResInterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})

export class AppModule {

  constructor() {

  }
}
