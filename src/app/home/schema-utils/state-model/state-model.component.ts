import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  TemplateRef,
} from '@angular/core';
import { AppService } from 'src/app/utils/services/app.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormControl } from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { SchemaBuilderService } from '../schema-builder.service';
import { DeleteModalConfig } from 'src/app/utils/interfaces/schemaBuilder';
import { NgbModalRef, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/utils/services/common.service';
import { ToastrService } from 'ngx-toastr';
import { merge, Observable, OperatorFunction, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
} from 'rxjs/operators';

@Component({
  selector: 'odp-state-model',
  templateUrl: './state-model.component.html',
  styleUrls: ['./state-model.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StateModelComponent implements OnInit {
  @ViewChild('deleteModalTemplate')
  deleteModalTemplate: TemplateRef<HTMLElement>;
  deleteModalTemplateRef: NgbModalRef;

  sourceDefinition: any;
  searchTerm: string;
  @Input() form: FormGroup;
  @Input() edit: any;
  newState: any;

  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  stateCtrl = new FormControl();
  stateModelData: any;
  deleteModal: DeleteModalConfig;
  newListAttrType: any;

  @ViewChild('instance', { static: true }) instance: NgbTypeahead;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();

  constructor(
    private appService: AppService,
    private schemaService: SchemaBuilderService,
    private commonService: CommonService,
    private ts: ToastrService,
    private fb: FormBuilder
  ) {
    const self = this;
    self.deleteModal = {
      title: 'Delete State Model',
      message: 'Are you sure you want to delete the state model?',
      falseButton: 'No',
      trueButton: 'Yes',
      showButtons: true,
    };
    self.newListAttrType = null;
    self.stateModelData = [];
  }

  ngOnInit(): void {
    const self = this;
    let definitions = (self.form.get('definition') as FormArray).controls;
    self.sourceDefinition = self.appService.patchDataKey(
      self.fb.array(definitions).value
    );
    if (self.stateModelEnabled) {
      self.stateModelData = self.allStates.map((state) => {
        return { state: state, checked: false };
      });
    }

    this.form.get('stateModel').valueChanges.subscribe((selectedValue) => {
      this.form.get('stateModel').markAsDirty();
    });
  }

  search: OperatorFunction<string, readonly string[]> = (
    text$: Observable<string>
  ) => {
    const debouncedText$ = text$.pipe(
      debounceTime(200),
      distinctUntilChanged()
    );
    const clicksWithClosedPopup$ = this.click$.pipe(
      filter(() => !this.instance.isPopupOpen())
    );
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map((term) => {
        const states = this.sourceDefinition.filter(
          (data) => data.properties._detailedType == 'enum'
        );
        if (term === '') {
          return states;
        } else {
          const filteredStates = states.filter(
            (v) =>
              v.properties.name.toLowerCase().indexOf(term.toLowerCase()) > -1
          );
          if (filteredStates.length != 0) {
            return filteredStates;
          } else {
            return [
              { name: term, type: 'String', newAttr: true },
              { name: term, type: 'Number', newAttr: true },
            ];
          }
        }
        return term === ''
          ? states
          : states.filter(
              (v) =>
                v.properties.name.toLowerCase().indexOf(term.toLowerCase()) > -1
            );
      })
    );
  };

  inputFormatter = (x: any) => {
    if (!x) {
      return;
    } else if (typeof x == 'string') {
      return x;
    } else if (x.newAttr) {
      return x.name;
    } else {
      return x.properties.name;
    }
  };

  selectAttribute($event) {
    const self = this;
    if ($event.newAttr) {
      this.newListAttrType = $event.type;
      self.form.get(['stateModel', 'attribute']).patchValue($event.name);
    } else {
      const attr = $event.properties.name.trim();
      self.form.get(['stateModel', 'attribute']).patchValue(attr);
    }
  }

  // all possible List of Values attributes
  get ListOfValuesAttributes() {
    const self = this;
    return self.sourceDefinition.filter(
      (data) => data.properties._detailedType == 'enum'
    );
  }

  // get attribute configured as State Model
  get stateModelAttribute() {
    const self = this;
    return self.appService.toCamelCase(
      self.form.get(['stateModel', 'attribute']).value
    );
  }

  // get attribute type of state model Number/String
  get stateModelAttributeType() {
    const self = this;
    let definition = (self.form.get('definition') as FormArray).value;
    if (self.stateModelAttrIndex > -1) {
      return definition[self.stateModelAttrIndex].type;
    }
  }

  get stateModelAttrIndex() {
    const self = this;
    let definition = (self.form.get('definition') as FormArray).value;
    return definition.findIndex(
      (data) => data.key === self.stateModelAttribute
    );
  }

  // check whether state model is configured
  get stateModelEnabled() {
    const self = this;
    return self.form.get(['stateModel', 'enabled']).value;
  }

  get StateModelAttrName() {
    const self = this;
    let definition = (self.form.get('definition') as FormArray).value;
    if (self.stateModelAttrIndex > -1) {
      return definition[self.stateModelAttrIndex].properties.name;
    }
    return '';
  }

  // create a new List of Values attribute with String/Number Type and convert to State Model
  addNewListOfValues() {
    const self = this;
    const attrName = self.form.get(['stateModel', 'attribute']).value;
    const tempArr = self.form.controls.definition as FormArray;
    const temp = self.schemaService.getDefinitionStructure({ _newField: true });
    const attrCamelCase = self.appService.toCamelCase(attrName);
    self.form.get(['stateModel', 'attribute']).patchValue(attrCamelCase);
    temp.get(['properties', 'name']).patchValue(attrName);
    temp.get(['properties', 'dataPath']).patchValue(attrCamelCase);
    temp.get('type').patchValue(self.newListAttrType);
    temp.get(['properties', '_detailedType']).patchValue('enum');
    const oldFieldindex = this.sourceDefinition.findIndex(
      (e) => e.key == attrCamelCase
    );
    if (oldFieldindex > -1) {
      tempArr.removeAt(oldFieldindex);
    }
    tempArr.push(temp);
  }

  // configure the state model
  enableStateModel() {
    const self = this;
    if (!self.stateModelAttribute) {
      return;
    }
    // if new attribute
    else if (
      self.newListAttrType == 'String' ||
      self.newListAttrType == 'Number'
    ) {
      self.addNewListOfValues();
      self.form.get(['stateModel', 'enabled']).patchValue(true);
      self.newListAttrType = null;
      self.ts.success(
        `Success! State Model ${self.stateModelAttribute} has been successfully created . Now you can find it in the attribute list.`
      );
    } else {
      if (self.stateModelAttrIndex > -1) {
        self.form
          .get(['stateModel', 'attribute'])
          .patchValue(this.stateModelAttribute);

        const stateModelProperties = self.form.get([
          'definition',
          self.stateModelAttrIndex,
          'properties',
        ]);
        stateModelProperties.get('default').patchValue(null);

        const readonly = stateModelProperties.get('readonly');
        if (readonly.value) {
          readonly.patchValue(false);
        }

        const unique = stateModelProperties.get('unique');
        if (unique.value) {
          unique.patchValue(false);
        }

        const required = stateModelProperties.get('required');
        if (required.value) {
          required.patchValue(false);
        }

        const createOnly = stateModelProperties.get('createOnly');
        if (createOnly.value) {
          createOnly.patchValue(false);
        }

        self.form.get(['stateModel', 'enabled']).patchValue(true);
        if (self.allStates.length > 0) {
          const stateModelDict = self.allStates.reduce(
            (a, x) => ({ ...a, [x]: [] }),
            {}
          );
          self.form.get(['stateModel', 'states']).patchValue(stateModelDict);
          self.form
            .get(['stateModel', 'initialStates'])
            .patchValue([self.allStates[0]]);
        }

        // first state as initial state
        self.stateModelData = self.allStates.map((state) => {
          return { state: state, checked: false };
        });

        // state model reset to initial state if existing records
        self.commonService
          .get('serviceManager', '/all/count', {
            serviceIds: self.commonService.activeComponent['edit'].id,
            filter: { app: this.commonService.app._id },
          })
          .subscribe(
            (data) => {
              if (data[0].count > 0) {
                self.ts.warning(
                  `All the existing records with null or invalid values for ${self.stateModelAttribute} will be updated to the initial state.  State Model ${self.stateModelAttribute} has been successfully created`
                );
              } else {
                self.ts.success(
                  `Success! State Model ${self.stateModelAttribute} has been successfully created `
                );
              }
            },
            (err) => {
              self.ts.success(
                `Success! State Model ${self.stateModelAttribute} has been successfully created `
              );
            }
          );
      } else {
        this.ts.error('Please select type for new list of values');
      }
    }
  }

  // remove the state model
  disableStateModel() {
    const self = this;

    self.deleteModalTemplateRef = self.commonService.modal(
      self.deleteModalTemplate
    );
    self.deleteModalTemplateRef.result.then(
      (close) => {
        if (close) {
          self.form.get(['stateModel', 'enabled']).patchValue(false);
          self.form.get(['stateModel', 'attribute']).patchValue('');
          self.form.get(['stateModel', 'initialStates']).patchValue([]);
          self.form.get(['stateModel', 'states']).patchValue({});
          self.stateModelData = [];
        }
      },
      (dismiss) => {}
    );
  }

  // get all states in state model
  get allStates() {
    const self = this;
    if (self.stateModelAttrIndex > -1) {
      return self.form.get([
        'definition',
        self.stateModelAttrIndex,
        'properties',
        'enum',
      ]).value;
    } else {
      return [];
    }
  }

  // Add state to state model
  addNewState(newState) {
    const self = this;
    newState = newState.trim();
    if (
      (!newState || !newState.toString().trim()) &&
      typeof newState !== 'number'
    ) {
      return;
    }
    if (self.stateModelAttrIndex > -1) {
      if (self.stateModelAttributeType == 'Number') {
        newState = parseInt(newState);
        if (isNaN(newState)) {
          return;
        }
      }

      if (self.allStates.length > 0 && self.allStates.indexOf(newState) > -1) {
        return;
      }
      if (self.allStates.length == 0) {
        // first element in enum so initial state
        self.form.get(['stateModel', 'initialStates']).patchValue([newState]);
      }
      self.stateModelData.push({ state: newState, checked: false });
      (
        self.form.get([
          'definition',
          self.stateModelAttrIndex,
          'properties',
          'enum',
        ]) as FormArray
      ).push(new FormControl(newState));
      const statesDict = self.form.get(['stateModel', 'states']).value;
      statesDict[newState] = [];
      self.form.get(['stateModel', 'states']).patchValue(statesDict);
    }
  }

  // Get all next set of states for a state
  nextStates(state) {
    const self = this;
    return this.form.get(['stateModel', 'states']).value[state];
  }

  // all possible valid set of next states for a state
  autoCompleteNextStates(state) {
    const self = this;
    const statesDict = this.form.get(['stateModel', 'states']).value;
    // a single state should have unique next set of states
    if (statesDict && statesDict[state] && statesDict[state].length) {
      return self.allStates
        .filter((x) => !statesDict[state].includes(x))
        .filter((nextState) => nextState != state);
    }
    return self.allStates.filter((nextState) => nextState != state);
  }

  // remove the next state for a particular state
  removeNextState(nextState, state): void {
    const self = this;
    let states = this.form.get(['stateModel', 'states']).value;
    const index = states[state].indexOf(nextState);
    if (index >= 0) {
      states[state].splice(index, 1);
      self.form.get(['stateModel', 'states']).patchValue(states);
    }
  }

  // add a new next state
  addNewNextState(
    event: MatChipInputEvent,
    state,
    chipInput,
    matAuto: MatAutocomplete
  ): void {
    const self = this;
    let value: any = (event.value || '').trim();
    if (!value) {
      return;
    }
    if (self.stateModelAttributeType == 'Number') {
      value = parseInt(value);
    }
    let validState = self
      .autoCompleteNextStates(state)
      .find((st) => st == value);
    if (validState) {
      const statesDict = this.form.get(['stateModel', 'states']).value;
      statesDict[state].push(value);
      self.form.get(['stateModel', 'states']).patchValue(statesDict);
    }
    chipInput.value = '';
  }

  // select a next state from autocomplete dropdown
  selectedNextState(
    event: MatAutocompleteSelectedEvent,
    chipInput,
    stateIndex
  ): void {
    const self = this;
    chipInput.value = '';
    const state = self.stateModelData[stateIndex].state;
    const states = this.form.get(['stateModel', 'states']).value;
    let value: any = event.option.viewValue;
    if (self.stateModelAttributeType == 'Number') {
      value = parseInt(value);
    }
    states[state].push(value);
    self.form.get(['stateModel', 'states']).patchValue(states);
  }

  // check if user has selected state model to delete
  get deleteStateCount() {
    return this.stateModelData.filter((state) => state.checked == true)?.length;
  }

  // delete all states which are selected
  deleteStates(selectedState?) {
    const self = this;
    let states = selectedState
      ? [selectedState]
      : this.stateModelData
          .filter((state) => state.checked == true)
          .map((stateData) => stateData.state);

    // delete from enum
    if (self.stateModelAttrIndex > -1) {
      let remainingStates = self.allStates.filter((x) => !states.includes(x));
      (
        self.form.get([
          'definition',
          self.stateModelAttrIndex,
          'properties',
          'enum',
        ]) as FormArray
      ).clear();

      for (let state of remainingStates) {
        (
          self.form.get([
            'definition',
            self.stateModelAttrIndex,
            'properties',
            'enum',
          ]) as FormArray
        ).push(new FormControl(state));
      }
    }

    // delete from state model config
    let stateModelConfig = self.form.get(['stateModel', 'states']).value;
    for (let state of states) {
      delete stateModelConfig[state];
      self.stateModelData = self.stateModelData.filter(
        (data) => data.state != state
      );
    }

    // delete state from next set of states
    Object.keys(stateModelConfig).forEach((key) => {
      for (let state of states) {
        let stateIndex = stateModelConfig[key].indexOf(state);
        if (stateIndex != -1) {
          stateModelConfig[key].splice(stateIndex, 1);
        }
      }
    });
    self.form.get(['stateModel', 'states']).patchValue(stateModelConfig);

    // initial state logic
    if (self.stateModelData.length == 0) {
      self.form.get(['stateModel', 'initialStates']).patchValue([]);
    } else if (self.stateModelData.length > 0) {
      if (
        self.form.get(['stateModel', 'initialStates']).value[0] !=
        self.stateModelData[0]['state']
      ) {
        self.form
          .get(['stateModel', 'initialStates'])
          .patchValue([self.stateModelData[0]['state']]);
      }
    }
  }

  // delete all next set of states
  deleteAllNextStates() {
    const self = this;
    const stateModelConfig = self.allStates.reduce(
      (acc, curr) => ((acc[curr] = []), acc),
      {}
    );
    self.form.get(['stateModel', 'states']).patchValue(stateModelConfig);
  }

  sortableOnMove = (event: any) => {};

  sortableOnUpdate = (event: any) => {
    const self = this;
    if (event.newIndex == 0) {
      self.form
        .get(['stateModel', 'initialStates'])
        .patchValue([self.stateModelData[0]['state']]);
    }
    let allStates = self.allStates;
    let temp: any = allStates[event.oldIndex];
    allStates[event.oldIndex] = allStates[event.newIndex];
    allStates[event.newIndex] = temp;
    (
      self.form.get([
        'definition',
        self.stateModelAttrIndex,
        'properties',
        'enum',
      ]) as FormArray
    ).clear();

    for (let state of allStates) {
      (
        self.form.get([
          'definition',
          self.stateModelAttrIndex,
          'properties',
          'enum',
        ]) as FormArray
      ).push(new FormControl(state));
    }
  };

  get isSchemaFree() {
    const self = this;
    if (self.form && self.form.get('schemaFree')) {
      return self.form.get('schemaFree').value;
    }
    return false;
  }
}
