import { Component, Input } from '@angular/core';
import { SchemaBuilderService } from 'src/app/home/schema-utils/schema-builder.service';

@Component({
  selector: 'odp-field-type',
  templateUrl: './field-type.component.html',
  styleUrls: ['./field-type.component.scss'],
  providers: [SchemaBuilderService]
})
export class FieldTypeComponent {

  @Input() field: any;
  @Input() label: boolean;
  @Input() basic: boolean;
  private types: Array<any>;
  constructor(private schemaService: SchemaBuilderService) {
    const self = this;
    self.types = self.schemaService.getSchemaTypes();
  }

  makeStructure() {
    const self = this;
    if (!self.field.type && !self.field.properties) {
      const tempField: any = {
        properties: self.field
      };
      tempField.type = self.field._type;
      self.field = tempField;
    }
  }

  getClass(field?: any) {
    const self = this;
    self.makeStructure();
    if (!field) {
      field = self.field;
    }
    const temp = self.types.find(e => e.value === field.type);
    if (temp) {
      return temp.class;
    } else {
      return 'odp-abc';
    }
  }

  getLabel(field?: any) {
    const self = this;
    if (!field) {
      field = self.field;
    }
    self.makeStructure();
    const temp = self.types.find(e => e.value === field.type);
    if (self.basic) {
      return temp ? temp.label : 'Text';
    }
    if (field.type === 'String') {
      if (field.properties.email) {
        return 'Email';
      }
      
      if (field.properties.longText) {
        return 'Long Text';
      }
      if (field.properties.richText) {
        return 'Rich Text';
      }
      // if (field.properties.password) {
      //   return 'Secure Text';
      // }
      if (field.properties._detailedType && field.properties._detailedType === 'enum') {
        return 'List of values';
      }
      return 'Text';
    } else if (field.type === 'Number') {
      if (field.properties._detailedType && field.properties._detailedType === 'enum') {
        return 'List of values';
      }
      if (field.properties._detailedType && field.properties._detailedType === 'currency') {
        return 'Currency';
      }
      return 'Number';
    } else if (field.type === 'Date') {
      if (field.properties.dateType && field.properties.dateType === 'date') {
        return 'Date';
      }
      if (field.properties.dateType && field.properties.dateType === 'datetime-local') {
        return 'Date & Time';
      }
    }
    return temp ? temp.label : 'Text';
  }

  get collectionType() {
    const self = this;
    if (self.field.type === 'Array' && self.field.definition && self.field.definition.length > 0) {
      return self.getLabel(self.field.definition[0]);
    }
    return null;
  }

  get collectionClass() {
    const self = this;
    if (self.field.type === 'Array' && self.field.definition && self.field.definition.length > 0) {
      return self.getClass(self.field.definition[0]);
    }
    return null;
  }
}
