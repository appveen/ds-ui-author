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
    this.types = this.schemaService.getSchemaTypes();
  }

  makeStructure() {
    if (!this.field.type && !this.field.properties) {
      const tempField: any = {
        properties: this.field
      };
      tempField.type = this.field._type;
      this.field = tempField;
    }
  }

  getClass(field?: any) {
    this.makeStructure();
    if (!field) {
      field = this.field;
    }
    const temp = this.types.find(e => e.value === field.type);
    if (temp) {
      return temp.class;
    } else {
      return 'dsi-text';
    }
  }

  getLabel(field?: any) {
    let label = '';
    if (!field) {
      field = this.field;
    }
    this.makeStructure();
    const temp = this.types.find(e => e.value === field.type);
    if (this.basic) {
      label = temp ? temp.label : 'Text';
    }
    if (field.type === 'String') {
      if (field.properties.email) {
        label = 'Email';
      } else if (field.properties.longText) {
        label = 'Long Text';
      } else if (field.properties.richText) {
        label = 'Rich Text';
      } else if (field.properties._detailedType && field.properties._detailedType === 'enum') {
        label = 'List of values';
      } else {
        label = 'Text';
      }
    } else if (field.type === 'Number') {
      if (field.properties._detailedType && field.properties._detailedType === 'enum') {
        label = 'List of values';
      } else if (field.properties._detailedType && field.properties._detailedType === 'currency') {
        label = 'Currency';
      } else {
        label = 'Number';
      }
    } else if (field.type === 'Date') {
      if (field.properties.dateType && field.properties.dateType === 'date') {
        label = 'Date';
      } else if (field.properties.dateType && field.properties.dateType === 'datetime-local') {
        label = 'Date & Time';
      }
    } else {
      label = temp ? temp.label : 'Text';
    }
    if (field.properties.password) {
      label += '  [secure]';
    }
    if (!label) {
      label = 'Text';
    }
    return label;
  }

  get collectionType() {
    if (this.field.type === 'Array' && this.field.definition && this.field.definition.length > 0) {
      return this.getLabel(this.field.definition[0]);
    }
    return null;
  }

  get collectionClass() {
    if (this.field.type === 'Array' && this.field.definition && this.field.definition.length > 0) {
      return this.getClass(this.field.definition[0]);
    }
    return null;
  }
}
