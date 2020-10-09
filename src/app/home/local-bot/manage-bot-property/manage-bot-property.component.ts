import { Component, OnInit, Input, ViewChild, TemplateRef, EventEmitter, Output } from '@angular/core';
import { FormGroup, Validators, FormArray, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/utils/services/app.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-manage-bot-property',
  templateUrl: './manage-bot-property.component.html',
  styleUrls: ['./manage-bot-property.component.scss']
})
export class ManageBotPropertyComponent implements OnInit {
  @ViewChild('newAttributeModal', { static: false }) newAttributeModal: TemplateRef<HTMLElement>;
  @ViewChild('editAttributeModal', { static: false }) editAttributeModal: TemplateRef<HTMLElement>;
  private _selecteBot;
  openDeleteModal: EventEmitter<any>;
  @Output() dataChange: EventEmitter<any>;
  showLazyLoader: boolean;
  get selectedBot() {
    const self = this;
    return self._selecteBot;
  }
  @Input() set selectedBot(value) {
    const self = this;
    self._selecteBot = value;
    const arr = [];
    if (self.selectedBot && self.selectedBot.attributes) {
      Object.keys(self.selectedBot.attributes).forEach(key => {
        if (self.selectedBot.attributes[key]) {
          arr.push({
            key,
            label: self.selectedBot.attributes[key].label,
            value: self.selectedBot.attributes[key].value,
            type: self.selectedBot.attributes[key].type
          });
        }
      });
    }
    self.userAttributeList = arr;
  }
  additionalDetails: FormGroup;
  toggleFieldTypeSelector: any;
  newAttributeModalRef: NgbModalRef;
  editAttributeModalRef: NgbModalRef;
  editAttribute: any;
  userAttributeList: Array<any>;
  types: Array<any>;

  constructor(
    private ts: ToastrService,
    private fb: FormBuilder,
    private appService: AppService,
    public commonService: CommonService
  ) {
    const self = this;
    self.types = [
      { class: 'odp-abc', value: 'String', label: 'Text' },
      { class: 'odp-123', value: 'Number', label: 'Number' },
      { class: 'odp-boolean', value: 'Boolean', label: 'True/False' },
      { class: 'odp-calendar', value: 'Date', label: 'Date' }
    ];
    self.toggleFieldTypeSelector = {};
    self.openDeleteModal = new EventEmitter();
    self.dataChange = new EventEmitter();
    self.additionalDetails = self.fb.group({
      extraInfo: self.fb.array([
        self.fb.group({
          key: ['', Validators.required],
          type: ['String', Validators.required],
          value: ['', Validators.required],
          label: ['', Validators.required]
        })
      ])
    });
    self.editAttribute = {};
  }

  ngOnInit() {
  }
  get userAttributes() {
    const self = this;
    return (self.additionalDetails.get('extraInfo') as FormArray).controls;
  }
  

  // To add new additional information for user
  addNewDetail() {
    const self = this;
    const newData = self.fb.group({
      key: ['', [Validators.required]],
      type: ['String', [Validators.required]],
      value: ['', [Validators.required]],
      label: ['', [Validators.required]]
    });
    (self.additionalDetails.get('extraInfo') as FormArray).push(newData);
  
  }

  getLabelError(i) {
    const self = this;
    return self.additionalDetails.get(['extraInfo', i, 'label']).touched
      && self.additionalDetails.get(['extraInfo', i, 'label']).dirty
      && self.additionalDetails.get(['extraInfo', i, 'label']).hasError('required');
  }

  getValError(i) {
    const self = this;
    return self.additionalDetails.get(['extraInfo', i, 'value']).touched &&
      self.additionalDetails.get(['extraInfo', i, 'value']).dirty &&
      self.additionalDetails.get(['extraInfo', i, 'value']).hasError('required');
  }

  setKey(i) {
    const self = this;
    const val = self.additionalDetails.get(['extraInfo', i, 'label']).value;
    self.additionalDetails.get(['extraInfo', i, 'key']).patchValue(self.appService.toCamelCase(val));
  }

