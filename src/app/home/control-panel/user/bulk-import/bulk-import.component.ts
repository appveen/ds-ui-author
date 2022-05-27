import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/utils/interfaces/breadcrumb';
import { CommonService } from 'src/app/utils/services/common.service';

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
  constructor(private commonService: CommonService) {
    this.breadcrumbPaths = [];
    this.taskList = [];
    this.showUploadWindow = false;
    this.fileAdded = false;
  }

  ngOnInit(): void {
    this.breadcrumbPaths.push({
      active: false,
      label: 'Users'
    });
    this.breadcrumbPaths.push({
      active: true,
      label: 'Bulk Import'
    });
    this.fetchFileTransfers();
  }

  fetchFileTransfers() {
    this.commonService.get('user', `/${this.commonService.app._id}/user/utils/bulkCreate/fileTransfers`).subscribe(res => {
      this.taskList = res;
    }, err => {
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
  }

  onChange(event) {
    this.fileAdded = true;
    this.fileInput = event.target;
  }

  startProcess() {
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
