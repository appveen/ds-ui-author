import { Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../services/common.service';

@Component({
  selector: 'odp-create-modal',
  templateUrl: './create-modal.component.html',
  styleUrls: ['./create-modal.component.scss']
})
export class CreateModalComponent implements OnInit, OnDestroy {

  @Input() charLimit: number;
  @Input() toggle: boolean;
  @Output() toggleChange: EventEmitter<boolean>;
  @Input() data: any;
  @Output() dataChange: EventEmitter<any>;
  @ViewChild('createModalTemplate', { static: false }) createModalTemplate: TemplateRef<HTMLElement>;
  createModalTemplateRef: NgbModalRef;
  form: UntypedFormGroup;
  constructor(private fb: UntypedFormBuilder,
    private commonService: CommonService) {
    const self = this;
    self.charLimit = 40;
    self.toggleChange = new EventEmitter();
    self.dataChange = new EventEmitter();
    self.form = self.fb.group({
      name: [null],
      description: [null]
    });
  }

  ngOnInit() {
    const self = this;
    self.form.get('name').setValidators([Validators.required, Validators.maxLength(self.charLimit)]);
    self.form.get('name').markAsUntouched();
    if (self.data) {
      self.form.patchValue(self.data);
      self.form.get('name').markAsTouched();
    }
    if (self.createModalTemplateRef) {
      self.createModalTemplateRef.close();
    }
    self.createModalTemplateRef = self.commonService
      .modal(self.createModalTemplate, { centered: true, windowClass: '.new-partner-modal' });
    self.createModalTemplateRef.result.then(close => {
      self.toggleChange.emit(false);
    }, dismiss => {
      self.toggleChange.emit(false);
    });
  }

  save() {
    const self = this;
    const data = self.form.value;
    self.dataChange.emit(data);
  }

  ngOnDestroy() {
    const self = this;
    if (self.createModalTemplateRef) {
      self.createModalTemplateRef.close(false);
    }
  }

  get invalidName() {
    const self = this;
    if (self.form.get('name').touched &&
      (self.form.get('name').hasError('required') || self.form.get('name').hasError('maxlength'))) {
      return true;
    } else {
      return false;
    }
  }

}
