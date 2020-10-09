import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { CommonService } from '../services/common.service';
import { SessionService } from '../services/session.service';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private commonService: CommonService,
        private router: Router,
        private sessionService: SessionService) { }

    canActivate(): Observable<boolean> | Promise<boolean> | boolean {
        return new Promise<boolean>((resolve, reject) => {
            if (this.commonService.userDetails
                && this.commonService.userDetails._id) {
                this.router.navigate(['/app/']);
                reject(false);
            } else {
                if (this.sessionService.getToken()) {
                    this.commonService.isAuthenticated().then(res => {
                        this.router.navigate(['/app/']);
                        reject(false);
                    }).catch(err => {
                        resolve(true);
                    });
                } else {
                    resolve(true);
                }
            }
        });
    }
}
