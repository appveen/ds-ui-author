import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonService } from 'src/app/utils/services/common.service';
import { SessionService } from '../services/session.service';

@Injectable({
    providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
    constructor(private commonService: CommonService,
        private sessionService: SessionService) {
    }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        if (this.sessionService.getToken()) {
            if (this.commonService.permissions && this.commonService.permissions.length > 0) {
                return true;
            } else {
                return this.commonService.fetchUserRoles().then((res) => {
                    this.commonService.permissions = res['roles'];
                    return true;
                }).catch(err => {
                    return false;
                });
            }
        } else {
            this.commonService.logout();
            return false;
        }
    }
}
