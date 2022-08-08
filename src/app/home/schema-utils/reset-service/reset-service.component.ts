import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/utils/services/app.service';
import { CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-reset-service',
  templateUrl: './reset-service.component.html',
  styleUrls: ['./reset-service.component.scss']
})
export class ResetServiceComponent implements OnInit {

  @ViewChild('purgeModalTemplate', { static: false }) purgeModalTemplate: TemplateRef<HTMLElement>;
  @Input() form: FormGroup;
  @Input() edit: any;
  confirmServiceName: string;
  purgeModalTemplateRef: NgbModalRef;
  purgeModal: {
    title: string,
    desc: string,
    btnText: string,
    type: string
  };
  subscriptions: any = {};
  constructor(private commonService: CommonService,
    private appService: AppService,
    private router: Router,
    private ts: ToastrService) {
    this.purgeModal = {
      title: '',
      desc: '',
      btnText: '',
      type: ''
    };
    this.confirmServiceName = '';
  }

  ngOnInit() {
  }


  purgeData(dataType?: string) {
    switch (dataType) {
      case 'logs': {
        this.purgeModal = {
          title: 'Purge all saved logs?',
          desc: 'This action cannot be undone. This will permanently delete logs.',
          btnText: 'I understand, Clear logs',
          type: 'log'
        };
        break;
      }
      case 'audits': {
        this.purgeModal = {
          title: 'Purge all saved audits?',
          desc: 'This action cannot be undone. This will permanently delete audits.',
          btnText: 'I understand, Clear audits',
          type: 'audit'
        };
        break;
      }
      case 'all': {
        this.purgeModal = {
          title: 'Purge all data?',
          desc: 'This action cannot be undone. This will permanently delete all data.',
          btnText: 'I understand, Clear data',
          type: 'all'
        };
        break;
      }
      default: {
        break;
      }
    }
    this.confirmServiceName = '';
    this.purgeModalTemplateRef = this.commonService.modal(this.purgeModalTemplate, { centered: true, windowClass: 'purge-model' });
    this.purgeModalTemplateRef.result.then((close) => {
      if (close) {
        if (this.confirmServiceName === this.form.value.name) {
          this.subscriptions['purge'] = this.commonService.delete('serviceManager',
            `/${this.commonService.app._id}/service/utils/${this.appService.purgeServiceId}/purge/${this.purgeModal.type}`)
            .subscribe(() => {
              this.confirmServiceName = '';
              this.purgeModalTemplateRef.close();
              this.router.navigate(['/app/', this.commonService.app._id, 'sm']);
            }, (err) => {
              this.ts.error(err.error.message);
              this.confirmServiceName = '';
              this.purgeModalTemplateRef.close();
            });
        } else {
          this.ts.warning('Sorry, Service name mismatch');
          this.confirmServiceName = null;
        }
      }
    }, dismiss => { });
  }

  hasPermission(type: string, entity?: string) {
    return this.commonService.hasPermission(type, entity);
  }

  hasPermissionStartsWith(type: string, entity?: string) {
    return this.commonService.hasPermissionStartsWith(type, entity);
  }

  canEdit(type: string) {
    if (this.hasPermission('PMDS' + type, 'SM')) {
      return true;
    }
    return false;
  }

  canView(type: string) {
    if (this.hasPermission('PMDS' + type, 'SM')
      || this.hasPermission('PVDS' + type, 'SM')) {
      return true;
    }
    return false;
  }

  isAdmin() {
    if (!this.commonService.userDetails.isSuperAdmin
      && this.commonService.isAppAdmin) {
      return true;
    } else
      return false
  }

  get id() {
    return this.edit._id;
  }
}
