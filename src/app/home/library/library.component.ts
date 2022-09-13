import { Component, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';

import { CommonService } from '../../utils/services/common.service';
import { AppService } from '../../utils/services/app.service';
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';
import { switchMap } from 'rxjs/operators';
import { CommonFilterPipe } from 'src/app/utils/pipes/common-filter/common-filter.pipe';

@Component({
    selector: 'odp-library',
    templateUrl: './library.component.html',
    styleUrls: ['./library.component.scss'],
    providers: [CommonFilterPipe]
})
export class LibraryComponent implements OnInit, OnDestroy {

    libraryList: Array<any> = [];
    alertModal: {
        statusChange?: boolean;
        title: string;
        message: string;
        index: number;
    };
    showLazyLoader: boolean;
    subscriptions: any = {};
    breadcrumbPaths: Array<Breadcrumb>;
    openDeleteModal: EventEmitter<any>;
    form: FormGroup;
    showNewLibraryWindow: boolean;
    showOptionsDropdown: any;
    selectedItemEvent: any
    selectedLibrary: any;
    searchTerm: string;
    sortModel: any;
    constructor(private commonService: CommonService,
        private appService: AppService,
        private router: Router,
        private fb: FormBuilder,
        private ts: ToastrService,
        private commonPipe: CommonFilterPipe) {
        const self = this;
        self.alertModal = {
            statusChange: false,
            title: '',
            message: '',
            index: -1
        };
        self.breadcrumbPaths = [{
            active: true,
            label: 'Libraries'
        }];

        this.commonService.changeBreadcrumb(self.breadcrumbPaths)
        self.openDeleteModal = new EventEmitter();
        self.form = self.fb.group({
            name: [null, [Validators.required, Validators.maxLength(40), Validators.pattern(/\w+/)]],
            description: [null, [Validators.maxLength(240), Validators.pattern(/\w+/)]]
        });
        this.showOptionsDropdown = {};
        this.showLazyLoader = true;
        this.sortModel = {};
    }

    ngOnInit() {
        const self = this;
        self.showLazyLoader = true;
        self.commonService.apiCalls.componentLoading = false;
        self.getLibraries();
        self.subscriptions['changeApp'] = self.commonService.appChange.subscribe(_app => {
            self.commonService.apiCalls.componentLoading = false;
            self.showLazyLoader = true;
            self.getLibraries();
        });

    }

    ngOnDestroy() {
        const self = this;
        Object.keys(self.subscriptions).forEach(e => {
            self.subscriptions[e].unsubscribe();
        });
    }

    newLibrary() {
        const self = this;
        self.form.reset();
        this.showNewLibraryWindow = true;
    }

    triggerLibraryCreate() {
        const self = this;
        const payload = self.form.value;
        payload.app = self.commonService.app._id;
        self.showLazyLoader = true;
        self.commonService.post('serviceManager', `/${this.commonService.app._id}/globalSchema`, payload).subscribe(res => {
            self.ts.success('Library Created.');
            self.appService.editLibraryId = res._id;
            self.showLazyLoader = false;
            self.router.navigate(['/app/', self.commonService.app._id, 'gs', res._id]);
        }, err => {
            self.showLazyLoader = false;
            self.commonService.errorToast(err);
        });
    }

    editLibrary(_index) {
        const self = this;
        self.appService.editLibraryId = self.libraryList[_index]._id;
        self.router.navigate(['/app/', self.app, 'gs', self.appService.editLibraryId]);
    }

    cloneLibrary(_index) {
        const self = this;
        self.appService.cloneLibraryId = self.libraryList[_index]._id;
        self.router.navigate(['/app/', self.app, 'gs', self.appService.cloneLibraryId]);
    }

    getLibraries() {
        const self = this;
        if (self.subscriptions['getLibraries']) {
            self.subscriptions['getLibraries'].unsubscribe();
        }
        self.showLazyLoader = true;
        this.libraryList = [];
        self.subscriptions['getLibraries'] = self.commonService.get('serviceManager', `/${this.commonService.app._id}/globalSchema/utils/count`)
            .pipe(switchMap((ev: any) => {
                return self.commonService.get('serviceManager', `/${this.commonService.app._id}/globalSchema`, { count: ev });
            }))
            .subscribe(res => {
                self.showLazyLoader = false;
                if (res.length > 0) {
                    res.forEach(_library => {
                        if (_library.definition) {
                            _library._attributes = _library.definition[0]?.definition?.length;
                            _library._references = _library.services.length;
                        } else {
                            _library._attributes = 0;
                            _library._references = _library.services.length;
                        }
                        self.libraryList.push(_library);
                    });
                }
            }, err => {
                self.commonService.errorToast(err, 'We are unable to fetch records, please try again later');
            });
    }

    deleteLibrary(_index) {
        const self = this;
        self.alertModal.statusChange = false;
        self.alertModal.title = 'Delete library';
        self.alertModal.message = 'Are you sure you want to delete <span class="text-delete font-weight-bold">'
            + self.libraryList[_index].name + '</span> Library?';
        self.alertModal.index = _index;
        self.openDeleteModal.emit(self.alertModal);
    }

    closeDeleteModal(data) {
        const self = this;
        if (data) {
            const url = `/${this.commonService.app._id}/globalSchema/` + self.libraryList[data.index]._id;
            self.showLazyLoader = true;
            self.subscriptions['deleteLibrary'] = self.commonService.delete('serviceManager', url).subscribe(_d => {
                self.showLazyLoader = false;
                self.ts.info(_d.message ? _d.message : 'Library deleted');
                self.getLibraries();
            }, err => {
                self.showLazyLoader = false;
                self.commonService.errorToast(err, 'Unable to delete, please try again later');
            });
        }
    }

    hasPermissionForLibrary(id: string) {
        const self = this;
        if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
            return true;
        } else {
            const list = self.commonService.getEntityPermissions('GS_' + id);
            if (list.length > 0 && list.find(e => e.id === 'PNL')) {
                return false;
            } else if (list.length === 0 && !self.hasManagePermission('GS') && !self.hasViewPermission('GS')) {
                return false;
            } else {
                return true;
            }
        }
    }

    canEditLibrary(id: string) {
        const self = this;
        if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
            return true;
        } else {
            const list = self.commonService.getEntityPermissions('GS_' + id);
            if (list.length > 0 && list.find(e => e.id === 'PML')) {
                return true;
            } else if (list.length === 0 && self.hasManagePermission('GS')) {
                return true;
            } else {
                return false;
            }
        }
    }

    hasManagePermission(entity: string) {
        const self = this;
        return self.commonService.hasPermission('PML', entity);
    }
    hasViewPermission(entity: string) {
        const self = this;
        return self.commonService.hasPermission('PVL', entity);
    }

    applySort(field: string) {
        if (!this.sortModel[field]) {
            this.sortModel = {};
            this.sortModel[field] = 1;
        } else if (this.sortModel[field] == 1) {
            this.sortModel[field] = -1;
        } else {
            delete this.sortModel[field];
        }
    }

    showDropDown(event: any, i: number) {
        this.selectedItemEvent = event;
        Object.keys(this.showOptionsDropdown).forEach(key => {
            this.showOptionsDropdown[key] = false;
        })
        this.selectedLibrary = this.libraryList[i];
        this.showOptionsDropdown[i] = true;
    }

    private compare(a: any, b: any) {
        if (a > b) {
            return 1;
        } else if (a < b) {
            return -1;
        } else {
            return 0;
        }
    }

    get dropDownStyle() {
        let top = (this.selectedItemEvent.clientY + 10);
        if (this.selectedItemEvent.clientY > 430) {
            top = this.selectedItemEvent.clientY - 106
        }
        return {
            top: top + 'px',
            right: '50px'
        };
    }

    get records() {
        let records = this.commonPipe.transform(this.libraryList, 'name', this.searchTerm);
        const field = Object.keys(this.sortModel)[0];
        if (field) {
            records = records.sort((a, b) => {
                if (this.sortModel[field] == 1) {
                    if (typeof a[field] == 'number' || typeof b[field] == 'number') {
                        return this.compare((a[field]), (b[field]));
                    } else {
                        return this.compare(_.lowerCase(a[field]), _.lowerCase(b[field]));
                    }
                } else if (this.sortModel[field] == -1) {
                    if (typeof a[field] == 'number' || typeof b[field] == 'number') {
                        return this.compare((b[field]), (a[field]));
                    } else {
                        return this.compare(_.lowerCase(b[field]), _.lowerCase(a[field]));
                    }
                } else {
                    return 0;
                }
            });
        } else {
            records = records.sort((a, b) => {
                return this.compare(b._metadata.lastUpdated, a._metadata.lastUpdated);
            });
        }
        return records;
    }

    get app() {
        return this.commonService.app._id;
    }

    navigate(id) {
        this.router.navigate(['/app/', this.app, 'gs', id])
    }
}
