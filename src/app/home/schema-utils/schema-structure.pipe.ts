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
                } else if (i === 'longText' && properties['_detailedType'] === 'long') {
                    temp[i] = properties[i];
                } else if (i === 'natural' && properties['_detailedType'] === 'natural') {
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
                    || i === 'attributeList'
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
                    || i === 'errorMessage') {
                    temp[i] = properties[i];
                }
            }
        });
        return temp;
    }

    private buildDefinition(definition) {
        const temp = {};
        for (let i = 0; i < definition.length; i++) {
            const tempDef = Object.assign({}, definition[i]);
            if (tempDef._id) {
                temp['_id'] = tempDef._id;
                delete temp['_id']['_fieldId'];
                delete temp['_id']['_placeholder'];
                delete temp['_id']['key'];
                delete temp['_id']['name'];
                delete temp['_id']['type'];
                if (temp['_id']['properties']) {
                    delete temp['_id']['properties']['_type'];
                }
            }
            if (!definition[i].key) {
                continue;
            } else {
                if (tempDef.definition) {
                    tempDef.definition = this.buildDefinition(tempDef.definition);
                }
                tempDef.properties = this.properties(tempDef.properties);
                temp[tempDef.key] = tempDef;
                delete temp[tempDef.key]._add;
                delete temp[tempDef.key]._delete;
                delete temp[tempDef.key]._disableType;
                delete temp[tempDef.key]._placeholder;
                delete temp[tempDef.key]._fieldId;
                delete temp[tempDef.key]._newField;
                delete temp[tempDef.key].name;
                delete temp[tempDef.key].key;
            }
        }
        return temp;
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
