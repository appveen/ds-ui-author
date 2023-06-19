import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { CommonService } from '../../utils/services/common.service';
import { matchPassword } from '../custom-validators/same-password-validator';
import { SessionService } from 'src/app/utils/services/session.service';

@Component({
    selector: 'odp-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})

export class ProfileComponent implements OnInit {
    user: any;
    passwordForm: UntypedFormGroup;
    name: string;
    cp: boolean;
    cfp: boolean;
    np: boolean;
    passwordChange: {
        status: boolean;
        loading: boolean;
        message: string;
    };

    permissions: Array<any> = [];

    constructor(private fb: UntypedFormBuilder,
        private commonService: CommonService,
        private sessionService: SessionService) {
        this.passwordForm = this.fb.group({
            oldpassword: ['', [Validators.required]],
            newpassword: ['', [Validators.required]],
            confirmpassword: ['', [Validators.required]]
        });
        this.passwordChange = {
            status: false,
            loading: false,
            message: null
        };
    }

    ngOnInit() {
        const self = this;
        self.passwordForm.setValidators([matchPassword]);
        self.user = self.sessionService.getUser(true);
        self.permissions = this._getPermissions(this.user.entitlements);
    }

    changePassword(value) {
        const self = this;
        self.passwordChange.loading = true;
        self.passwordChange.message = null;
        delete value.confirmpassword;
        self.commonService.put('user', '/auth/change-password/'+self.commonService.userDetails.username, value).subscribe(res => {
            self.passwordChange.loading = false;
            self.passwordChange.status = true;
            self.passwordChange.message = 'Password changed successfully';
            self.passwordForm.reset();
        },
            err => {
                self.passwordChange.loading = false;
                self.passwordChange.status = false;
                if (err.status === 400 || err.status === 401) {
                    self.passwordChange.message = err.error.message;
                } else {
                    self.passwordChange.message = 'Unable to change password, please try again later';
                }
            });
    }

    private _getPermissions(permissions) {
        const temp = [];
        Object.keys(permissions).forEach(i => {
            temp.push({
                label: i,
                value: permissions[i]
            });
        });
        return temp;
    }

}
