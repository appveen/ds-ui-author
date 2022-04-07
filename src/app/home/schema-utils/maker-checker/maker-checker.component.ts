import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DeleteModalConfig } from 'src/app/utils/interfaces/schemaBuilder';
import { CommonService } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { arrayNonEmpty } from '../../custom-validators/non-empty-array.validator';
import { duplicateStepName } from '../../custom-validators/duplicate-step-name.validator';
@Component({
  selector: 'odp-maker-checker',
  templateUrl: './maker-checker.component.html',
  styleUrls: ['./maker-checker.component.scss']
})
export class MakerCheckerComponent implements OnInit {
  @ViewChild('deleteModalTemplate') deleteModalTemplate: TemplateRef<HTMLElement>;
  deleteModalTemplateRef: NgbModalRef;

  @Input() form: FormGroup;
  @Input() edit: any;
  makerCheckerEnabled: boolean;
  deleteAllSteps: boolean;
  deleteModal: DeleteModalConfig;
  deleteSteps: Array<boolean>;

  constructor(
    private commonService: CommonService,
    private fb: FormBuilder,
    private appService: AppService) {
    const self = this;
    self.deleteModal = {
      title: 'Delete Workflow',
      message: 'Are you sure you want to delete the workflow ?',
      falseButton: 'Cancel',
      trueButton: 'Delete',
      showButtons: true
    };
    self.deleteAllSteps = false;
    self.deleteSteps = [];
  }

  ngOnInit(): void {
    const self = this;
    if (self.makerCheckerCreated) {
      self.makerCheckerEnabled = self.form.get(['workflowConfig', 'enabled']).value;
      self.deleteSteps = new Array(self.steps.length).fill(false);
      if (self.makerCheckerEnabled && self.edit.status) {
        self.toggleValidators(true);
      }
    }
  }

  get isSchemaFree() {
    const self = this;
    if (self.form && self.form.get('schemaFree')) {
        return self.form.get('schemaFree').value;
    }
    return false;
  }

  get makerCheckerData() {
    const self = this;
    if (self.makerCheckerCreated) {
      return this.allMakerCheckers.at(0);
    } else {
      return null;
    }
  }

  get allMakerCheckers() {
    const self = this;
    return (self.form.get(['workflowConfig', 'makerCheckers']) as FormArray)
  }

  get makerCheckerCreated() {
    const self = this;
    return self.allMakerCheckers.controls.length != 0;
  }

  makerCheckerGrp() {
    const self = this;
    return self.fb.group({
      steps: self.fb.array([])
    })
  }

  addNewMakerChecker() {
    const self = this;
    self.makerCheckerEnabled = true;
    self.allMakerCheckers.push(self.makerCheckerGrp());
    self.toggleMakerChecker(true);
  }

  toggleMakerChecker(val) {
    const self = this;
    self.makerCheckerEnabled = val;
    self.form.get(['workflowConfig', 'enabled']).patchValue(val);
    self.toggleValidators(val);
  }

  deleteMakerChecker() {
    const self = this;
    self.deleteModalTemplateRef = self.commonService.modal(self.deleteModalTemplate);
    self.deleteModalTemplateRef.result.then((close) => {
      if (close) {
        self.makerCheckerEnabled = false;
        self.makerCheckerData.patchValue({
          'enabled': false
        });
        self.allMakerCheckers.clear();
        self.deleteSteps = [];
        self.toggleMakerChecker(false);
      }
    }, dismiss => { })
  }

  get steps(): FormArray {
    return this.makerCheckerData.get('steps') as FormArray;
  }

  newStep(): FormGroup {
    const self = this;
    let grp = self.fb.group({
      id: 'C' + this.appService.rand(10),
      name: [null],
      approvals: [1]
    })
    if (self.makerCheckerEnabled) {
      grp.get('name').setValidators([Validators.required]);
      grp.get('name').updateValueAndValidity();
      grp.get('approvals').setValidators([Validators.required]);
      grp.get('approvals').updateValueAndValidity();
    }
    return grp;
  }

  addStep() {
    const self = this;
    self.steps.push(self.newStep());
    self.deleteSteps.push(false);
  }

  deleteStep(i: number) {
    const self = this;
    self.steps.removeAt(i);
    self.deleteSteps.splice(i, 1);
  }

  canMultiSelectDelete() {
    const self = this;
    return self.deleteSteps.filter(data => data == true).length > 0;
  }

  deleteMultipleSteps() {
    const self = this;
    const remainingSteps = self.deleteSteps.reduce(function (a, e, i) {
      if (e === false)
        a.push(self.steps.at(i));
      return a;
    }, []);
    self.steps.clear();
    remainingSteps.forEach((step) => {
      self.steps.push(step);
    })
    self.deleteSteps = new Array(self.steps.length).fill(false);
    self.deleteAllSteps = false;
  }

  toggleDeleteAllSteps(val) {
    const self = this;
    self.deleteSteps = self.deleteSteps.map(data => data = val);
  }

  checkDeleteAllSteps() {
    const self = this;
    if (self.deleteAllSteps && self.deleteSteps.filter(data => data == true).length != self.steps.length) {
      self.deleteAllSteps = false;
    }
    else if (!self.deleteAllSteps && self.deleteSteps.filter(data => data == true).length == self.steps.length) {
      self.deleteAllSteps = true;
    }
  }

  sortableOnUpdate = (event: any) => {
    const self = this;
    self.steps.updateValueAndValidity();
  }

  // ---- error validation section ----

  toggleValidators(status) {
    const self = this;
    if (self.allMakerCheckers.length == 0) {
      return;
    }
    else if (status) {
      self.makerCheckerData.get('steps').setValidators([arrayNonEmpty, duplicateStepName]);
      self.steps.controls.forEach(step => {
        step.get('name').setValidators([Validators.required]);
        step.get('name').updateValueAndValidity();
        step.get('approvals').setValidators([Validators.required]);
        step.get('approvals').updateValueAndValidity();
      });
    }
    else {
      self.makerCheckerData.get('steps').clearValidators();
      self.steps.controls.forEach(step => {
        step.get('name').clearValidators();
        step.get('name').updateValueAndValidity();
        step.get('approvals').clearValidators();
        step.get('approvals').updateValueAndValidity();
      });
    }
    self.makerCheckerData.get('steps').updateValueAndValidity();

  }

  stepNameError(step) {
    const self = this;
    if (step.get('name').invalid && (step.get('name').dirty || step.get('name').touched)) {
      return true;
    }
    else {
      return false;
    }
  }

  approvalError(step) {
    const self = this;
    if (step.get('approvals').invalid && (step.get('approvals').dirty || step.get('approvals').touched)) {
      return true;
    }
    else {
      return false;
    }
  }

}