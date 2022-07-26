import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonService } from '../services/common.service';

@Component({
  selector: 'odp-service-import-wizard',
  templateUrl: './service-import-wizard.component.html',
  styleUrls: ['./service-import-wizard.component.scss']
})
export class ServiceImportWizardComponent implements OnInit {

  @Output() close: EventEmitter<boolean>;
  file: any;
  message: string;
  step: number;
  progress: any;
  selectedData: any;
  selectedSheets: Array<any>;

  fileUploads: Array<any>;
  constructor(private commonService: CommonService) {
    this.close = new EventEmitter();
    this.step = 1;
    this.selectedSheets = [];
    this.fileUploads = [];
  }

  ngOnInit(): void {
    this.fetchAllFileUploads();
  }

  fetchAllFileUploads() {
    this.commonService.get('serviceManager', `/${this.commonService.app._id}/service/utils/import/list`, { count: -1 }).subscribe((res: any) => {
      this.fileUploads = res;
    }, err => {
      this.message = err.error.message;
    });
  }

  onFileChange(event) {
    if (event.target.files && event.target.files[0]) {
      this.file = event.target.files[0];
    }
    event.target.value = null;
  }

  uploadFile() {
    if (this.file) {
      const formData = new FormData();
      formData.append('file', this.file);
      this.commonService.uploadFile('serviceManager', `/${this.commonService.app._id}/service/utils/import/upload`, formData).subscribe((event: HttpEvent<any>) => {
        if (event.type === HttpEventType.Response) {
          this.progress = null;
          if (event.status >= 200 && event.status < 300) {
            this.file = null;
            this.fetchAllFileUploads();
          } else {
            this.message = event.body.message;
          }
        } else if (event.type === HttpEventType.UploadProgress) {
          this.progress = event;
        }
      }, err => {
        this.message = err.error.message;
      });
    }
  }

  selectImport(importData: any) {
    this.step = 2;
    this.selectedData = importData;
  }

  selectItem(flag: boolean, name: string) {
    let index = this.selectedSheets.indexOf(name);
    if (flag) {
      this.selectedSheets.push(name);
    } else {
      this.selectedSheets.splice(index, 1);
    }
  }

  isItemSelected(name: string) {
    return this.selectedSheets.indexOf(name) > -1;
  }


  startImport() {
    if (this.selectedSheets && this.selectedSheets.length > 0) {
      this.commonService.put('serviceManager', `/${this.commonService.app._id}/service/utils/import/${this.selectedData._id}/start`, {
        selectedSheets: this.selectedSheets
      }).subscribe((res: any) => {

      }, err => {
        this.message = err.error.message;
      })
    }
  }

  back() {
    this.step = 1;

  }

  clear(importId: string) {
    this.commonService.delete('serviceManager', `/${this.commonService.app._id}/service/utils/import/${importId}/clean`).subscribe((res: any) => {
      this.selectedData = null;
      this.fetchAllFileUploads();
    }, err => {
      this.message = err.error.message;
    })
  }

  closeWindow() {
    this.close.emit(false);
  }

}