  newField(event) {
    const self = this;
    if (event.key === 'Enter') {
      self.addNewDetail();
    }
  }
  setUserAttributeType(type: any, index: number) {
    const self = this;
    self.toggleFieldTypeSelector[index] = false;
    self.additionalDetails.get(['extraInfo', index, 'type']).patchValue(type.value);
    if (type.value === 'Boolean') {
      self.additionalDetails.get(['extraInfo', index, 'value']).patchValue(false);
    } else {
      self.additionalDetails.get(['extraInfo', index, 'value']).patchValue(null);
    }
  }


  addExtraDetails() {
    const self = this;
    let empty = false;
    self.userAttributes.forEach((control) => {
      const label = control.get('label').value;
      const val = control.get('value').value;
      empty = label === '' || val === '';
    });
    if (empty) {
      self.ts.warning('Please check the form fields, looks like few fields are empty');
    } else {
      self.newAttributeModalRef.close();
      self.userAttributes.forEach((data) => {
        const payload = data.value;
        const detailKey = payload.key;
        delete payload.key;
        if (!self.selectedBot.attributes) {
          self.selectedBot.attributes = {};
        }
        self.selectedBot.attributes[detailKey] = payload;
      });
      self.showLazyLoader = true;

      self.commonService.put('user', `/usr/${self.selectedBot._id}`, self.selectedBot)
        .subscribe(() => {
          self.showLazyLoader = false;

          self.ts.success('Added custom Details successfully');
          self.resetAdditionDetailForm();
        }, (err) => {
          self.showLazyLoader = false;

          self.ts.error(err.error.message);
          self.resetAdditionDetailForm();
        });
    }
  }

  closeDeleteModal(data) {
    const self = this;
    if (data) {
      if (typeof data.attrName !== 'undefined') {
        self.showLazyLoader = true;

        delete self.selectedBot.attributes[data.attrName];
        self.commonService.put('user', '/usr/' + self.selectedBot._id, self.selectedBot)
          .subscribe((res) => {
            self.showLazyLoader = false;

            self.dataChange.emit(res);

            self.ts.success('Attribute deleted successfully');
            self.resetAdditionDetailForm();

          }, (err) => {
            self.showLazyLoader = false;

            self.ts.error(err.error.message);
            self.resetAdditionDetailForm();
          });
      }
    }
  }
  removeField(index) {
    const self = this;
    (self.additionalDetails.get('extraInfo') as FormArray).removeAt(index);
   
  }
  private resetAdditionDetailForm() {
    const self = this;
    self.additionalDetails.reset();
    self.additionalDetails = self.fb.group({
      extraInfo: self.fb.array([
        self.fb.group({
          key: ['', Validators.required],
          type: ['String', Validators.required],
          value: ['', Validators.required],
          label: ['', Validators.required]
        })
      ])
    });
  }
  openEditAttributeModal(item) {
    const self = this;
    self.editAttribute = self.appService.cloneObject(item);
    delete self.selectedBot.attributes[item.key];
    self.editAttributeModalRef = self.commonService.modal(self.editAttributeModal);
    self.editAttributeModalRef.result.then(close => {
      if (close) {
        const key = self.editAttribute.key;
        delete self.editAttribute.key;
        self.showLazyLoader = true;

        self.selectedBot.attributes[key] = self.appService.cloneObject(self.editAttribute);
        self.commonService.put('user', `/usr/${self.selectedBot._id}`, self.selectedBot)
          .subscribe((res) => {
            self.showLazyLoader = false;

            self.dataChange.emit(res);
            self.ts.success('Custom Details Saved Successfully');
            self.resetAdditionDetailForm();
          }, (err) => {
            self.showLazyLoader = false;

            self.ts.error(err.error.message);
            self.resetAdditionDetailForm();
          });
      } else {
        const key = item.key;
        delete item.key;
        self.selectedBot.attributes[key] = item;
      }
      self.editAttribute = {};
    }, dismiss => {
      self.editAttribute = {};
    });
  }

  deleteAdditionInfo(attrName) {
    const self = this;
    const alertModal: any = {};
    alertModal.title = 'Delete Attribute';
    alertModal.message = 'Are you sure you want to delete <span class="text-delete font-weight-bold">'
      + attrName + '</span> Attribute?';
    alertModal.attrName = attrName;
    self.openDeleteModal.emit(alertModal);
  }
  hasPermission(type: string): boolean {
    const self = this;
    return self.commonService.hasPermission(type);
  }
}
