import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
  });

  it('should be created', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));
  it('getToken should return a token', inject([AuthService], (service: AuthService) => {
    // expect(service.getToken()).not.toBeNull();
  }));
  it('getToken should not return a token', inject([AuthService], (service: AuthService) => {
    // expect(service.getToken()).toBeNull();
  }));
  it('collectFailedRequest(dsadad) should push in cachedRequests',
    inject([HttpClientTestingModule, AuthService], (http: HttpClientTestingModule, service: AuthService) => {
      service.collectFailedRequest(http);
      expect(service.cachedRequests.length).toEqual(1);
    }));
  it('retryFailedRequests() should empty cachedRequests',
    inject([HttpClientTestingModule, AuthService], (http: HttpClientTestingModule, service: AuthService) => {
      service.collectFailedRequest(http);
      service.retryFailedRequests();
      expect(service.cachedRequests.length).toEqual(0);
    }));
});
