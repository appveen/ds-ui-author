import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ErrorService } from './error.service';
import { environment } from 'src/environments/environment';

describe('ErrorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ErrorService]
    });
  });

  it('should be created', inject([ErrorService], (service: ErrorService) => {
    expect(service).toBeTruthy();
  }));

  it('handleError should return nothing when message has ExpressionChangedAfterItHasBeenCheckedError',
    inject([ErrorService], (service: ErrorService) => {
      expect(service.handleError({
        name: 'Test-Error',
        message: 'ExpressionChangedAfterItHasBeenCheckedError sdsadad'
      })).toBeUndefined();
    }));
  it('handleError should throw error if not in production',
    inject([ErrorService], (service: ErrorService) => {
      const errorMessage = 'dsad dsadh hsdla sdsadad';
      expect(service.handleError(new Error(errorMessage))).toThrowError(errorMessage);
    }));
});

