import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { switchMap } from 'rxjs/operators';
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';

import { AppService } from 'src/app/utils/services/app.service';
import { CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-b2b-flows-manage',
  templateUrl: './b2b-flows-manage.component.html',
  styleUrls: ['./b2b-flows-manage.component.scss']
})
export class B2bFlowsManageComponent implements OnInit {

  @ViewChild('pageChangeModalTemplate', { static: false }) pageChangeModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild('keyValModalTemplate', { static: false }) keyValModalTemplate: TemplateRef<HTMLElement>;
  pageChangeModalTemplateRef: NgbModalRef;
  keyValModalTemplateRef: NgbModalRef;
  edit: any;
  subscriptions: any;
  apiCalls: any;
  oldData: any;
  headerData: any;
  flowData: any;
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
    this.flowData = {};
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
        this.getFlow(params.id, this.edit.status);
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

  getFlow(id: string, draft?: boolean) {
    this.apiCalls.getFlow = true;
    let path = `/${this.commonService.app._id}/flow/${id}`;
    if (draft) {
      path += '?draft=true';
    }
    this.showCodeEditor = false;
    this.subscriptions['getFlow'] = this.commonService.get('partnerManager', path).subscribe(res => {
      this.apiCalls.getFlow = false;
      this.showCodeEditor = true;
      this.flowData = this.appService.cloneObject(res);
      delete this.flowData.__v;
      delete this.flowData._metadata;
      this.oldData = this.appService.cloneObject(this.flowData);
      this.appService.updateCodeEditorState.emit(this.edit);
    }, err => {
      this.apiCalls.getFlow = false;
      this.commonService.errorToast(err);
    });
  }

  discardDraft() {
    const path = `/${this.commonService.app._id}/flow/utils/${this.edit.id}/draftDelete`;
    this.apiCalls.discardDraft = true;
    this.subscriptions['discardDraft'] = this.commonService.put('partnerManager', path, {}).subscribe(res => {
      this.apiCalls.discardDraft = false;
      this.getFlow(this.flowData._id);
    }, err => {
      this.apiCalls.discardDraft = false;
      this.commonService.errorToast(err);
    });
  }

  enableEditing() {
    this.edit.status = true;
    if (this.flowData.draftVersion) {
      this.getFlow(this.flowData._id, true);
    } else {
      this.appService.updateCodeEditorState.emit(this.edit);
    }
  }

  saveDummyCode(deploy?: boolean) {
    this.flowData.app = this.commonService.app._id;
    let request;
    this.apiCalls.save = true;

    if (deploy) {
      this.flowData.status = 'RUNNING';
    }

    if (this.edit.id) {
      request = this.commonService.put('partnerManager', `/${this.commonService.app._id}/flow/${this.edit.id}`, this.flowData);
    } else {
      request = this.commonService.post('partnerManager', `/${this.commonService.app._id}/flow`, this.flowData);
    }

    this.subscriptions['save'] = request.subscribe(res => {
      this.apiCalls.save = false;
      this.edit.status = false;
      if (deploy) {
        this.apiCalls.deploy = false;
        this.ts.success('Saved ' + this.flowData.name + ' and deployment process has started.');
        this.router.navigate(['/app', this.commonService.app._id, 'flow']);
      } else {
        this.ts.success('Saved ' + this.flowData.name + '.');
        this.router.navigate(['/app', this.commonService.app._id, 'flow']);
      }
    }, err => {
      this.apiCalls.save = false;
      this.commonService.errorToast(err);
    });


  }

  save(deploy?: boolean) {
    this.flowData.app = this.commonService.app._id;
    let request;
    this.apiCalls.save = true;


    if (this.edit.id) {
      request = this.commonService.put('partnerManager', `/${this.commonService.app._id}/flow/${this.edit.id}`, this.flowData);
    } else {
      request = this.commonService.post('partnerManager', `/${this.commonService.app._id}/flow`, this.flowData);
    }

    this.subscriptions['save'] = request.subscribe(res => {
      this.apiCalls.save = false;
      this.edit.status = false;
      if (deploy) {
        this.deploy();
      } else {
        this.ts.success('Saved ' + this.flowData.name + '.');
        this.router.navigate(['/app', this.commonService.app._id, 'flow']);
      }
    }, err => {
      this.apiCalls.save = false;
      this.commonService.errorToast(err);
    });

  }

  deploy() {
    if (this.edit.id) {
      this.apiCalls.deploy = true;
      this.commonService.put('partnerManager', `/${this.commonService.app._id}/flow/utils/${this.edit.id}/deploy`, { app: this.commonService.app._id }).subscribe(res => {
        this.apiCalls.deploy = false;
        this.ts.success('Saved ' + this.flowData.name + ' and deployment process has started.');
        this.router.navigate(['/app', this.commonService.app._id, 'flow']);
      }, err => {
        this.apiCalls.deploy = false;
        this.commonService.errorToast(err);
      });
    }
  }

  cancel() {
    if (!this.edit.status || this.edit.editClicked || !this.edit.id) {
      this.router.navigate(['/app', this.commonService.app._id, 'flow']);
    } else {
      if (!this.edit.editClicked) {
        this.edit.status = false;
        this.getFlow(this.edit.id);
      }
    }
  }

  testRun() {
    this.apiCalls.testRun = true;
    this.commonService.put('partnerManager', `/${this.commonService.app._id}/flow/utils/${this.edit.id}/test`, {
      code: this.flowData.code,
      port: this.flowData.port
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
    if (this.flowData && this.flowData.namespace) {
      return this.flowData.namespace.split('-')[0];
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

  get code() {
    const temp: any = {};
    temp.inputStage = JSON.parse(JSON.stringify(this.flowData.inputStage));
    temp.stages = JSON.parse(JSON.stringify(this.flowData.stages || []));
    temp.dataStructures = JSON.parse(JSON.stringify(this.flowData.dataStructures || []));
    return JSON.stringify(temp, null, 4);
  }

  set code(data: string) {
    const temp = JSON.parse(data);
    this.flowData.inputStage = temp.inputStage;
    this.flowData.stages = temp.stages || [];
    this.flowData.dataStructures = temp.dataStructures || {};
  }
}
