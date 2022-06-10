import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';
import { AppService } from 'src/app/utils/services/app.service';
import { CommonService } from 'src/app/utils/services/common.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'odp-bulk-import',
  templateUrl: './bulk-import.component.html',
  styleUrls: ['./bulk-import.component.scss']
})
export class BulkImportComponent implements OnInit {

  showLazyLoader: boolean;
  breadcrumbPaths: Array<Breadcrumb>;
  taskList: Array<any>;
  showUploadWindow: boolean;
  fileAdded: boolean;
  fileInput: HTMLInputElement;
  downloadUrl: string;
  showAzureLoginButton: boolean;
  constructor(private commonService: CommonService,
    private appService: AppService) {
    this.breadcrumbPaths = [];
    this.taskList = [];
    this.showUploadWindow = false;
    this.fileAdded = false;
  }

  ngOnInit(): void {
    this.breadcrumbPaths.push({
      url: `/app/${this.commonService.app._id}/cp/user`,
      active: false,
      label: 'Users'
    });
    this.breadcrumbPaths.push({
      active: true,
      label: 'Bulk Import'
    });
    this.fetchFileTransfers();
    this.downloadUrl = environment.url.user + `/${this.commonService.app._id}/user/utils/bulkCreate/template`;
    if (this.appService.validAuthTypes && this.appService.validAuthTypes.indexOf('azure') == -1) {
      this.showAzureLoginButton = false;
    }
    this.commonService.bulkUpload.status.subscribe(data => {
      this.fetchFileTransfers();
    });
  }

  fetchFileTransfers() {
    this.showLazyLoader = true;
    this.commonService.get('user', `/${this.commonService.app._id}/user/utils/bulkCreate/fileTransfers`).subscribe(res => {
      this.showLazyLoader = false;
      this.taskList = res;
    }, err => {
      this.showLazyLoader = false;
      console.error(err);
    });
  }

  hasPermission(type: string) {
    return this.commonService.hasPermission(type);
  }

  newUpload() {
    this.showUploadWindow = true;
    this.fileAdded = false;
    if (this.fileInput) {
      this.fileInput.value = null;
    }
    this.showLazyLoader = true;
    this.commonService.get('user', `/${this.commonService.app._id}/user/utils/azure/token`).subscribe(res => {
      this.showLazyLoader = false;
      this.showAzureLoginButton = false;
    }, err => {
      this.showLazyLoader = false;
      this.showAzureLoginButton = true;
    });
  }

  triggerAzureToken() {
    this.getNewAzureToken().then(() => {
      this.commonService.get('user', `/${this.commonService.app._id}/user/utils/azure/token`).subscribe(res => {
        this.showLazyLoader = false;
        this.showAzureLoginButton = false;
      }, err => {
        this.showLazyLoader = false;
        this.showAzureLoginButton = true;
      });
    }).catch(err => {
      this.commonService.errorToast(err, 'Error while trying to login to Azure AD');
    });
  }

  getNewAzureToken() {
    try {
      const url = `${environment.url.user}/${this.commonService.app._id}/user/utils/azure/token/new`
      const self = this;
      const windowHeight = 500;
      const windowWidth = 620;
      const windowLeft = ((window.outerWidth - windowWidth) / 2) + window.screenLeft;
      const windowTop = ((window.outerHeight - windowHeight) / 2) + window.screenTop;
      const windowOptions = [];
      windowOptions.push(`height=${windowHeight}`);
      windowOptions.push(`width=${windowWidth}`);
      windowOptions.push(`left=${windowLeft}`);
      windowOptions.push(`top=${windowTop}`);
      windowOptions.push(`toolbar=no`);
      windowOptions.push(`resizable=no`);
      windowOptions.push(`menubar=no`);
      windowOptions.push(`location=no`);
      const childWindow = document.open(url, '_blank', windowOptions.join(',')) as any;
      return self.appService.listenForChildClosed(childWindow);
    } catch (e) {
      throw e;
    }
  }

  onChange(event) {
    this.fileAdded = true;
    this.fileInput = event.target;
  }

  startProcess() {
    if (!this.fileInput || !this.fileInput.files || !this.fileInput.files[0]) {
      this.commonService.errorToast(null, 'Please select a file to Start Import Process');
      return;
    }
    const formData = new FormData();
    formData.append('file', this.fileInput.files[0]);
    this.commonService.uploadFile('user', `/${this.commonService.app._id}/user/utils/bulkCreate/upload`, formData).subscribe((res: HttpEvent<any>) => {
      if (res.type == HttpEventType.Response) {
        console.log(res);
        this.showUploadWindow = false;
        this.fileAdded = false;
        if (this.fileInput) {
          this.fileInput.value = null;
        }
        this.taskList = [];
        this.fetchFileTransfers();
      }
    }, err => {
      console.error(err);
    });
  }
}
