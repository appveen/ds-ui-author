import { Component, OnInit, ViewChild, TemplateRef, OnDestroy, EventEmitter } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AgGridColumn, AgGridAngular } from 'ag-grid-angular';
import { GridReadyEvent, IDatasource, IGetRowsParams } from 'ag-grid-community';
import { of, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { environment } from 'src/environments/environment';
import { AgentGridFilterComponent } from './agent-grid-filter/agent-grid-filter.component';
import { AgentGridCellComponent } from './agent-grid-cell/agent-grid-cell.component';

@Component({
    selector: 'odp-agents',
    templateUrl: './agents.component.html',
    styleUrls: ['./agents.component.scss']
})
export class AgentsComponent implements OnInit, OnDestroy {
    @ViewChild('agGrid') agGrid: AgGridAngular;
    @ViewChild('newAgentModalTemplate', { static: false }) newAgentModalTemplate: TemplateRef<HTMLElement>;
    newAgentModalTemplateRef: NgbModalRef;
    apiConfig: GetOptions;
    agentType: string;
    agentData: any;
    columnDefs: Array<AgGridColumn>;
    dataSource: IDatasource;
    sortModel: any;
    filterModel: any;
    totalCount: number;
    loadedCount: number;
    subscriptions: any;
    showContextMenu: any;
    selectedRow: any;
    selectedAgent: any;
    sendOption: EventEmitter<any>;
    noRowsTemplate;
    colWidthMap: any;
    processingRequest: boolean;
    canceller = new Subject();

    constructor(
        public commonService: CommonService,
        private appService: AppService
    ) {
        const self = this;
        self.apiConfig = {};
        self.apiConfig.page = 1;
        self.apiConfig.count = 30;
        self.agentType = 'APPAGENT';
        self.agentData = {};
        self.subscriptions = {};
        self.totalCount = 0;
        self.loadedCount = 0;
        self.sendOption = new EventEmitter();
        self.noRowsTemplate = '<span>No records to display</span>';
    }

    ngOnInit() {
        const self = this;
        self.configureColumns();
        self.dataSource = {
            getRows: (params: IGetRowsParams) => {
                if (this.processingRequest) {
                    this.canceller.next(1);
                }
                this.processingRequest = true;
                self.agGrid.api.showLoadingOverlay();
                self.apiConfig.page = Math.ceil((params.endRow / 30));
                if (self.apiConfig.page === 1) {
                    self.loadedCount = 0;
                }
                if (!self.apiConfig.filter) {
                    self.apiConfig.filter = {};
                }
                self.apiConfig.filter['type'] = self.agentType;
                self.apiConfig.sort = self.appService.getSortFromModel(self.agGrid.api.getSortModel());
                if (!!this.subscriptions['data_' + this.apiConfig.page]) {
                    this.subscriptions['data_' + this.apiConfig.page].unsubscribe();
                }
                this.subscriptions['data_' + this.apiConfig.page] = this.getAgentCount()
                    .pipe(
                        takeUntil(this.canceller),
                        switchMap(count => {
                            this.totalCount = count;
                            if (self.totalCount > 0) {
                                return self.getAgentList().pipe(takeUntil(this.canceller))
                            } else {
                                self.agGrid.api.hideOverlay();
                                self.agGrid.api.showNoRowsOverlay();
                                this.processingRequest = false;
                                return of(null);
                            }
                        })
                    ).subscribe(
                        docs => {
                            if (!!docs) {
                                self.loadedCount += docs.length;
                                self.agGrid.api.hideOverlay();
                                if (self.loadedCount < self.totalCount) {
                                    params.successCallback(docs);
                                } else {
                                    self.totalCount = self.loadedCount;
                                    params.successCallback(docs, self.totalCount);
                                }
                                this.processingRequest = false;
                            }
                        },
                        err => {
                            self.agGrid.api.hideOverlay();
                            console.error(err);
                            params.failCallback();
                            this.processingRequest = false;
                        }
                    );
            }
        };
    }

    ngOnDestroy() {
        const self = this;
        if (self.newAgentModalTemplateRef) {
            self.newAgentModalTemplateRef.close();
        }
        Object.keys(self.subscriptions).forEach(key => {
            if (self.subscriptions[key]) {
                self.subscriptions[key].unsubscribe();
            }
        });
    }

    configureColumns() {
        const self = this;
        const columns = [];
        let col = new AgGridColumn();
        col.headerName = 'Name';
        col.field = 'name';
        col.pinned = 'left';
        col.lockPinned = true;
        col.width = 180;
        col.sort = 'asc';
        columns.push(col);
        col = new AgGridColumn();
        col.headerName = 'Password';
        col.field = 'password';
        col.width = 120;
        col.cellRendererParams = {
            onClick: AgentGridCellComponent.bind(this),
            label: 'Click'
        };
        columns.push(col);
        col = new AgGridColumn();
        col.headerName = 'IP Address';
        col.field = 'ipAddress';
        col.width = 150;
        columns.push(col);
        col = new AgGridColumn();
        col.headerName = 'MAC Address';
        col.field = 'macAddress';
        col.width = 150;
        columns.push(col);
        col = new AgGridColumn();
        col.headerName = 'Streak';
        col.field = 'streak';
        col.width = 100;
        columns.push(col);
        col = new AgGridColumn();
        col.headerName = 'Status';
        col.field = 'status';
        col.width = 100;
        columns.push(col);
        col = new AgGridColumn();
        col.headerName = 'Last Invoked';
        col.field = 'lastInvokedAt';
        col.width = 180;
        columns.push(col);
        col = new AgGridColumn();
        col.headerName = 'Release';
        col.field = 'release';
        col.width = 110;
        columns.push(col);
        col = new AgGridColumn();
        col.headerName = 'Pending Files';
        col.field = 'pendingFiles';
        col.width = 140;
        columns.push(col);
        col = new AgGridColumn();
        col.headerName = 'Options';
        col.field = '_options';
        col.pinned = 'right';
        col.lockPinned = true;
        columns.push(col);
        columns.forEach((item: AgGridColumn) => {
            item.suppressMovable = true;
            item.resizable = true;
            if (item.field !== '_options') {
                item.sortable = true;
                item.filter = 'agTextColumnFilter';
                item.floatingFilterComponentFramework = AgentGridFilterComponent;
            }
            item.cellRendererFramework = AgentGridCellComponent;
        });
        self.columnDefs = columns;
    }

    selectAgentList() {
        this.apiConfig.filter = {
            type: this.agentType,
            app: this.commonService.app._id
        };
        this.filterModel = null;
        this.agGrid.api.setFilterModel(null);
        const allColumns = this.agGrid.columnApi.getAllColumns();
        this.colWidthMap[
            this.agentType === 'APPAGENT' ? 'PARTNERAGENT' : 'APPAGENT'
        ] = allColumns.map(col => col.getActualWidth());
        if (!!this.colWidthMap[this.agentType] && !!this.colWidthMap[this.agentType].length) {
            this.agGrid.api.setColumnDefs(null);
            this.columnDefs.forEach((col, index) => {
                col.width = this.colWidthMap[this.agentType][index];
            });
            this.agGrid.api.setColumnDefs(this.columnDefs);
        }
    }

    getAgentCount() {
        const self = this;
        return self.commonService.get('partnerManager', '/agentRegistry/count', self.apiConfig);
    }

    getAgentList() {
        const self = this;
        return self.commonService.get('partnerManager', '/agentRegistry', self.apiConfig);
    }

    gridReady(event: GridReadyEvent) {
        this.sortModel = this.agGrid.api.getSortModel();
        const allWidth = event.columnApi.getAllColumns().map(col => col.getActualWidth());
        this.colWidthMap = {
            'APPAGENT': allWidth,
            'PARTNERAGENT': allWidth
        };
    }

    filterModified(event) {
        const self = this;
        const filter = [];
        const filterModel = self.agGrid.api.getFilterModel();
        self.filterModel = filterModel;
        if (filterModel) {
            Object.keys(filterModel).forEach(key => {
                try {
                    if (filterModel[key].filter) {
                        filter.push(JSON.parse(filterModel[key].filter));
                    }
                } catch (e) {
                    console.error(e);
                }
            });
        }
        if (filter.length > 0) {
            self.apiConfig.filter = { $and: filter };
        } else {
            self.apiConfig.filter = null;
        }
        if (!environment.production) {
            console.log('Filter Modified', filterModel);
        }
    }

    sortChanged(event) {
        const self = this;
        const sortModel = self.agGrid.api.getSortModel();
        self.sortModel = sortModel;
        if (!environment.production) {
            console.log('Sort Modified', sortModel);
        }
    }

    clearFilter() {
        const self = this;
        self.filterModel = null;
        self.apiConfig.filter = null;
        self.agGrid.api.setFilterModel(null);
    }

    clearSort() {
        const self = this;
        self.sortModel = null;
        self.agGrid.api.setSortModel([{ colId: 'name', sort: 'asc' }]);
    }


    get hasFilter() {
        const self = this;
        if (self.filterModel) {
            return Object.keys(self.filterModel).length > 0;
        }
        return false;
    }

    get hasSort() {
        const self = this;
        if (!self.sortModel
            || self.sortModel.findIndex(e => e.colId === 'name') === -1
            || self.sortModel.length !== 1) {
            return true;
        }
        return false;
    }

    newAppAgent() {
        const self = this;
        self.agentData = {
            app: self.commonService.app._id,
            type: 'APPAGENT',
            encryptFile: true,
            retainFileOnSuccess: true,
            retainFileOnError: true
        };
        self.newAgentModalTemplateRef = self.commonService.modal(self.newAgentModalTemplate, { centered: true });
        self.newAgentModalTemplateRef.result.then(close => {
            if (close) {
                if (!self.agentData.name) {
                    return;
                }
                delete self.agentData.isEdit;
                self.agGrid.api.showLoadingOverlay();
                self.commonService.post('partnerManager', '/agentRegistry', self.agentData).subscribe(res => {
                    self.agentType = 'APPAGENT';
                    self.selectAgentList();
                    self.agGrid.api.hideOverlay();
                }, err => {
                    self.agGrid.api.hideOverlay();
                    self.commonService.errorToast(err);
                });
            }
        }, dismiss => { });
    }

    toCapitalize(text: string) {
        const self = this;
        return text ? self.appService.toCapitalize(text) : null;
    }

    hasPermission(roleId: string, entity?: string) {
        const self = this;
        return self.commonService.hasPermission(roleId, entity);
    }

    onRightClick(event) {
        const self = this;
        self.selectedRow = event;
        self.selectedAgent = event.data;
        self.showContextMenu = true;
        console.log(event);
    }
    closeContextMenu() {
        const self = this;
        self.showContextMenu = false;
    }
    getPosition() {
        const self = this;
        let position = {};
        let top = 290;
        if (self.loadedCount > 1) {
            top = 220;
        }
        if (self.selectedRow) {
            let left = self.selectedRow.event.clientX;
            if (left + 200 > window.outerWidth) {
                left -= 180;
            }
            position = {
                top: self.selectedRow.event.clientY - top + 'px',
                left: left - 180 + 'px'
            };
        }
        return position;
    }

    activateOption(type: string) {
        const self = this;
        self.sendOption.emit({
            agent: self.selectedAgent,
            type
        });
    }

    updateStatus(event) {
        const self = this;
        if (!event.reload) {
            if (event.type === 'disable') {
                self.selectedAgent.status = 'DISABLED';
            } else {
                self.selectedAgent.status = 'STOPPED';
            }
        } else {
            self.selectAgentList();
        }
    }
    hasViewPermission(id, role: string) {
        const self = this;
        if (self.commonService.isAppAdmin || self.commonService.userDetails.isSuperAdmin) {
            return true;
        }

        const list = self.commonService.getEntityPermissions('AGENT_' + id);

        let inAllPermission: boolean;
        let inListPermission: boolean;

        inAllPermission = self.hasPermission(role, 'AGENT');

        inListPermission = Boolean(list.find(e => e.id === role));

        if (list.length === 0 && inAllPermission) {
            return true;
        }
        return list.length > 0 && inListPermission;
    }
}
