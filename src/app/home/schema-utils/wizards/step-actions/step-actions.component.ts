import { Component, EventEmitter, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import * as uuid from 'uuid/v1';

import { CommonService } from 'src/app/utils/services/common.service';
import { SchemaBuilderService } from '../../schema-builder.service';

@Component({
  selector: 'odp-step-actions',
  templateUrl: './step-actions.component.html',
  styleUrls: ['./step-actions.component.scss']
})
export class StepActionsComponent implements OnInit {

  @Input() form: FormGroup;
  @Input() edit: any;

  openDeleteModal: EventEmitter<any>;
  showNewActionWindow: boolean;
  actionHookForm: FormGroup;
  triggeredHookValidation: boolean;
  verifyUrl: {
    status: boolean;
    loading: boolean;
  };

  actionTypes: Array<any> = [];

  constructor(private schemaService: SchemaBuilderService,
    private commonService: CommonService,
    private ts: ToastrService,
    private fb: FormBuilder) {
    this.actionHookForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(40)]],
      url: [null, [Validators.required, Validators.pattern(/^http(s)?:(.*)\/?(.*)/)]],
      errorMessage: [null],
      label: [null],
      type: ['success'],
      hookId: [null]
    });
    this.verifyUrl = {
      status: false,
      loading: false
    };
    this.triggeredHookValidation = false;
    this.actionTypes = [
      { name: 'Type 1', value: 'success' },
      { name: 'Type 2', value: 'warning' },
      { name: 'Type 3', value: 'danger' }];
    this.openDeleteModal = new EventEmitter();
  }

  ngOnInit(): void {
  }

  activeUrl(url) {
    this.verifyUrl.loading = true;
    this.commonService.get('serviceManager', `/${this.commonService.app._id}/service/utils/verifyHook?url=` + url, { filter: { app: this.commonService.app._id } }).subscribe(res => {
      this.verifyUrl.loading = false;
      this.verifyUrl.status = true;
      this.triggeredHookValidation = false;
    }, error => {
      this.verifyUrl.status = false;
      this.verifyUrl.loading = false;
      this.triggeredHookValidation = true;
    });
  }

  openNewActionWindow(hook?: any) {
    this.showNewActionWindow = true;
    const step = (this.form.get(['wizard', 'steps', this.selectedStepIndex]) as FormGroup);
    if (step && !step.value.name) {
      this.ts.warning('Action hook cannot be added to an empty step');
      return;
    }
    this.verifyUrl.status = false;
    this.verifyUrl.loading = false;
    this.triggeredHookValidation = false;
    this.resetHookForm(hook);
  }

  triggerHookSave() {
    if (this.actionHookForm.valid) {
      const hId = this.actionHookForm.get('hookId').value;
      const actionInStep = this.form.get(['wizard', 'steps', this.selectedStepIndex, 'actions']).value;
      if (actionInStep.findIndex(e => e.hookId === hId) !== -1) {
        (this.form.get(['wizard', 'steps', this.selectedStepIndex, 'actions']) as FormArray)
          .removeAt(actionInStep.findIndex(e => e.hookId === hId));
      }
      (this.form.get(['wizard', 'steps', this.selectedStepIndex, 'actions']) as FormArray).push(this.actionHookForm);
      this.form.markAsDirty();
    }
    this.resetHookForm();
    this.showNewActionWindow = false;
  }

  openDeleteActionWindow(hook?: any) {
    this.openDeleteModal.emit({
      title: 'Delete Action Hook?',
      message: 'Are You Sure? You want to delete action hook: <b>' + hook.name + '</b>?',
      hook
    });
  }

  resetHookForm(hook?: any) {
    this.actionHookForm = this.fb.group({
      name: [null, Validators.required],
      url: [null, [Validators.required, Validators.pattern(/^http(s)?:(.*)\/?(.*)/)]],
      errorMessage: [null],
      label: [null],
      type: ['success'],
      hookId: [uuid()]
    });
    if (hook) {
      this.actionHookForm.patchValue(hook);
    }
  }

  isHookAdded(hook) {
    const hId = hook.hookId;
    const selectedStep = this.form.get('wizard.selectedStep').value;
    const actionInStep = (this.form.get(['wizard', 'steps', selectedStep, 'actions'])).value;
    return actionInStep.findIndex(e => e.hookId === hId) !== -1;
  }

  addHookToStep(hook) {
    const hId = hook.hookId;
    const selectedStep = this.form.get('wizard.selectedStep').value;
    const actionInStep = (this.form.get(['wizard', 'steps', selectedStep, 'actions'])).value;
    if (actionInStep.findIndex(e => e.hookId === hId) !== -1) {
      this.ts.warning(hook.name + ' is already added in current step');
      return;
    } else {
      this.resetHookForm(hook);
      (this.form.get(['wizard', 'steps', selectedStep, 'actions']) as FormArray).push(this.actionHookForm);
      this.form.get('wizard').markAsDirty();
      this.form.markAsDirty();
      // this.ts.success(hook.name + ' is added successfully');
    }

  }

  removeHookFromStep(hook) {
    const hId = hook.hookId;
    const selectedStep = this.form.get('wizard.selectedStep').value;
    const actionInStep = (this.form.get(['wizard', 'steps', selectedStep, 'actions'])).value;
    const index = actionInStep.findIndex(e => e.hookId === hId);
    if (index > -1) {
      (this.form.get(['wizard', 'steps', selectedStep, 'actions']) as FormArray).removeAt(index);
    }
  }

  uniqHookName() {
    if (this.edit.status) {
      const hookId = this.actionHookForm.get('hookId').value;
      const hookName = this.actionHookForm.get('name').value;
      const hookIndex = this.allActions.findIndex(e => e.name === hookName);
      if (hookIndex >= 0 && hookId != this.allActions[hookIndex].hookId) {
        this.actionHookForm.get('name').setErrors({ duplicateName: true });
      }
    }
  }

  closeDeleteModal(data) {
    if (data) {
      const steps = this.form.get(['wizard', 'steps']) as FormArray;
      steps.controls.forEach(step => {
        const actionInStep = step.get(['actions']).value;
        const actionIndex = actionInStep.findIndex(e => e.hookId === data.hook.hookId);
        if (actionIndex > -1) {
          (step.get(['actions']) as FormArray).removeAt(actionIndex);
        }
      });
    }
  }

  get selectedStepIndex() {
    return this.form ? this.form.get('wizard.selectedStep').value : 0;
  }

  set selectedStepIndex(val) {
    this.form ? this.form.get('wizard.selectedStep').patchValue(val) : null
  }

  get definitions() {
    return (this.form.get('definition') as FormArray).controls;
  }

  get steps() {
    return (this.form.get('wizard.steps') as FormArray).controls;
  }

  get hookNameErr() {
    return (this.actionHookForm.get('name').touched || this.actionHookForm.get('name').dirty)
      && ((this.actionHookForm.get('name').hasError('duplicateName')) ||
        this.actionHookForm.get('name').hasError('required'));
  }

  get hookUrlErr() {
    return (this.actionHookForm.get('url').touched || this.actionHookForm.get('url').dirty) &&
      (this.actionHookForm.get('url').hasError('pattern') || this.actionHookForm.get('url').hasError('required'));
  }

  get allActions() {
    const self = this;
    let temp = self.form.get('wizard.steps').value.map(e => e.actions);
    temp = Array.prototype.concat.apply([], temp);
    return temp.filter((e, i, a) => {
      if (a.findIndex(t => {
        if (t && t.name) {
          return t.name === e.name;
        }
      }) === i) {
        return true;
      }
    }).map(e => {
      if (!e.hookId) {
        e.hookId = uuid();
      }
      return e;
    });
  }

  get selectedStepActions() {
    const temp = (this.form.get(['wizard', 'steps', this.selectedStepIndex, 'actions']) as FormArray).value;
    return temp ? temp : [];
  }
}
