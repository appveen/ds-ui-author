import { Component, OnInit, Input, ViewChild, TemplateRef, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'odp-manage-bot-key',
  templateUrl: './manage-bot-key.component.html',
  styleUrls: ['./manage-bot-key.component.scss']
})
export class ManageBotKeyComponent implements OnInit {

  @Input() selectedBot: any;
  @ViewChild('newKeyModal', { static: false }) newKeyModal: TemplateRef<HTMLElement>;
  @Output() dataChange: EventEmitter<any>;
  openDeleteBotKeyModal: EventEmitter<any>;
  editKeyModalRef: NgbModalRef
  showLazyLoader:boolean;
  keyForm: FormGroup

  constructor(
    private fb: FormBuilder,
    public commonService: CommonService,
    private appService: AppService,
    private ts: ToastrService
  ) {
    const self = this;
    self.dataChange = new EventEmitter();
    self.keyForm = self.fb.group({
      label: [null, [Validators.required, Validators.maxLength(30), Validators.pattern('[a-zA-Z0-9\\s-_]+')]],
      expires: [null, [Validators.required, Validators.min(1)]]
    });
    self.openDeleteBotKeyModal =new EventEmitter();
  }

  ngOnInit() {
  }
  editBotKey(index) {
    const self = this;
    self.keyForm.get('label').patchValue(self.selectedBot.botKeys[index].label)
    self.keyForm.get('expires').patchValue(self.selectedBot.botKeys[index].expires / 1440)
    self.editKeyModalRef = self.commonService.modal(self.newKeyModal, { size: 'sm' });
    self.editKeyModalRef.result.then(close => {
      if (close) {
        const payload = self.keyForm.value;
        payload.expires = payload.expires * 1440;
        payload.keyId = self.selectedBot.botKeys[index]._id;
        self.showLazyLoader = true;

        self.commonService.put('user', `/bot/botKey/${self.selectedBot._id}`, payload)
          .subscribe((res) => {
            self.showLazyLoader = false;

            self.selectedBot.botKeys[index].hovered = false;
            self.selectedBot = res;
            self.dataChange.emit(res);
          }, err => {
            self.commonService.errorToast(err, 'Oops, something went wrong. Please try again later.');
          });
      } else {
        self.showLazyLoader = false;
        self.selectedBot.botKeys[index].hovered = false;
        self.keyForm.reset();
      }
    }, dismiss => {
      self.selectedBot.botKeys[index].hovered = false;
      self.keyForm.reset();
    });
  }
  getDate(key) {
    if (key.createdAt) {
      const time = new Date(key.createdAt).getTime();
      return new Date(time + key.expires * 60000);
    }
    else {
      return '-';
    }
  }

  copyKey(key) {
    const self = this;
    self.appService.copyToClipboard(key.keyValue);
    self.ts.success('Key copied successfully');
  }
  endSession(index) {
    const self = this;
    const payload = { keyId: self.selectedBot.botKeys[index]._id }
    self.showLazyLoader = true;

    self.commonService.delete('user', `/bot/botKey/session/${self.selectedBot._id}`, payload)
      .subscribe((res) => {
        self.showLazyLoader = false;
        self.ts.success("Session ended");
      }, err => {
        self.showLazyLoader = false;
        self.commonService.errorToast(err, 'Oops, something went wrong. Please try again later.');
      });

  }
  deactivateKey(index) {
    const self = this;
    const payload = self.selectedBot.botKeys[index]
    payload.isActive = !self.selectedBot.botKeys[index].isActive ;
    payload.keyId = self.selectedBot.botKeys[index]._id;
    self.showLazyLoader = true;

    self.commonService.put('user', `/bot/botKey/${self.selectedBot._id}`, payload)
      .subscribe((res) => {
        self.showLazyLoader = false;
        self.selectedBot.botKeys[index].hovered = false;
        self.selectedBot = res;
        self.dataChange.emit(res);
      }, err => {
        self.showLazyLoader = false;
        self.commonService.errorToast(err, 'Oops, something went wrong. Please try again later.');
      });
  }


  deleteBotKey(index) {
    const self = this;
    const alertModal: any = {};
    alertModal.statusChange = false;
    alertModal.title = 'Delete Bot Key';
    alertModal.message = 'Are you sure you want to delete the bot key';
    alertModal._id = self.selectedBot.botKeys[index]._id
    self.openDeleteBotKeyModal.emit(alertModal);
  }


  closeDeleteBotKeyModal(data) {
    if(data){
    const self = this;
    const payload = { keyId: data._id }
    self.showLazyLoader = true;

    self.commonService.delete('user', `/bot/botKey/${self.selectedBot._id}`, payload)
      .subscribe((res) => {
        self.showLazyLoader = false;
        self.selectedBot = res;
        self.dataChange.emit(res);
      }, err => {
        self.showLazyLoader = false;
        self.commonService.errorToast(err, 'Oops, something went wrong. Please try again later.');
      });
    }
  }
  hasPermission(type: string): boolean {
    const self = this;
    return self.commonService.hasPermission(type);
  }
}
