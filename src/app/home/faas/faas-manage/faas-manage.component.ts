import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { switchMap } from 'rxjs/operators';
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';

import { AppService } from 'src/app/utils/services/app.service';
import { CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-faas-manage',
  templateUrl: './faas-manage.component.html',
  styleUrls: ['./faas-manage.component.scss']
})
export class FaasManageComponent implements OnInit, OnDestroy {


  @ViewChild('pageChangeModalTemplate', { static: false }) pageChangeModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild('keyValModalTemplate', { static: false }) keyValModalTemplate: TemplateRef<HTMLElement>;
  pageChangeModalTemplateRef: NgbModalRef;
  keyValModalTemplateRef: NgbModalRef;
  edit: any;
  subscriptions: any;
  apiCalls: any;
  oldData: any;
  headerData: any;
  faasData: any;
  breadcrumbPaths: Array<Breadcrumb>;
  content: any;
  selectedEditorTheme: string;
  selectedFontSize: number;
  showCodeEditor: boolean;
  showConsole: boolean;
  loadingLogs: boolean;
  logs: Array<any>;
  constructor(private commonService: CommonService,
    private appService: AppService,
    private route: ActivatedRoute,
    private router: Router,
    private ele: ElementRef,
    private ts: ToastrService) {
    this.subscriptions = {};
    this.edit = {
      status: false,
      id: null,
      editClicked: false
    };
    this.breadcrumbPaths = [];
    this.apiCalls = {};
    this.faasData = {};
    this.selectedEditorTheme = 'vs-light';
    this.selectedFontSize = 14;
    this.ele.nativeElement.classList.add('h-100');
    this.logs = [];
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params && params.id) {
        this.edit.id = params.id;
        if (this.appService.edit) {
          this.edit.editClicked = true;
          this.appService.edit = null;
          this.edit.status = true;
        }
        this.getFaas(params.id, this.edit.status);
      } else {
        this.edit.status = true;
      }
    });
  }

  ngOnDestroy() {
    Object.keys(this.subscriptions).forEach(key => {
      if (this.subscriptions[key]) {
        this.subscriptions[key].unsubscribe();
      }
    });
    if (this.pageChangeModalTemplateRef) {
      this.pageChangeModalTemplateRef.close(false);
    }
  }

  getFaas(id: string, draft?: boolean) {
    this.apiCalls.getFaas = true;
    let path = `/${this.commonService.app._id}/faas/${id}`;
    if (draft) {
      path += '?draft=true';
    }
    this.showCodeEditor = false;
    this.subscriptions['getFaas'] = this.commonService.get('partnerManager', path).subscribe(res => {
      this.apiCalls.getFaas = false;
      this.showCodeEditor = true;
      this.faasData = this.appService.cloneObject(res);
      delete this.faasData.__v;
      delete this.faasData._metadata;
      this.oldData = this.appService.cloneObject(this.faasData);
      this.appService.updateCodeEditorState.emit(this.edit);
    }, err => {
      this.apiCalls.getFaas = false;
      this.commonService.errorToast(err);
    });
  }

  discardDraft() {
    const path = `/${this.commonService.app._id}/faas/utils/${this.edit.id}/draftDelete`;
    this.apiCalls.discardDraft = true;
    this.subscriptions['discardDraft'] = this.commonService.put('partnerManager', path, {}).subscribe(res => {
      this.apiCalls.discardDraft = false;
      this.getFaas(this.faasData._id);
    }, err => {
      this.apiCalls.discardDraft = false;
      this.commonService.errorToast(err);
    });
  }

  enableEditing() {
    this.edit.status = true;
    if (this.faasData.draftVersion) {
      this.getFaas(this.faasData._id, true);
    } else {
      this.appService.updateCodeEditorState.emit(this.edit);
    }
  }

  saveDummyCode(deploy?: boolean) {
    this.faasData.app = this.commonService.app._id;
    let request;
    this.apiCalls.save = true;

    if (deploy) {
      this.faasData.status = 'RUNNING';
    }

    if (this.edit.id) {
      request = this.commonService.put('partnerManager', `/${this.commonService.app._id}/faas/${this.edit.id}`, this.faasData);
    } else {
      request = this.commonService.post('partnerManager', `/${this.commonService.app._id}/faas`, this.faasData);
    }

    this.subscriptions['save'] = request.subscribe(res => {
      this.apiCalls.save = false;
      this.edit.status = false;
      if (deploy) {
        this.apiCalls.deploy = false;
        this.ts.success('Saved ' + this.faasData.name + ' and deployment process has started.');
        this.router.navigate(['/app', this.commonService.app._id, 'faas']);
      } else {
        this.ts.success('Saved ' + this.faasData.name + '.');
        this.router.navigate(['/app', this.commonService.app._id, 'faas']);
      }
    }, err => {
      this.apiCalls.save = false;
      this.commonService.errorToast(err);
    });


  }

  save(deploy?: boolean) {
    this.faasData.app = this.commonService.app._id;
    let request;
    this.apiCalls.save = true;


    if (this.edit.id) {
      request = this.commonService.put('partnerManager', `/${this.commonService.app._id}/faas/${this.edit.id}`, this.faasData);
    } else {
      request = this.commonService.post('partnerManager', `/${this.commonService.app._id}/faas`, this.faasData);
    }

    this.subscriptions['save'] = request.subscribe(res => {
      this.apiCalls.save = false;
      this.edit.status = false;
      if (deploy) {
        this.deploy();
      } else {
        this.ts.success('Saved ' + this.faasData.name + '.');
        this.router.navigate(['/app', this.commonService.app._id, 'faas']);
      }
    }, err => {
      this.apiCalls.save = false;
      this.commonService.errorToast(err);
    });

  }

  deploy() {
    if (this.edit.id) {
      this.apiCalls.deploy = true;
      this.commonService.put('partnerManager', `/${this.commonService.app._id}/faas/utils/${this.edit.id}/deploy`, { app: this.commonService.app._id }).subscribe(res => {
        this.apiCalls.deploy = false;
        this.ts.success('Saved ' + this.faasData.name + ' and deployment process has started.');
        this.router.navigate(['/app', this.commonService.app._id, 'faas']);
      }, err => {
        this.apiCalls.deploy = false;
        this.commonService.errorToast(err);
      });
    }
  }

  cancel() {
    if (!this.edit.status || this.edit.editClicked || !this.edit.id) {
      this.router.navigate(['/app', this.commonService.app._id, 'faas']);
    } else {
      if (!this.edit.editClicked) {
        this.edit.status = false;
        this.getFaas(this.edit.id);
      }
    }
  }

  testRun() {
    this.apiCalls.testRun = true;
    this.commonService.put('partnerManager', `/${this.commonService.app._id}/faas/utils/${this.edit.id}/test`, {
      code: this.faasData.code,
      port: this.faasData.port
    }).subscribe(res => {
      this.apiCalls.testRun = false;
      this.ts.info('There are no syntax errors!');
    }, err => {
      this.apiCalls.testRun = false;
      this.commonService.errorToast(err);
    });
  }

  toggleConsole() {
    if (this.showConsole) {
      this.loadingLogs = true;
      this.commonService.get('mon', `/${this.commonService.app._id}/${this.edit.id}/console/logs/count`, { noApp: true }).pipe(
        switchMap(e => {
          let page = 1;
          let count = e;
          if (e >= 150) {
            count = 100;
            page = Math.ceil(e / 100);
          }
          return this.commonService.get('mon', `/${this.commonService.app._id}/${this.edit.id}/console/logs`, {
            page,
            count,
            noApp: true,
            sort: 'startTime'
          })
        })
      ).subscribe(res => {
        this.loadingLogs = false;
        this.logs = res;
      }, err => {
        this.loadingLogs = false;
        this.commonService.errorToast(err);
      });
    }
  }

  get apiCallsPending() {
    return Object.values(this.apiCalls).some(e => e);
  }

  get isValidSchema() {
    return true;
  }

  get namespace() {
    if (this.faasData && this.faasData.namespace) {
      return this.faasData.namespace.split('-')[0];
    }
    return '-';
  }

  get fqdn() {
    if (this.commonService.userDetails && this.commonService.userDetails.fqdn) {
      return this.commonService.userDetails.fqdn;
    }
    return '-';
  }

  get hasDeployPermission() {
    return this.commonService.hasPermission('PMFPD')
  }

  get hasManagePermission() {
    return this.commonService.hasPermission('PMF')
  }
}
