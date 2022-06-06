import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'schemaStructure' })
export class SchemaStructurePipe implements PipeTransform {

    private properties(properties) {
        const temp = {};
        Object.keys(properties).forEach(i => {
            if (typeof properties[i] === 'number' || properties[i]) {
                if (i === 'hasTokens' && (properties['longText'] || properties['richText'])) {
                    if (properties[i] && properties[i].length > 0) {
                        temp[i] = properties[i];
                    }
                } else if (i === 'enum' && properties['_detailedType'] === 'enum') {
                    if (properties[i] && properties[i].length > 0) {
                        temp[i] = properties[i];
                    }
                } else if (i === 'multiselect' && properties['_detailedType'] === 'enum') {
                    temp[i] = properties[i];
                } else if (i === 'currency' && properties['_detailedType'] === 'currency') {
                    temp[i] = properties[i];
                } else if (i === 'password' && properties['_detailedType'] === 'password') {
                    temp[i] = properties[i];
                } else if (i === 'email' && properties['_detailedType'] === 'email') {
                    temp[i] = properties[i];
                } else if (i === 'richText' && properties['_detailedType'] === 'rich') {
                    temp[i] = properties[i];
                } else if (i === 'password' && properties['_detailedType'] === 'rich') {
                    temp[i] = properties[i];
                }
                else if (i === 'longText' && properties['_detailedType'] === 'long') {
                    temp[i] = properties[i];
                }  else if (i === 'password' && properties['_detailedType'] === 'long') {
                    temp[i] = properties[i];
                } else if (i === 'password' && properties['_type'] === 'File') {
                    temp[i] = properties[i];
                } 
                else if (i === 'natural' && properties['_detailedType'] === 'natural') {
                    temp[i] = properties[i];
                } else if (i === 'max'
                    || i === 'min'
                    || i === 'maxlength'
                    || i === 'minlength'
                    || i === 'pattern'
                    || i === 'required'
                    || i === 'unique'
                    || i === 'name'
                    || i === 'dateType'
                    || i === 'relatedTo'
                    || i === 'relatedSearchField'
                    || i === 'relatedViewFields'
                    || i === 'schema'
                    || i === 'geoType'
                    || i === 'fieldLength'
                    || i === '_description'
                    || i === '_typeChanged'
                    || i === 'createOnly'
                    || i === 'fileType'
                    || i === 'default'
                    || i === 'precision'
                    || i === 'deleteAction'
                    || i === 'label'
                    || i === 'readonly'
                    || i === 'errorMessage'
                    || i === 'defaultTimezone'
                    || i === 'supportedTimezones') {
                    temp[i] = properties[i];
                }
            }
        });
        return temp;
    }

    private buildDefinition(definition) {
        return definition
            .map(def => {
                const tempDef = JSON.parse(JSON.stringify(def));
                if (tempDef.key === '_id') {
                    const { _fieldId, _placeholder, name, ...remaining } = tempDef;
                    if (!!remaining.properties) {
                        delete remaining.properties._type;
                    }
                    remaining.type = 'String';
                    return remaining;
                }
                if (!!tempDef.definition) {
                    tempDef.definition = this.buildDefinition(tempDef.definition);
                }
                tempDef.properties = this.properties(tempDef.properties);
                const { _add, _delete, _disableType, _placeholder, _fieldId, _newField, name, ...remaining } = tempDef;
                return remaining;
            });
    }

    private buildWizards(obj) {
        const temp = JSON.parse(JSON.stringify(obj.steps));
        Object.keys(temp).forEach(i => {
            const tempFields = JSON.parse(JSON.stringify(temp[i].fields));
            temp[i].fields = [];
            Object.keys(tempFields).forEach(j => {
                temp[i].fields.push(tempFields[j].key);
            });
        });
        return temp;
    }

    transform(value: any): any {
        const temp = {};
        Object.keys(value).forEach(i => {
            if (i === 'definition' && value[i]) {
                temp[i] = this.buildDefinition(value[i]);
            } else if (i === 'wizard' && value[i]) {
                temp[i] = this.buildWizards(value[i]);
            } else {
                temp[i] = value[i];
            }
        });
        return temp;
    }
}
