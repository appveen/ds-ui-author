import { Component, OnInit, ViewChild, OnDestroy, EventEmitter, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { CommonService, GetOptions } from '../../utils/services/common.service';
import { AppService } from '../../utils/services/app.service';
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';

@Component({
    selector: 'odp-library',
    templateUrl: './library.component.html',
    styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit, OnDestroy {

    @ViewChild('newLibraryModal', { static: false }) newLibraryModal: TemplateRef<HTMLElement>;
    app: string;
    searchForm: FormGroup;
    libraryList: Array<any> = [];
    config: GetOptions;
    alertModal: {
        statusChange?: boolean;
        title: string;
        message: string;
        index: number;
    };
    showLazyLoader = true;
    showCardMenu: any = {};
    subscriptions: any = {};
    showAddButton: boolean;
    breadcrumbPaths: Array<Breadcrumb>;
    openDeleteModal: EventEmitter<any>;
    newLibraryModalRef: NgbModalRef;
    form: FormGroup;
    constructor(private commonService: CommonService,
        private appService: AppService,
        private router: Router,
        private fb: FormBuilder,
        private ts: ToastrService) {
        const self = this;
        self.searchForm = self.fb.group({
            searchField: ['name', [Validators.required]],
            searchTerm: ['', [Validators.required]]
        });
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
        self.openDeleteModal = new EventEmitter();
        self.config = {
            page: 1,
            count: 30
        };
        self.form = self.fb.group({
            name: [null, [Validators.required, Validators.maxLength(40), Validators.pattern(/\w+/)]],
            description: [null, [Validators.maxLength(240), Validators.pattern(/\w+/)]]
        });
    }

    ngOnInit() {
        const self = this;
        self.app = self.commonService.app._id;
        self.showLazyLoader = true;
        self.commonService.apiCalls.componentLoading = false;
        self.clearSearch();
        self.subscriptions['changeApp'] = self.commonService.appChange.subscribe(_app => {
            self.commonService.apiCalls.componentLoading = false;
            self.showLazyLoader = true;
            self.libraryList = [];
            self.clearSearch();
        });

    }

    ngOnDestroy() {
        const self = this;
        Object.keys(self.subscriptions).forEach(e => {
            self.subscriptions[e].unsubscribe();
        });
        if (self.newLibraryModalRef) {
            self.newLibraryModalRef.close();
        }
    }

    newLibrary() {
        const self = this;
        self.newLibraryModalRef = self.commonService.modal(self.newLibraryModal, { size: 'sm' });
        self.newLibraryModalRef.result.then(close => {
            if (close && self.form.valid) {
                self.triggerLibraryCreate();
            }
            self.form.reset();
        }, dismiss => {
            self.form.reset();
        });
    }

    triggerLibraryCreate() {
        const self = this;
        const payload = self.form.value;
        payload.app = self.commonService.app._id;
        self.showLazyLoader = true;
        self.commonService.post('serviceManager', '/globalSchema', payload).subscribe(res => {
            self.ts.success('Library Created.');
            self.appService.editLibraryId = res._id;
            self.showLazyLoader = false;
            self.router.navigate(['/app/', self.commonService.app._id, 'gs', res._id]);
        }, err => {
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

    loadMore(event) {
        const self = this;
        if (event.target.scrollTop >= 244) {
            self.showAddButton = true;
        } else {
            self.showAddButton = false;
        }
        if (event.target.scrollTop + event.target.offsetHeight === event.target.children[0].offsetHeight) {
            self.config.page = self.config.page + 1;
            self.getLibraries();
        }
    }

    clearSearch() {
        const self = this;
        self.libraryList = [];
        self.config.page = 1;
        self.config.filter = null;
        self.getLibraries();
    }

    getLibraries() {
        const self = this;
        if (self.subscriptions['getLibraries']) {
            self.subscriptions['getLibraries'].unsubscribe();
        }
        self.showLazyLoader = true;
        self.subscriptions['getLibraries'] = self.commonService.get('serviceManager', '/globalSchema', self.config).subscribe(res => {
            self.showLazyLoader = false;
            if (res.length > 0) {
                res.forEach(_library => {
                    if (_library.definition) {
                        _library._attributes = _library.definition[0].definition.length;
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

    search(value) {
        const self = this;
        if (!value || !value.trim() || value.trim().length < 3) {
            return;
        }
        if (!self.config.filter) {
            self.config.filter = {};
        }
        self.config.filter.name = '/' + value.trim() + '/';
        self.libraryList = [];
        self.getLibraries();
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
            const url = '/globalSchema/' + self.libraryList[data.index]._id;
            self.showLazyLoader = true;
            self.subscriptions['deleteLibrary'] = self.commonService.delete('serviceManager', url).subscribe(_d => {
                self.showLazyLoader = false;
                self.ts.info(_d.message ? _d.message : 'Library deleted');
                self.clearSearch();
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
}
