import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { CommonService } from './common.service';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class ReqResInterceptorService implements HttpInterceptor {

  constructor(private sessionService: SessionService,
    private commonService: CommonService) { }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    request = request.clone({
      setHeaders: {
        Authorization: `JWT ${this.sessionService.getToken()}`
      }
    });
    return next.handle(request)
      .pipe(map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          if (event.status === 401) {
            console.log('Error intercepted');
          }
        }
        return event;
      }))
      .pipe(catchError((error: HttpErrorResponse) => {
        let data = {};
        data = {
          message: error && error.error.message ? error.error.message :
            'We are unable to process request, please try again after sometime.',
          status: error.status
        };
        if (error.status === 401 && error.error.message === 'Unauthorized') {
          if (this.sessionService.getToken()) {
            this.commonService.sessionExpired.emit();
            // this.sessionService.collectFailedRequest(request);
          } else {
            this.commonService.logout();
          }
        }
        return throwError(error);
      }));
  }
}
