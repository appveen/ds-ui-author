import { Component, EventEmitter, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { switchMap } from 'rxjs/operators';
import { AppService } from 'src/app/utils/services/app.service';
import { CommonService } from 'src/app/utils/services/common.service';
import { ApiKeysService } from '../api-keys.service';

@Component({
  selector: 'odp-api-keys-list',
  templateUrl: './api-keys-list.component.html',
  styleUrls: ['./api-keys-list.component.scss']
})
export class ApiKeysListComponent implements OnInit {

  showNewKeyWindow: boolean;
  showLazyLoader: boolean;
  keyForm: UntypedFormGroup;
  keyList: Array<any>;
  selectedKey: any;
  searchTerm: string;
  openDeleteModal: EventEmitter<any>;
  subscriptions: any;
  showKeyDetails: boolean;
  copied: boolean;
  constructor(private fb: UntypedFormBuilder,
    private commonService: CommonService,
    private appService: AppService,
    private apiKeyService: ApiKeysService,
    private ts: ToastrService) {
    this.keyForm = this.fb.group({
      name: [null, [Validators.required]],
      expiryAfter: [365, [Validators.required]],
      apiKey: []
    });
    this.keyList = [];
    this.openDeleteModal = new EventEmitter();
    this.subscriptions = {};
  }

  ngOnInit(): void {
    this.commonService.changeBreadcrumb([{
      active: true,
      label: 'API-Keys'
    }])
    this.getAPIKeys();
  }

  hasPermission(type: string) {
    return this.commonService.hasPermission(type);
  }

  getAPIKeys() {
    this.subscriptions['getAPIKeys'] = this.commonService
      .get('user', `/${this.commonService.app._id}/apiKeys/utils/count`)
      .pipe(switchMap((ev: any) => {
        return this.commonService.get('user', `/${this.commonService.app._id}/apiKeys`, {
          count: ev,
          sort: '-_metadata.lastUpdated'
        })
      })).subscribe((res) => {
        this.showLazyLoader = false;
        this.keyList = res;
        if (this.keyList && this.keyList.length > 0) {
          this.selectedKey = this.keyList[0];
        }
      }, err => {
        this.showLazyLoader = false;
        this.commonService.errorToast(err);
      });
  }


  showDetails(keyData: any) {
    this.selectedKey = keyData;
  }

  newKeyForm() {
    this.keyForm.reset({ expiryAfter: 365 });
    this.showNewKeyWindow = true;
  }

  closeWindow() {
    this.showNewKeyWindow = false;
    this.showKeyDetails = false;
    this.getAPIKeys();
  }

  closeDeleteModal(data: any) {

  }

  createKey() {
    this.showLazyLoader = true;
    this.commonService.post('user', `/${this.commonService.app._id}/apiKeys`, this.keyForm.value).subscribe(res => {
      this.showLazyLoader = false;
      this.ts.success('API Key Created');
      this.showKeyDetails = true;
      this.keyForm.get('apiKey').patchValue(res.apiKey);
      this.keyForm.disable();
      // this.keyForm.get('apiKey').disable();
      // this.closeWindow();
    }, err => {
      this.showLazyLoader = false;
      this.commonService.errorToast(err);
    })
  }
  copyToClipboard() {
    this.copied = true;
    this.appService.copyToClipboard(this.keyForm.get('apiKey').value);
    setTimeout(() => {
      this.copied = false;
    }, 2000);
  }
}
