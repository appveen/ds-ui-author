import { Component, OnInit, Input, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { LogsService } from 'src/app/home/logs/logs.service';
import { CommonService } from 'src/app/utils/services/common.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from 'src/app/utils/services/app.service';
import { ToastrService } from 'ngx-toastr';
import { AuditLogsComponent } from './audit-logs/audit-logs.component';

@Component({
  selector: 'odp-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit, OnDestroy {
  @ViewChild('auditlog', { static: false }) auditlog: AuditLogsComponent;
  @ViewChild('purgeModalTemplate', { static: false }) purgeModalTemplate: TemplateRef<HTMLElement>;
  service: any;
  activeTab: number;
  subscriptions: any;
  showColumns: boolean;
  showFilters: boolean;
  searchModel: any;
  filterModel: any;
  purgeModal: any;
  purgeModalTemplateRef: NgbModalRef;
  confirmServiceName: string;

  private _dateFrom: Date;
  private _dateTo: Date;
  private _columns: any;
  private _filters: any;
  constructor(private commonService: CommonService,
    private logsService: LogsService,
    private appService: AppService,
    private ts: ToastrService) {
    const self = this;
    self.subscriptions = {};
    self.searchModel = { field: 'url' };
    self.filterModel = {};
    self.dateFrom = new Date();
    self.dateFrom.setDate(self.dateFrom.getDate() - 1);
    self.dateTo = new Date();
  }

  @Input() set serviceObj(val: any) {
    const self = this;
    self.service = val;
  }
  ngOnInit() {
    const self = this;
    self.setActiveTab();

  }

  setActiveTab() {
    const self = this;
    if (self.hasPermission('PVDSA')) {
      self.activeTab = 1;

    }

  }
  ngOnDestroy() {
    const self = this;
    Object.keys(self.subscriptions).forEach(key => {
      if (self.subscriptions[key]) {
        self.subscriptions[key].unsubscribe();
      }
    });
  }

  canPurgeAudit() {
    const self = this;
    if (self.hasPermission('PMDSS', 'SM')) {
      return true;
    }
    return false;
  }

  search() {
    const self = this;
    if (!self.filters) {
      self.filters = {};
    }

    if (self.searchModel.field === 'resStatusCode' || self.searchModel.field === 'retry') {
      self.filters[self.searchModel.field] = parseInt(self.searchModel.term, 10);
    } else {
      if (self.searchModel.term.toUpperCase() === 'CREATE' || self.searchModel.term.toUpperCase() === 'POST') {
        self.filters[self.searchModel.field] = 'POST';
      } else if (self.searchModel.term.toUpperCase() === 'GET') {
        self.filters[self.searchModel.field] = 'GET';
      } else if (self.searchModel.term.toUpperCase() === 'PUT'
        || self.searchModel.term.toUpperCase() === 'UPDATE' || self.searchModel.term.toUpperCase() === 'EDIT') {
        self.filters[self.searchModel.field] = 'PUT';
      } else if (self.searchModel.term.toUpperCase() === 'COMPLETED') {
        self.filters[self.searchModel.field] = 'Completed';
      } else if (self.searchModel.term.toUpperCase() === 'ERROR') {
        self.filters[self.searchModel.field] = 'Error';
      } else if (self.searchModel.term.toUpperCase() === 'Pending') {
        self.filters[self.searchModel.field] = 'Pending';
      } else {
        self.filters[self.searchModel.field] = { '$regex': self.searchModel.term, '$options': 'i' };
      }
    }
    self.logsService.applyFilter.emit(self.filters);
  }
  searchWithDate() {
    const self = this;
    if (self.filterModel.from || self.filterModel.from) {
      if (!self.filters) {
        self.filters = {};
      }
      if (self.filterModel.from) {
        if (!self.filters[self.filterModel.field]) {
          self.filters[self.filterModel.field] = {};
        }
        self.filters[self.filterModel.field]['$gte'] = self.filterModel.from.toISOString();
      }
      if (self.filterModel.to) {
        if (!self.filters[self.filterModel.field]) {
          self.filters[self.filterModel.field] = {};
        }
        self.filters[self.filterModel.field]['$lte'] = self.filterModel.to.toISOString();
      }
      self.logsService.applyFilter.emit(self.filters);
    }
    self.showFilters = false;
  }

  clearSearchWithDate() {
    const self = this;
    self.dateTo = null;
    self.dateFrom = null;
    if (self.filters) {
      delete self.filters[self.filterModel.field];
      if (Object.keys(self.filters).length === 0) {
        self.filters = null;
      }
      self.logsService.applyFilter.emit(self.filters);
    }
  }

  clearSearch() {
    const self = this;
    self.filters = null;
    if (self.activeTab === 0) {
      self.searchModel = { field: 'url' };
    }
    if (self.activeTab === 2) {
      self.searchModel = { field: 'name' };
    }
    if (self.activeTab === 3) {
      self.searchModel = { field: 'name' };
    }
    self.logsService.applyFilter.emit(self.filters);
  }

  checkSearch(event: KeyboardEvent) {
    const self = this;
    if (self.searchModel.term && event.key === 'Enter') {
      self.search();
      return;
    }
    if (self.filters && !self.searchModel.term) {
      self.clearSearch();
    }
  }

  activateTab(index: number) {
    const self = this;
    self.activeTab = index;
    self.clearSearch();
  }

  getKeys(obj) {
    if (obj) {
      return Object.keys(obj);
    }
    return [];
  }

  hasPermission(type: string, entity?: string) {
    const self = this;
    return self.commonService.hasPermission(type, entity);
  }

  hasPermissionStartsWith(type: string, entity?: string) {
    const self = this;
    return self.commonService.hasPermissionStartsWith(type, entity);
  }

  purgeAudit(dataType?: string) {
    const self = this;
    self.purgeModal = {
      title: 'Purge all saved audits?',
      desc: 'This action cannot be undone. This will permanently delete audits.',
      btnText: 'I understand, clear audits',
      type: 'audit'
    };

    self.purgeModalTemplateRef = self.commonService.modal(self.purgeModalTemplate, { centered: true, windowClass: 'purge-model' });
    self.purgeModalTemplateRef.result.then((close) => {
      if (close) {
        if (self.confirmServiceName === self.service.name) {
          self.subscriptions['purge'] = self.commonService.delete('serviceManager',
            `/${this.commonService.app._id}}/service/utils/purge/author-audit/${self.appService.purgeServiceId}`)
            .subscribe((res) => {
              self.confirmServiceName = '';
              self.purgeModalTemplateRef.close();
              self.auditlog.clearFilter();
              self.ts.success('Audit records deleted successfully');
            }, (err) => {
              self.commonService.errorToast(err);
              self.confirmServiceName = '';
              self.purgeModalTemplateRef.close();
            });
        } else {
          self.ts.warning('Sorry, Service name mismatch');
          self.confirmServiceName = null;
        }
      }
    }, dismiss => { });
  }
  get searchOptions() {
    const self = this;
    const temp = [];
    if (self.columns) {
      Object.keys(self.columns).forEach(key => {
        if (self.columns[key].searchField) {
          temp.push(self.columns[key]);
        }
      });
    }
    return temp;
  }

  get dateFields() {
    const self = this;
    const temp = [];
    if (self.columns) {
      Object.keys(self.columns).forEach(key => {
        if (self.columns[key].dateField) {
          temp.push(self.columns[key]);
        }
      });
    }
    if (temp.length > 0) {
      self.filterModel.field = temp[0].dateField;
    }
    return temp;
  }

  public get columns() {
    const self = this;
    return self._columns;
  }
  public set columns(value: any) {
    const self = this;
    self._columns = value;
  }
  public get filters() {
    const self = this;
    return self._filters;
  }
  public set filters(value: any) {
    const self = this;
    self._filters = value;
  }
  public get dateFrom(): Date {
    const self = this;
    return self._dateFrom;
  }
  public set dateFrom(value: Date) {
    const self = this;
    self._dateFrom = value;
    if (value) {
      self.filterModel.from = new Date(value);
    } else {
      delete self.filterModel.from;
    }
  }

  public get dateTo(): Date {
    const self = this;
    return self._dateTo;
  }
  public set dateTo(value: Date) {
    const self = this;
    self._dateTo = value;
    if (value) {
      self.filterModel.to = new Date(value);
    } else {
      delete self.filterModel.to;
    }
  }
}
