import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonService } from '../services/common.service';

@Injectable({
  providedIn: 'root'
})
export class InsightsGuard implements CanActivate {
  constructor(private router: Router, private commonService: CommonService) {
  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.commonService.hasPermission('PVISDS')
      || this.commonService.hasPermission('PVISU')
      || this.commonService.hasPermission('PVISG')
    ) {
      return true;
    } else {
      console.log('access');
      this.router.navigate(['/app', this.commonService.app._id, 'noAccess']);
      return false;
    }
  }

}
