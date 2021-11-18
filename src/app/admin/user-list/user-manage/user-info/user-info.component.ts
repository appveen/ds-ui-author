import { Component, Input, OnInit, ViewChild, TemplateRef, OnDestroy, EventEmitter } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { noop } from 'rxjs';
import * as _ from 'lodash';

import { CommonService } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';

@Component({
    selector: 'odp-user-info',
    templateUrl: './user-info.component.html',
    styleUrls: ['./user-info.component.scss'],
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
export class UserInfoComponent implements OnInit, OnDestroy {

    @ViewChild('manageAttributeModal', { static: false }) manageAttributeModal: TemplateRef<HTMLElement>;
    @ViewChild('basicDetailsModel', { static: false }) basicDetailsModel: TemplateRef<HTMLElement>;
    @ViewChild('userCredentialsModel', { static: false }) userCredentialsModel: TemplateRef<HTMLElement>;
    @ViewChild('resetPasswordModel', { static: false }) resetPasswordModel: TemplateRef<HTMLElement>;
    private _user;
    // @Input('user') user: any;
    userBasicDetail: FormGroup;
    userCreds: FormGroup;
    resetPwd: boolean;
    userAttributeForm: FormGroup;
    manageAttributeModalRef: NgbModalRef;
    userAttributeList: Array<any>;
    isUserAttrEdit: boolean;

    get user() {
        const self = this;
        return self._user;
    }

    get attributeAlreadyExists(): boolean {
        const value = this.userAttributeForm?.get('label').value || '';
        const list = !!this.userAttributeList?.length ? this.userAttributeList : [];
        return !!value && !this.isUserAttrEdit && list.some(item => item.key === value);
    }

    @Input() set user(value) {
        const self = this;
        self._user = value;
        const arr = [];
        if (self.user && self.user.attributes) {
            Object.keys(self.user.attributes).forEach(key => {
                if (self.user.attributes[key]) {
                    arr.push({
                        key,
                        label: self.user.attributes[key].label,
                        value: self.user.attributes[key].value,
                        type: self.user.attributes[key].type
                    });
                }
            });
        }
        self.userAttributeList = arr;
    }
    userCredentialsModelRef: NgbModalRef;
    basicDetailsModelRef: NgbModalRef;
    resetPasswordModelRef: NgbModalRef;
    resetPasswordForm: FormGroup;
    openDeleteModal: EventEmitter<any>;
    alertModal: {
        statusChange?: boolean;
        title: string;
        message: string;
        _id: string;
    };
    showLazyLoader: boolean;
    toggleFieldTypeSelector: boolean;
    types: Array<any>;
    showPassword: any;
    constructor(private fb: FormBuilder,
        private ts: ToastrService,
        private appService: AppService,
        private commonService: CommonService) {
        const self = this;
        self.resetPwd = false;
        const pattern1 = '^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?';
        const pattern2 = '(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$';
        const emailPtrn = pattern1 + pattern2;
        const emailRegex = new RegExp(emailPtrn);
        self.userBasicDetail = self.fb.group({
            name: ['', [Validators.required]],
            phone: [''],
            email: ['', [Validators.pattern(/[\w]+@[a-zA-Z0-9-]{2,}(\.[a-z]{2,})+/)]],
            alternateEmail: ['', [Validators.pattern(/[\w]+@[a-zA-Z0-9-]{2,}(\.[a-z]{2,})+/)]]
        });
        self.userCreds = self.fb.group({
            username: ['', [Validators.required, Validators.pattern(emailRegex)]],
            password: ['']
        });
        self.userAttributeForm = self.fb.group({
            label: [null, [Validators.required]],
            key: [null, [Validators.required]],
            type: ['String', [Validators.required]],
            value: [null, [Validators.required]]
        });
        self.resetPasswordForm = self.fb.group({
            password: [null],
            cpassword: [null, [Validators.required]],
        });
        if(self.commonService.userDetails.rbacPasswordComplexity){
            self.resetPasswordForm.get('password').setValidators([Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!@#$%^&*?~]).+$/)])
        }
        else{
            self.resetPasswordForm.get('password').setValidators([Validators.required, Validators.minLength(8)])
        }
        self.resetPasswordForm.get('password').updateValueAndValidity();
        self.openDeleteModal = new EventEmitter();
        self.alertModal = {
            statusChange: false,
            title: '',
            message: '',
            _id: null
        };
        self.types = [
            { class: 'odp-abc', value: 'String', label: 'Text' },
            { class: 'odp-123', value: 'Number', label: 'Number' },
            { class: 'odp-boolean', value: 'Boolean', label: 'True/False' },
            { class: 'odp-calendar', value: 'Date', label: 'Date' },
        ];
        this.showPassword = {};
    }

    ngOnInit() {
        const self = this;
        // self.getUsrAdditionalInfo();
    }

    ngOnDestroy() {
        const self = this;
        if (self.userCredentialsModelRef) {
            self.userCredentialsModelRef.close();
        }
        if (self.basicDetailsModelRef) {
            self.basicDetailsModelRef.close();
        }
        if (self.resetPasswordModelRef) {
            self.resetPasswordModelRef.close();
        }
        if (self.manageAttributeModalRef) {
            self.manageAttributeModalRef.close();
        }
    }

    get invalidName() {
        const self = this;
        return self.userBasicDetail.get('name').touched && self.userBasicDetail.get('name').dirty
            && self.userBasicDetail.get('name').hasError('required');
    }

    get invalidUsername() {
        const self = this;
        return self.userCreds.get('username').touched && self.userCreds.get('username').dirty
            && self.userCreds.get('username').hasError('required');
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

    editBasicDetails() {
        const self = this;
        self.userBasicDetail.patchValue({ name: self.user.basicDetails.name });
        self.userBasicDetail.patchValue({ phone: self.user.basicDetails.phone });
        self.userBasicDetail.patchValue({ alternateEmail: self.user.basicDetails.alternateEmail });
        self.basicDetailsModelRef = self.commonService.modal(self.basicDetailsModel);
        self.basicDetailsModelRef.result.then(close => {
            self.userBasicDetail.reset();
        }, dismiss => {
            self.userBasicDetail.reset();
        });
    }

    editCreds() {
        const self = this;
        self.userCreds.patchValue({ username: self.user.username });
        self.userCreds.patchValue({ password: self.user.password });
        self.userCreds.patchValue({ sessionTime: self.user.sessionTime + ' mins' });
        self.userCreds.patchValue({ enableSessionRefresh: self.user.enableSessionRefresh });
        self.userCredentialsModelRef = self.commonService.modal(self.userCredentialsModel);
        self.userCredentialsModelRef.result.then(close => {
            self.userCreds.reset();
        }, dismiss => {
            self.userCreds.reset();
        });
    }

    updateBasicDetails() {
        const self = this;
        self.userBasicDetail.get('name').markAsDirty();
        if (self.userBasicDetail.invalid) {
            return;
        } else {
            const ifValueUpdated = (self.user.basicDetails.name !== self.userBasicDetail.get('name').value) ||
                (self.user.basicDetails.phone !== self.userBasicDetail.get('phone').value) ||
                (self.user.basicDetails.alternateEmail !== self.userBasicDetail.get('alternateEmail').value);
            if (!ifValueUpdated) {
                self.ts.error('Old and New Values are same!');
                return;
            }
            self.user.basicDetails.name = self.userBasicDetail.get('name').value;
            self.user.basicDetails.phone = self.userBasicDetail.get('phone').value;
            self.user.basicDetails.alternateEmail = self.userBasicDetail.get('alternateEmail').value;
            self.showLazyLoader = true;
            self.commonService.put('user', '/usr/' + self.user._id, self.user)
                .subscribe(() => {
                    self.showLazyLoader = false;
                    self.ts.success('Basic Details of user updated Successfully');
                    self.basicDetailsModelRef.close();
                }, (err) => {
                    self.showLazyLoader = false;
                    self.ts.error(err.error.message);
                });
        }
        self.userBasicDetail.reset();
    }

    updateUserName() {
        const self = this;
        if (self.userCreds.invalid) {
            const invalidItems = `<div>Please fill in the following fields:</div><ul>
                                    <li>Username</li>
                                  </ul>`;
            self.ts.warning(invalidItems);
            return;
        } else {
            if (self.user.username === self.userCreds.get('username').value) {
                self.ts.error('Old and New Values are same!');
                return;
            }
            self.user.username = self.userCreds.get('username').value;
            self.showLazyLoader = true;
            self.commonService.put('user', '/usr/' + self.user._id, self.user)
                .subscribe(() => {
                    self.showLazyLoader = false;
                    self.ts.success('Username updated Successfully');
                    self.userCredentialsModelRef.close();
                }, (err) => {
                    self.showLazyLoader = false;
                    self.commonService.errorToast(err);
                });
        }
        self.userCreds.reset();
    }

    deleteAdditionInfo(attrName: string) {
        const self = this;
        self.alertModal.statusChange = false;
        self.alertModal.title = `Delete ${attrName}`;
        self.alertModal.message = 'Are you sure you want to delete <span class="text-delete font-weight-bold">' + attrName
            + '</span> attribute for ?<span class="text-delete font-weight-bold">' + self.user.basicDetails.name
            + '</span>';
        self.alertModal._id = attrName;
        self.openDeleteModal.emit(self.alertModal);
    }

    closeDeleteModal(data) {
        const self = this;
        if (data) {
            self.user.attributes[data._id] = null;
            self.showLazyLoader = true;
            self.commonService.put('user', '/usr/' + self.user._id, self.user)
                .subscribe((updatedUser) => {
                    self.showLazyLoader = false;
                    self.user = updatedUser;
                    self.ts.success('Attribute deleted successfully');
                }, (err) => {
                    self.showLazyLoader = false;
                    self.ts.error(err.error.message);
                }, noop);
        }
    }

    manageUserAttribute(val?: any) {
        const self = this;
        self.isUserAttrEdit = !!val;
        if (val) {
            self.userAttributeForm.get('key').patchValue(val.key);
            self.userAttributeForm.get('label').patchValue(val.label);
            self.userAttributeForm.get('value').patchValue(val.value);
            self.userAttributeForm.get('type').patchValue(val.type);
            self.user.attributes[val.key] = null;
        }
        self.manageAttributeModalRef = self.commonService.modal(self.manageAttributeModal);
        self.manageAttributeModalRef.result.then(close => {
            if (close) {
                const payload = self.userAttributeForm.value;
                const key = _.camelCase(payload.label);
                const temp: any = self.appService.cloneObject(payload);
                delete temp.key;
                if (payload && payload.key) {
                    if (!self.user.attributes) {
                        self.user.attributes = {};
                    }
                    self.user.attributes[key] = temp;
                    const arr = [];
                    if (self.user && self.user.attributes) {
                        Object.keys(self.user.attributes).forEach(key => {
                            if (self.user.attributes[key]) {
                                arr.push({
                                    key,
                                    label: self.user.attributes[key].label,
                                    value: self.user.attributes[key].value,
                                    type: self.user.attributes[key].type
                                });
                            }
                        });
                    }
                    self.userAttributeList = arr;
                    self.showLazyLoader = true;
                    self.commonService.put('user', '/usr/' + self.user._id, self.user)
                        .subscribe(() => {
                            self.showLazyLoader = false;
                            self.ts.success('Attributes of user updated Successfully');
                        }, (err) => {
                            self.showLazyLoader = false;
                            self.commonService.errorToast(err);
                        });
                }
            } else {
                if (val && val.key) {
                    const payload = self.appService.cloneObject(val);
                    const key = payload.key;
                    delete payload.key;
                    self.user.attributes[key] = payload;
                }
            }
            self.userAttributeForm.reset({
                type: 'String'
            });
        }, dismiss => {
            if (val && val.key) {
                const payload = self.appService.cloneObject(val);
                const key = payload.key;
                delete payload.key;
                self.user.attributes[key] = payload;
            }
            self.userAttributeForm.reset({
                type: 'String'
            });
        });
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
            self.showLazyLoader = true;
            self.commonService.put('user', '/usr/' + self.user._id + '/reset', self.resetPasswordForm.value)
                .subscribe(() => {
                    self.showLazyLoader = false;
                    self.resetPasswordModelRef.close();
                    self.ts.success('Password changed successfully');
                }, err => {
                    self.showLazyLoader = false;
                    self.commonService.errorToast(err, err.error.message);
                });
        }
    }

    get authType() {
        const self = this;
        if (self.user && self.user.auth) {
            return self.user.auth.authType;
        }
        return null;
    }

    set setUserAttributeValue(val) {
        const self = this;
        self.userAttributeForm.get('value').patchValue(val);
    }

    get setUserAttributeValue() {
        const self = this;
        return self.userAttributeForm.get('value').value;
    }

    // get userAttributeList() {
    //     const self = this;
    //     const arr = [];
    //     if (self.user && self.user.attributes) {
    //         Object.keys(self.user.attributes).forEach(key => {
    //             arr.push({
    //                 key,
    //                 label: self.user.attributes[key].label,
    //                 value: self.user.attributes[key].value,
    //                 type: self.user.attributes[key].type
    //             });
    //         });
    //     }
    //     return arr;
    // }

    setUserAttributeType(type: any) {
        const self = this;
        self.toggleFieldTypeSelector = false;
        self.userAttributeForm.get('type').patchValue(type.value);
        if (type.value === 'Boolean') {
            self.userAttributeForm.get('value').patchValue(false);
        } else {
            self.userAttributeForm.get('value').patchValue(null);
        }
    }

    getUserAttributeType(val: any) {
        const self = this;
        if (val !== null) {
            return self.appService.toCapitalize(typeof val);
        }
        return 'String';
    }

    setKey() {
        const self = this;
        self.userAttributeForm.get('key').patchValue(self.appService.toCamelCase(self.userAttributeForm.get('label').value));
    }
}
