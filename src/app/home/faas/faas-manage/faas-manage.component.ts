import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
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
  codeMirrorOptions: any;
  constructor(private commonService: CommonService,
    private appService: AppService,
    private route: ActivatedRoute,
    private router: Router,
    private ts: ToastrService) {
    this.subscriptions = {};
    this.edit = {
      status: false,
      id: null,
      editClicked: false
    };
    this.codeMirrorOptions = {
      lineNumbers: true,
      theme: 'material',
      mode: 'javascript'
    };
    this.breadcrumbPaths = [];
    this.apiCalls = {};
    this.faasData = {};
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
        this.getFaas(params.id);
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

  getFaas(id: string) {
    this.subscriptions['getFaas'] = this.commonService.get('partnerManager', '/faas/' + id).subscribe(res => {
      this.faasData = this.appService.cloneObject(res);
      delete this.faasData.__v;
      delete this.faasData._metadata;
      this.oldData = this.appService.cloneObject(this.faasData);
    }, err => {
      this.commonService.errorToast(err);
    });
  }

  save() {
    this.faasData.app = this.commonService.app._id;
    let request;
    if (this.edit.id) {
      request = this.commonService.put('partnerManager', '/faas/' + this.edit.id, this.faasData);
    } else {
      request = this.commonService.post('partnerManager', '/faas', this.faasData);
    }
    this.subscriptions['save'] = request.subscribe(res => {
      this.edit.status = false;
      this.router.navigate(['/app', this.commonService.app._id, 'nsl']);
    }, err => {
      this.commonService.errorToast(err);
    });
  }

  cancel() {
    if (!this.edit.status || this.edit.editClicked || !this.edit.id) {
      this.router.navigate(['/app', this.commonService.app._id, 'faas']);
    } else {
      if (!this.edit.editClicked) {
        this.edit.status = false;
      }
    }
  }

  get apiCallsPending() {
    return Object.values(this.apiCalls).some(e => e);
  }

}
