import { Component, Input, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AppService } from 'src/app/utils/services/app.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {map, startWith} from 'rxjs/operators';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';
import { SchemaBuilderService } from '../schema-builder.service';
import { StaticSymbolResolver } from '@angular/compiler';

@Component({
  selector: 'odp-state-model',
  templateUrl: './state-model.component.html',
  styleUrls: ['./state-model.component.scss']
})
export class StateModelComponent implements OnInit {

  sourceDefinition : any;
  searchTerm: string;
  @Input() form: FormGroup;
  @Input() edit: any;
  newState: any;

  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  

  constructor( 
    private appService: AppService,
    private schemaService: SchemaBuilderService,
    private fb: FormBuilder) { 
      // this.filteredFruits = this.fruitCtrl.valueChanges.pipe(
      //   startWith(null),
      //   map((fruit: string | null) => fruit ? this._filter(fruit) : this.allFruits.slice()));
  }

  ngOnInit(): void {
    const self = this;
    let definitions = (self.form.get('definition') as FormArray).controls
    self.sourceDefinition = self.appService.patchDataKey(self.fb.array(definitions).value);
  }

  checkStateModelAttribute(){
    const self = this;

    let selectedAttribute = self.form.get(['stateModel', 'attribute']).value

    let attributeIndex = self.ListOfValuesAttributes.findIndex(data => data.properties.name == selectedAttribute)
    if(attributeIndex == -1 ){
      self.form.get(['stateModel', 'attribute']).setValue(null);
    }
  }

  get ListOfValuesAttributes(){
    const self = this;
    return self.sourceDefinition.filter(data => data.properties._detailedType == 'enum');
  }

  get stateModelAttribute(){
    const self = this;
    return self.form.get(['stateModel', 'attribute']).value;
  }

  get stateModelEnabled(){
    const self = this;
    return self.form.get(['stateModel', 'enabled']).value;
  }

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
    temp.get(['properties', 'unique']).patchValue(true);
    tempArr.push(temp);
  }

  addExistingListOfValues(value){
    const self = this;
    self.form.get(['stateModel', 'attribute']).patchValue(value);
  }

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
      }

    }

  }

  disableStateModel(){
    const self = this; 
    self.form.get(['stateModel', 'enabled']).patchValue(false);
    self.form.get(['stateModel', 'attribute']).patchValue('');
    self.form.get(['stateModel', 'initialState']).patchValue([]);
    self.form.get(['stateModel', 'states']).patchValue({});
  }

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

  addNewState(newState){
    const self = this;
    let definition = (self.form.get('definition') as FormArray).value ;
    let stateModelAttrIndex = definition.findIndex(data => data.properties.name === self.stateModelAttribute)
    if(stateModelAttrIndex > -1){

      if(self.form.get(['definition', stateModelAttrIndex, 'type']).value == 'Number'){
        newState = parseInt(newState);
      }
      (self.form.get(['definition', stateModelAttrIndex, 'properties', 'enum']) as FormArray).push(new FormControl(newState));
      
      const states = self.form.get(['stateModel', 'states']).value;
      states[newState] = [];
      self.form.get(['stateModel', 'states']).patchValue(states);

    }

  }

  nextStates(state){
    const self = this;
    return this.form.get(['stateModel', 'states']).value[state];
  }


  add(event: MatChipInputEvent, state , chipInput ): void {
    const self = this;
    const value = (event.value || '').trim();
    // Add our fruit
    if (value) {
      const states = this.form.get(['stateModel', 'states']).value;
      states[state].push(value)
      self.form.get(['stateModel', 'states']).patchValue(states);

    }
    chipInput.value = '';
  }

  remove(nextState, state): void {
    const self = this;
    let states = this.form.get(['stateModel', 'states']).value;
    
    const index = states[state].indexOf(nextState);

    if (index >= 0) {
      states[state].splice(index, 1);
      self.form.get(['stateModel', 'states']).patchValue(states);
    }
  }

  addNew(event: MatChipInputEvent, state, chipInput): void{
    const self = this;
    const value = (event.value || '').trim();
    // Add our fruit
    if (value) {
      const states = this.form.get(['stateModel', 'states']).value;
      states[state].push(value)
      self.form.get(['stateModel', 'states']).patchValue(states);
    }
    chipInput.value = '';


  }

  displayFn(value: any): string {
    return value;
}

}