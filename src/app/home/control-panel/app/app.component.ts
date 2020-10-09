import { Component, OnInit, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbTooltipConfig, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { maxLenValidator, restrictSpecialChars } from 'src/app/home/custom-validators/min-max-validator';
import { App } from 'src/app/utils/interfaces/app';

@Component({
    selector: 'odp-control-panel-app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, OnDestroy {

    searchForm: FormGroup;
    appList: Array<App>;
    appConfig: GetOptions = {};
    appForm: FormGroup;
    operation: string;
    subscriptions: any = {};
    alert: {
        title?: string;
        message?: string;
        cancleBtn?: boolean;
    } = {};
    noMoreApp: boolean;
    showLazyLoader: boolean;
    app: string;
    @ViewChild('alertModal', { static: false }) alertModal;
    @HostListener('window:beforeunload', ['$event'])
    appOpsRef: NgbModalRef;
    alertModalRef: NgbModalRef;
    public beforeunloadHandler($event) {
        if (this.appForm.dirty) {
            $event.returnValue = 'Are you sure?';
        }
    }
    constructor(private fb: FormBuilder,
        private commonService: CommonService,
        private ts: ToastrService,
        private ngbConf: NgbTooltipConfig) {
        const self = this;
        self.ngbConf.container = 'body';
        self.appList = [];
        self.showLazyLoader = true;
    }

    ngOnInit() {
        const self = this;
        self.appConfig.page = 1;
        self.appConfig.count = 30;
        self.app = self.commonService.app._id;
        self.commonService.apiCalls.componentLoading = false;
        self.getAppList();
        self.subscriptions['appCreation'] = self.commonService.appCreation.subscribe(event => {
            self.appConfig.page = 1;
            self.appConfig.count = 30;
            self.appList = [];
            self.getAppList();
        });
        self.searchForm = self.fb.group({
            searchTerm: ['', Validators.required]
        });
        self.appForm = self.fb.group({
            _id: [null, [Validators.required, maxLenValidator(40), restrictSpecialChars.bind(this)]],
            type: ['Management', Validators.required],
            description: [null, maxLenValidator(250)]
        });
    }
    ngOnDestroy() {
        const self = this;
        Object.keys(self.subscriptions).forEach(e => {
            if (self.subscriptions[e]) {
                self.subscriptions[e].unsubscribe();
            }
        });
        if (self.appOpsRef) {
            self.appOpsRef.close();
        }
        if (self.alertModalRef) {
            self.alertModalRef.close();
        }
    }

    addApp(appOps) {
        const self = this;
        self.operation = 'Add';
        self.appForm.controls['_id'].enable();
        self.appForm.reset({ type: 'Management' });
        self.appOpsRef = self.commonService.modal(appOps);
        self.appOpsRef.result.then(close => {
            if (close) {
                let response;
                response = self.commonService.post('user', '/app', self.appForm.value);
                self.subscriptions['createapp'] = response.subscribe(() => {
                    self.ts.success('Saved ' + self.appForm.get('_id').value + '.');
                    self.appList = [];
                    self.appConfig.page = 1;
                    self.getAppList();
                    self.appForm.reset({ type: 'Management' });
                }, err => { self.commonService.errorToast(err, 'Unable to create app, please try again later'); });
            }
        }, dismiss => { });
    }
    editApp(appOps, id) {
        const self = this;
        self.appForm.controls['_id'].disable();
        self.operation = 'Edit';
        self.getAppDetails(id);
        self.appOpsRef = self.commonService.modal(appOps);
        self.appOpsRef.result.then(close => {
            if (close) {
                self.subscriptions['createapp'] = self.commonService.put('user', '/app/' + id, self.appForm.value).
                    subscribe(d => {
                        if (d) {
                            self.ts.success('Saved ' + self.appForm.get('_id').value + '.');
                            self.appList = [];
                            self.getAppList();
                            self.appForm.reset({ type: 'Management' });
                        }
                    }, err => { self.commonService.errorToast(err); });
            }
        }, dismiss => { });
    }
    getAppDetails(id) {
        const self = this;
        const options: GetOptions = {
            noApp: true
        };
        self.subscriptions['appdetails'] = self.commonService.get('user', '/app/' + id, options).subscribe(appDetails => {
            self.appForm.patchValue(appDetails);
        }, err => {
            self.commonService.errorToast(err);
        });
    }
    getAppList() {
        const self = this;
        self.appConfig.noApp = true;
        self.showLazyLoader = true;
        self.subscriptions['getapp'] = self.commonService.get('user', '/app', self.appConfig).subscribe(d => {
            self.showLazyLoader = false;
            if (d.length > 0) {
                d.forEach(val => {
                    val.checked = false;
                    self.appList.push(val);
                });
                self.noMoreApp = false;
            } else {
                self.noMoreApp = true;
            }
        }, err => {
            self.showLazyLoader = false;
            self.commonService.errorToast(err);
        });
    }

    delete(id) {
        const self = this;
        if (self.commonService.app._id === id) {
            self.alert.title = 'Can\'t delete';
            self.alert.message = 'You cannot delete an active app, switch to a different app.';
            self.alert.cancleBtn = true;
            self.alertModalRef = self.commonService.modal(self.alertModal);
            self.alertModalRef.result.then(close => { }, dismiss => { });
        } else {
            self.alert.title = 'Delete ' + id;
            self.alert.message = 'Are you sure you want to delete the app "' + id
                + '"? This action will delete the entire app including all '
                + 'the data services within it. This action is undoable.';
            self.alert.cancleBtn = false;
            self.alertModalRef = self.commonService.modal(self.alertModal);
            self.alertModalRef.result.then(close => {
                if (close) {
                    self.subscriptions['deleteapp'] = self.commonService.delete('user', '/app/' + id).subscribe(delres => {
                        self.appList = [];
                        self.appConfig.page = 1;
                        self.getAppList();
                    });
                }
            }, dismiss => { });
        }
    }
    search(event) {
        const self = this;
        if (self.searchForm.get('searchTerm').value && self.searchForm.get('searchTerm').value.trim().length < 3) {
            if (event.type === 'submit') {
            } else {
                return;
            }
        }
        if (!self.searchForm.get('searchTerm').value || self.searchForm.get('searchTerm').value.trim() === '') {
            self.appList = [];
            self.getAppList();
        } else {
            const options: GetOptions = {
                filter: { _id: '/' + self.searchForm.get('searchTerm').value + '/' },
                noApp: true
            };
            self.subscriptions['userapp'] = self.commonService.get('user', '/app', options).subscribe(res => {
                self.appList = res;
            }, err => { self.commonService.errorToast(err); });
        }
    }
    loadApps(e) {
        const self = this;
        if (!self.noMoreApp) {
            if (e.srcElement.offsetHeight + Math.floor(e.srcElement.scrollTop) === e.srcElement.scrollHeight) {
                self.appConfig.page = self.appConfig.page + 1;
                self.getAppList();
            }
        }
    }
}
