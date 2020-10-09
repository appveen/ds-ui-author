import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonService } from '../services/common.service';

@Injectable()
export class PartnerGuard implements CanActivate {
  constructor(private router: Router, private commonService: CommonService) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.commonService.hasPermissionStartsWith('PMP')
      || this.commonService.hasPermissionStartsWith('PVP')) {
      return true;
    } else {
      this.router.navigate(['/app', this.commonService.app._id, 'dfl']);
      return false;
    }
  }
}
