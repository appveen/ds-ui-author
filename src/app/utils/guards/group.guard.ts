import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonService } from '../services/common.service';

@Injectable({
  providedIn: 'root'
})
export class GroupGuard implements CanActivate {
  constructor(private router: Router, private commonService: CommonService) {
  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.commonService.hasPermissionStartsWith('PMG')
      || this.commonService.hasPermissionStartsWith('PVG')) {
      return true;
    } else {
      this.router.navigate(['/app', this.commonService.app._id,  'insight']);
      return false;
    }
  }
}
