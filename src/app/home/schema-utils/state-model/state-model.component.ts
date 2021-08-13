import { Component, Input, OnInit, ElementRef, ViewChild, ViewEncapsulation, TemplateRef } from '@angular/core';
import { AppService } from 'src/app/utils/services/app.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {FormControl} from '@angular/forms';
import {MatAutocomplete, MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';
import { SchemaBuilderService } from '../schema-builder.service';
import {DeleteModalConfig } from 'src/app/utils/interfaces/schemaBuilder';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-state-model',
  templateUrl: './state-model.component.html',
  styleUrls: ['./state-model.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StateModelComponent implements OnInit {
  @ViewChild('deleteModalTemplate') deleteModalTemplate: TemplateRef<HTMLElement>;
  deleteModalTemplateRef: NgbModalRef;

  sourceDefinition : any;
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

  constructor( 
    private appService: AppService,
    private schemaService: SchemaBuilderService,
    private commonService: CommonService,

    private fb: FormBuilder) { 

      const self = this;
      self.deleteModal = {
        title: 'Delete State Model',
        message: 'Are you sure you want to delete the state model?',
        falseButton: 'No',
        trueButton: 'Yes',
        showButtons: true
      };
  }

  ngOnInit(): void {
    const self = this;
    let definitions = (self.form.get('definition') as FormArray).controls
    self.sourceDefinition = self.appService.patchDataKey(self.fb.array(definitions).value);

    if(self.stateModelEnabled){
      self.stateModelData = self.allStates.map(state => {
        return {'state': state, 'checked': false }
      });


    }
  }

  // all possible List of Values attributes 
  get ListOfValuesAttributes(){
    const self = this;
    return self.sourceDefinition.filter(data => data.properties._detailedType == 'enum');
  }

  // get attribute configured as State Model
  get stateModelAttribute(){
    const self = this;
    return self.form.get(['stateModel', 'attribute']).value;
  }

  get stateModelAttributeType(){
    const self = this;
    let definition = (self.form.get('definition') as FormArray).value ;
    let stateModelAttrIndex = definition.findIndex(data => data.properties.name === self.stateModelAttribute)
    if(stateModelAttrIndex > -1){
      return definition[stateModelAttrIndex].type; 
    }
  }

  // check whether state model is configured 
  get stateModelEnabled(){
    const self = this;
    return self.form.get(['stateModel', 'enabled']).value;
  }

  // create a new List of Values attribute with String/Number Type and convert to State Model
  addNewListOfValues(type){
    const self = this;
    const attrName =  self.form.get(['stateModel', 'attribute']).value;
    const tempArr = self.form.controls.definition as FormArray;
    const temp = self.schemaService.getDefinitionStructure({ _newField: true });
    
    const attrCamelCase = self.appService.toCamelCase(attrName);
    temp.get(['properties', 'name']).patchValue(attrName);
    // temp.get(['properties', 'dataKey']).patchValue(attrCamelCase);
    temp.get(['properties', 'dataPath']).patchValue(attrCamelCase);
    temp.get('type').patchValue(type);
    temp.get(['properties', '_detailedType']).patchValue('enum');
    tempArr.push(temp);
  }

  // convert existing List of Values attribute to State Model 
  addExistingListOfValues(value){
    const self = this;
    self.form.get(['stateModel', 'attribute']).patchValue(value);
  }

  // configure the state model 
  enableStateModel(){
    const self = this; 
    self.form.get(['stateModel', 'enabled']).patchValue(true);

    // check if already existing states and update state model dictionary
    let definition = (self.form.get('definition') as FormArray).value ;
    let stateModelAttrIndex = definition.findIndex(data => data.properties.name === self.stateModelAttribute)
    if(stateModelAttrIndex > -1){
      const existingStates = self.form.get(['definition', stateModelAttrIndex, 'properties', 'enum']).value;
      if(existingStates.length > 0){
         const stateModelDict = existingStates.reduce((a,x) => ({...a, [x]: [] }), {});
         self.form.get(['stateModel', 'states']).patchValue(stateModelDict);
         self.form.get(['stateModel', 'initialState']).patchValue([existingStates[0]])

        }

      // first state as initial state 

      self.stateModelData = self.allStates.map(state => {
        return {'state': state, 'checked': false }
      });

    }

  }

  // delete the state model
  disableStateModel(){
    const self = this; 

    self.deleteModalTemplateRef = self.commonService.modal(self.deleteModalTemplate);
    self.deleteModalTemplateRef.result.then((close) => {
      if(close){
        self.form.get(['stateModel', 'enabled']).patchValue(false);
        self.form.get(['stateModel', 'attribute']).patchValue('');
        self.form.get(['stateModel', 'initialState']).patchValue([]);
        self.form.get(['stateModel', 'states']).patchValue({});
        self.stateModelData = [];
      }

    }, dismiss => { })

    
   
  }

  // get all states in state model
  get allStates(){
    const self = this;

    let definition = (self.form.get('definition') as FormArray).value ;
    let stateModelAttrIndex = definition.findIndex(data => data.properties.name === self.stateModelAttribute)
    if(stateModelAttrIndex > -1){
      return self.form.get(['definition', stateModelAttrIndex, 'properties', 'enum']).value;
      
    }else{
      return [];
    }
    
  }

  // add new state to state model
  addNewState(newState){
    const self = this;

    if ((!newState || !newState.toString().trim()) && (typeof newState !== 'number')) {
      return;
    }


    let definition = (self.form.get('definition') as FormArray).value ;
    let stateModelAttrIndex = definition.findIndex(data => data.properties.name === self.stateModelAttribute)
    if(stateModelAttrIndex > -1){
      if(self.form.get(['definition', stateModelAttrIndex, 'type']).value == 'Number'){
        newState = parseInt(newState);

        if(isNaN(newState)){
          return;
        }
      }
      
      const states = self.form.get(['definition', stateModelAttrIndex, 'properties', 'enum']).value
      if (states.length > 0) {
        if (states.indexOf(newState) > -1) {
          return;
        }
      }else if(states.length == 0){
        // first element in enum so initial state 
        self.form.get(['stateModel', 'initialState']).patchValue([newState])

      }

      self.stateModelData.push({'state': newState , 'checked': false});
      (self.form.get(['definition', stateModelAttrIndex, 'properties', 'enum']) as FormArray).push(new FormControl(newState));

      const statesDict = self.form.get(['stateModel', 'states']).value;
      statesDict[newState] = [];
      self.form.get(['stateModel', 'states']).patchValue(statesDict);

    }

  }

  // Get all next set of states for a state
  nextStates(state){
    const self = this;
    return this.form.get(['stateModel', 'states']).value[state];
  }

  // all possible valid set of next states for a state
  autoCompleteNextStates(state){
    const self = this;
    const statesDict = this.form.get(['stateModel', 'states']).value;


    // a single state should have unique next set of states
    if(statesDict && statesDict[state] && statesDict[state].length){
      return self.allStates.filter(x => !statesDict[state].includes(x))
      .filter(nextState => nextState != state);
      
    }
    return self.allStates.filter(nextState => nextState != state);
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
  addNewNextState(event: MatChipInputEvent, state, chipInput, matAuto: MatAutocomplete): void{
    const self = this;
    let value: any = (event.value || '').trim();

    if(!value){
      return 
    }

    if(self.stateModelAttributeType == 'Number'){
      value = parseInt(value);
    }

    let validState = self.autoCompleteNextStates(state).find(st => st == value)
    
    if (validState) {
      const statesDict = this.form.get(['stateModel', 'states']).value;
      statesDict[state].push(value)
      self.form.get(['stateModel', 'states']).patchValue(statesDict);
    }
    chipInput.value = '';
  }

  // select a next state from autocomplete dropdown
  selectedNextState(event: MatAutocompleteSelectedEvent, chipInput, stateIndex): void {
    const self = this;
    chipInput.value = '';
    const state = self.allStates[stateIndex]; 
    const states = this.form.get(['stateModel', 'states']).value;
    let value: any = event.option.viewValue;
    if(self.stateModelAttributeType == 'Number'){
      value = parseInt(value);
    }
    states[state].push(value);
    self.form.get(['stateModel', 'states']).patchValue(states);
  }

  // check if user has selected state model to delete
  get deleteStateCount(){
    return this.stateModelData.filter(state => state.checked == true).length; 
  }
  
  // delete all states which are selected
  deleteStates(selectedState?){
    const self = this;
    let states = selectedState ? [selectedState] :  this.stateModelData.filter(state => state.checked == true).map(stateData => stateData.state);
    
    // delete from enum
    let definition = (self.form.get('definition') as FormArray).value ;
    let stateModelAttrIndex = definition.findIndex(data => data.properties.name === self.stateModelAttribute)
    if(stateModelAttrIndex > -1){
      const existingStates = self.form.get(['definition', stateModelAttrIndex, 'properties', 'enum']).value;
      let remainingStates = existingStates.filter(x => !states.includes(x));
      (self.form.get(['definition', stateModelAttrIndex, 'properties', 'enum']) as FormArray).clear();

      for(let state of remainingStates){
        (self.form.get(['definition', stateModelAttrIndex, 'properties', 'enum']) as FormArray).push(new FormControl(state));

      }
    }

    // delete from state model config
    let stateModelConfig = self.form.get(['stateModel', 'states']).value;
    for(let state of states){
      delete stateModelConfig[state];
      self.stateModelData = self.stateModelData.filter(data => data.state != state);
    }

    // delete state from next set of states 
    Object.keys(stateModelConfig).forEach(key => {
      for(let state of states){
          let stateIndex = stateModelConfig[key].indexOf(state);
          if(stateIndex != -1){
            stateModelConfig[key].splice(stateIndex, 1);
          }
      }
    })

    self.form.get(['stateModel', 'states']).patchValue(stateModelConfig);


    // initial state logic
    if(self.stateModelData.length == 0){
      self.form.get(['stateModel', 'initialState']).patchValue([]);
    }
    else if(self.stateModelData.length > 0){
      if(self.form.get(['stateModel', 'initialState']).value[0] != self.stateModelData[0]['state']){
        self.form.get(['stateModel', 'initialState']).patchValue([self.stateModelData[0]['state']]);
      }
    }

    
  }

  // delete all next set of states
  deleteAllNextStates(){
    const self = this;
    const stateModelConfig = self.allStates.reduce((acc,curr)=> (acc[curr]=[],acc),{});
    self.form.get(['stateModel', 'states']).patchValue(stateModelConfig);

  }

  sortableOnMove = (event: any) => {
    // return !event.related.classList.contains('disabled');
  }

  sortableOnUpdate = (event: any) => {
    const self = this;
    
    if(event.newIndex == 0){
      self.form.get(['stateModel', 'initialState']).patchValue([self.stateModelData[0]['state']]);

    }
  }


}