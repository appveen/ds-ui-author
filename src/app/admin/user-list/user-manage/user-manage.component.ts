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
    showPassword: any;
    constructor(private commonService: CommonService,
        private fb: FormBuilder,
        private ts: ToastrService) {
        const self = this;
        this.backToList = new EventEmitter();
        this.deleteUsr = new EventEmitter();
        this.activeTab = 1;
        this.showSerchbox = false;
        self.resetPasswordForm = self.fb.group({
            password: [null],
            cpassword: [null, [Validators.required]],
        });
        if (self.commonService.userDetails.rbacPasswordComplexity) {
            self.resetPasswordForm.get('password').setValidators([Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!@#$%^&*?~]).+$/)])
        }
        else {
            self.resetPasswordForm.get('password').setValidators([Validators.required, Validators.minLength(8)])
        }
        self.resetPasswordForm.get('password').updateValueAndValidity();
        this.showPassword = {};
        this.user = {};
    }

    ngOnInit() {

    }

    ngOnDestroy() {
        if (this.resetPasswordModelRef) {
            this.resetPasswordModelRef.close();
        }
    }

    backToUserList() {
        this.backToList.emit(true);
    }

    get invalidPassword() {
        const self = this;
        return self.resetPasswordForm.get('password').touched &&
            self.resetPasswordForm.get('password').dirty
            && (self.resetPasswordForm.get('password').hasError('required') ||
                self.resetPasswordForm.get('password').hasError('pattern') ||
                self.resetPasswordForm.get('password').hasError('minlength'));
    }

    get invalidCPassword() {
        return (this.resetPasswordForm.get('cpassword').dirty
            && this.resetPasswordForm.get('cpassword').hasError('required') ||
            (this.resetPasswordForm.get('cpassword').dirty && this.invalidMatch));
    }

    get invalidMatch() {
        return (this.resetPasswordForm.get('cpassword').dirty
            && this.resetPasswordForm.get('cpassword').dirty
            && this.resetPasswordForm.get('password').value !== this.resetPasswordForm.get('cpassword').value);
    }

    deleteUser() {
        this.deleteUsr.emit(this.user);
    }

    isThisUser() {
        return this.commonService.isThisUser(this.user);
    }

    openResetPassword() {
        this.resetPasswordModelRef = this.commonService.modal(this.resetPasswordModel);
        this.resetPasswordModelRef.result.then(close => {
            this.resetPasswordForm.reset();
        }, dismiss => {
            this.resetPasswordForm.reset();
        });
    }

    resetPassword() {
        this.resetPasswordForm.get('password').markAsDirty();
        this.resetPasswordForm.get('cpassword').markAsDirty();
        if (this.resetPasswordForm.invalid) {
            return;
        } else {
            this.showSpinner = true;
            this.commonService.put('user', '/admin/user/utils/reset/' + this.user._id, this.resetPasswordForm.value)
                .subscribe(() => {
                    this.showSpinner = false;
                    this.resetPasswordModelRef.close();
                    this.ts.success('Password changed successfully');
                    if (this.user._id === this.commonService.userDetails._id) {
                        this.commonService.logout();
                    }
                }, err => {
                    this.showSpinner = false;
                    this.commonService.errorToast(err, 'Unable to process request');
                });
        }
    }

    get authType() {
        if (this.user.auth && this.user.auth.authType) {
            return this.user.auth.authType;
        } else {
            return null;
        }
    }
}
