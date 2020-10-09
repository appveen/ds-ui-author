import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
    TemplateRef,
    OnDestroy
} from '@angular/core';
import { CommonService } from 'src/app/utils/services/common.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'odp-user-manage',
    templateUrl: './user-manage.component.html',
    styleUrls: ['./user-manage.component.scss'],
    animations: [
        trigger('zoomIn', [
            state('void', style({
                transform: 'translate(-50%, -50%) scale(0) '
            })),
            transition('void => *', [
                animate('600ms cubic-bezier(0.86, 0, 0.07, 1)', style({
                    transform: 'translate(-50%, -50%) scale(1) '
                }))
            ]),
            transition('* => void', [
                animate('600ms cubic-bezier(0.86, 0, 0.07, 1)', style({
                    transform: 'translate(-50%, -50%) scale(0.1) '
                }))
            ])
        ])
    ]
})
export class UserManageComponent implements OnInit, OnDestroy {

    @ViewChild('searchInput', { static: false }) searchInput: ElementRef;
    @ViewChild('resetPasswordModel', { static: false }) resetPasswordModel: TemplateRef<HTMLElement>;
    @Output() backToList: EventEmitter<boolean>;
    @Output() deleteUsr: EventEmitter<any>;
    @Input() user: any;
    @Input() apps: any;
    activeTab: number;
    showSerchbox: boolean;
    resetPasswordForm: FormGroup;
    resetPasswordModelRef: NgbModalRef;
    showSpinner: boolean;
    showPassword: boolean;
    constructor(private commonService: CommonService,
        private fb: FormBuilder,
        private ts: ToastrService) {
        const self = this;
        self.backToList = new EventEmitter<boolean>();
        self.deleteUsr = new EventEmitter<boolean>();
        self.activeTab = 1;
        self.showSerchbox = false;
        self.resetPasswordForm = self.fb.group({
            password: [null, [Validators.required]],
            cpassword: [null, [Validators.required]],
        });
    }

    ngOnInit() {
        const self = this;
    }

    ngOnDestroy() {
        const self = this;
        if (self.resetPasswordModelRef) {
            self.resetPasswordModelRef.close();
        }
    }

    backToUserList() {
        const self = this;
        self.backToList.emit(true);
    }

    get invalidPassword() {
        const self = this;
        return self.resetPasswordForm.get('password').dirty
            && self.resetPasswordForm.get('password').hasError('required');
    }

    get invalidCPassword() {
        const self = this;
        return (self.resetPasswordForm.get('cpassword').dirty
            && self.resetPasswordForm.get('cpassword').hasError('required') ||
            (self.resetPasswordForm.get('cpassword').dirty && self.invalidMatch));
    }

    get invalidMatch() {
        const self = this;
        return (self.resetPasswordForm.get('cpassword').dirty
            && self.resetPasswordForm.get('cpassword').dirty
            && self.resetPasswordForm.get('password').value !== self.resetPasswordForm.get('cpassword').value);
    }

    deleteUser(userId) {
        const self = this;
        self.deleteUsr.emit(userId);
    }

    isThisUser(user) {
        return this.commonService.isThisUser(user);
    }

    openResetPassword() {
        const self = this;
        self.resetPasswordModelRef = self.commonService.modal(self.resetPasswordModel);
        self.resetPasswordModelRef.result.then(close => {
            self.resetPasswordForm.reset();
        }, dismiss => {
            self.resetPasswordForm.reset();
        });
    }

    resetPassword() {
        const self = this;
        self.resetPasswordForm.get('password').markAsDirty();
        self.resetPasswordForm.get('cpassword').markAsDirty();
        if (self.resetPasswordForm.invalid) {
            return;
        } else {
            self.showSpinner = true;
            self.commonService.put('user', '/usr/' + self.user._id + '/reset', self.resetPasswordForm.value)
                .subscribe(() => {
                    self.showSpinner = false;
                    self.resetPasswordModelRef.close();
                    self.ts.success('Password changed successfully');
                    if (self.user._id === self.commonService.userDetails._id) {
                        self.commonService.logout();
                    }
                }, err => {
                    self.showSpinner = false;
                    self.commonService.errorToast(err, 'Unable to process request');
                });
        }
    }

    get authType() {
        const self = this;
        if (self.commonService.userDetails.auth && self.commonService.userDetails.auth.authType) {
            return self.commonService.userDetails.auth.authType;
        } else {
            return null;
        }
    }
}
