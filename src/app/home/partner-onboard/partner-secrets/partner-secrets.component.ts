import { Component, OnInit, ViewChild, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/utils/services/common.service';

@Component({
    selector: 'odp-partner-secrets',
    templateUrl: './partner-secrets.component.html',
    styleUrls: ['./partner-secrets.component.scss']
})
export class PartnerSecretsComponent implements OnInit, OnDestroy {

    @Input() partner: UntypedFormGroup;
    @Input() edit: any;
    @ViewChild('addSecretModal', { static: false }) addSecretModal: NgbModalRef;
    addSecretModalRef: NgbModalRef;
    data: any;
    form: UntypedFormGroup;
    searchTerm: string;
    openDeleteModal: EventEmitter<any>;
    alertModal: any;
    constructor(private commonService: CommonService,
        private fb: UntypedFormBuilder) {
        const self = this;
        self.form = self.fb.group({
            name: [null, [Validators.required]],
            description: [null],
            type: [null, [Validators.required]],
            meta: self.fb.group({
                filename: [],
                filesize: [],
                username: []
            }),
            value: self.fb.group({
                _id: [null],
                certificate: [{ value: null, disabled: true }, [Validators.required]],
                apiKey: [{ value: null, disabled: true }, [Validators.required]],
                username: [{ value: null, disabled: true }, [Validators.required]],
                password: [{ value: null, disabled: true }, [Validators.required]]
            })
        });
        self.openDeleteModal = new EventEmitter();
        self.alertModal = {};
    }

    ngOnInit() {
        const self = this;
    }

    ngOnDestroy() {
        const self = this;
        if (self.addSecretModalRef) {
            self.addSecretModalRef.close();
        }
    }

    addSecret() {
        const self = this;
        self.addSecretModalRef = self.commonService.modal(self.addSecretModal, { centered: true, windowClass: 'add-secret-modal' });
        self.form.get('name').valueChanges.subscribe(_val => {
            if (self.secretList && self.secretList.find(e => e.name === _val)) {
                self.form.get('name').setErrors({
                    duplicate: true
                });
            } else {
                const temp = self.form.errors;
                if (temp) {
                    delete temp.duplicate;
                }
                self.form.get('name').setErrors(temp);
            }
        });
        self.form.get('value.username').valueChanges.subscribe(_val => {
            self.form.get('meta.username').patchValue(_val);
        });
        self.addSecretModalRef.result.then(close => {
            if (close) {
                let temp = self.partner.get('secrets').value;
                if (!temp) {
                    temp = [];
                }
                temp.push(self.form.value);
                self.partner.get('secrets').patchValue(temp);
            }
            self.form.reset();
        }, dismiss => {
            self.form.reset();
        });
    }

    editSecret(item: any) {
        const self = this;
        self.form.patchValue(item);
        self.addSecretModalRef = self.commonService.modal(self.addSecretModal, { centered: true, windowClass: 'add-secret-modal' });
        self.addSecretModalRef.result.then(close => {
            if (close) {
                let temp = self.partner.get('secrets').value;
                if (!temp) {
                    temp = [];
                }
                temp.push(self.form.value);
                self.partner.get('secrets').patchValue(temp);
            }
            self.form.reset();
        }, dismiss => {
            self.form.reset();
        });
    }

    removeSecret(item: any) {
        const self = this;
        self.alertModal.statusChange = false;
        self.alertModal.title = 'Delete Profile';
        self.alertModal.message = `Are you sure you want to delete <span class="text-delete font-weight-bold">${item.name}</span> profile?`;
        self.alertModal.item = item;
        self.openDeleteModal.emit(self.alertModal);
    }

    closeDeleteModal(data) {
        const self = this;
        if (data) {
            let deletedSecrets = self.partner.get('deletedSecrets').value;
            if (!deletedSecrets) {
                deletedSecrets = [];
            }
            const temp: Array<any> = self.secretList;
            if (temp) {
                const itemIndex = temp.findIndex(e => e.name === data.item.name);
                if (data.item.secretId) {
                    deletedSecrets.push(temp[itemIndex]);
                }
                temp.splice(itemIndex, 1);
            }
            self.partner.get('deletedSecrets').patchValue(deletedSecrets);
            self.partner.get('secrets').patchValue(temp);
        }
    }

    readCert(event) {
        const self = this;
        event.preventDefault();
        self.form.get('value.certificate').setValue(null);
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            const text = reader.result;
            self.data = text.toString();
            self.form.get('value.certificate').patchValue(btoa(text.toString()));
            self.form.get('meta.filename').patchValue(file.name);
            self.form.get('meta.filesize').patchValue(file.size);
        };
        reader.readAsText(file);
    }


    addRemoveValidators(type: string, val: boolean) {
        const self = this;
        if (val) {
            self.form.get('value').patchValue({
                certificate: null,
                apiKey: null,
                username: null,
                password: null
            });
            self.form.get('value').updateValueAndValidity();
            self.form.get('value.certificate').disable();
            self.form.get('value.certificate').updateValueAndValidity();
            self.form.get('value.apiKey').disable();
            self.form.get('value.apiKey').updateValueAndValidity();
            self.form.get('value.username').disable();
            self.form.get('value.username').updateValueAndValidity();
            self.form.get('value.password').disable();
            self.form.get('value.password').updateValueAndValidity();

            if (type === 'certificate') {
                self.form.get('value.certificate').enable();
                self.form.get('value.certificate').updateValueAndValidity();
            } else if (type === 'apiKey') {
                self.form.get('value.apiKey').enable();
                self.form.get('value.apiKey').updateValueAndValidity();
            } else {
                self.form.get('value.username').enable();
                self.form.get('value.username').updateValueAndValidity();
                self.form.get('value.password').enable();
                self.form.get('value.password').updateValueAndValidity();
            }
        }
    }

    hasPermission(type: string, entity?: string) {
        const self = this;
        return self.commonService.hasPermission(type, entity);
    }

    hasPermissionStartsWith(type: string, entity?: string) {
        const self = this;
        return self.commonService.hasPermissionStartsWith(type, entity);
    }

    canCreateSecret() {
        const self = this;
        if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
            return true;
        } else {
            const list = self.commonService.getEntityPermissions('PM_' + self.id);
            if (list.length > 0) {
                return Boolean(list.find(e => e.id === 'PMPPC'));
            } else {
                return self.commonService.hasPermission('PMPPC', 'PM');
            }
        }
    }

    canDeleteSecret() {
        const self = this;
        if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
            return true;
        } else {
            const list = self.commonService.getEntityPermissions('PM_' + self.id);
            if (list.length > 0) {
                return Boolean(list.find(e => e.id === 'PMPPD'));
            } else {
                return self.commonService.hasPermission('PMPPD', 'PM');
            }
        }
    }

    get validCertificate() {
        const self = this;
        if (!self.data) {
            return true;
        }
        const startIndex = self.data.indexOf('-----BEGIN CERTIFICATE-----');
        const endIndex = self.data.indexOf('-----END CERTIFICATE-----');
        if (startIndex > -1 && endIndex > -1) {
            return true;
        } else {
            return false;
        }
    }

    get secretList() {
        const self = this;
        if (self.partner && self.partner.get('secrets')) {
            return self.partner.get('secrets').value;
        } else {
            return [];
        }
    }

    get id() {
        const self = this;
        return self.edit.id;
    }
}
