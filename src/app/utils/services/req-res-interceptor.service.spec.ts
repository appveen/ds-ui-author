import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';

import { ReqResInterceptorService } from './req-res-interceptor.service';

describe('ReqResInterceptorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, NgbModule, ToastrModule.forRoot()],
      providers: [ReqResInterceptorService]
    });
  });

  it('should be created', inject([ReqResInterceptorService], (service: ReqResInterceptorService) => {
    expect(service).toBeTruthy();
  }));
});
