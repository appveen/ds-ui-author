import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  keyForm: FormGroup;
  keyList: Array<any>;
  selectedKey: any;
  openDeleteModal: EventEmitter<any>;
  constructor(private fb: FormBuilder,
    private commonService: CommonService,
    private appService: AppService,
    private apiKeyService: ApiKeysService) {
    this.keyForm = this.fb.group({
      name: [null, [Validators.required]],
      expiry: [365, [Validators.required]]
    });
    this.keyList = [];
    this.openDeleteModal = new EventEmitter();
  }

  ngOnInit(): void {

  }

  hasPermission(type: string) {
    return this.commonService.hasPermission(type);
  }


  showDetails(keyData: any) {
    this.selectedKey = keyData;
  }

  newKeyForm() {
    this.keyForm.reset();
    this.showNewKeyWindow = true;
  }

  closeWindow() {
    this.showNewKeyWindow = false;
  }

  closeDeleteModal(data: any) {
    
  }

  createKey() {

  }
}
