import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'globalSchemaStructure' })

export class GlobalSchemaStructurePipe implements PipeTransform {

    private properties(properties) {
        const temp = {};
        Object.keys(properties || {}).forEach(i => {
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
                } else if (i === 'longText' && properties['_detailedType'] === 'long') {
                    temp[i] = properties[i];
                } else if (i === 'password' && properties['_detailedType'] === 'long') {
                    temp[i] = properties[i];
                } else if (i === 'natural' && properties['_detailedType'] === 'natural') {
                    temp[i] = properties[i];
                } else if (i === 'password' && properties['_type'] === 'File') {
                    temp[i] = properties[i];
                } else if (!properties['richText'] && !properties['longText'] && !properties['email'] && properties['_detailedType'] != 'enum' && properties['_type'] == 'String' && i == 'password') {
                    temp[i] = properties[i];
                }
                else if (i === 'max'
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
        if (!definition) {
            return [];
        }
        return definition.filter(def => !!def.key).map(def => {
            delete def._newField;
            delete def._placeholder;
            const tempDef = JSON.parse(JSON.stringify(def)) || {};
            tempDef.properties = this.properties(tempDef.properties);
            if (!!tempDef.definition && !!tempDef.definition.length) {
                tempDef.definition = this.buildDefinition(tempDef.definition);
            }
            return tempDef;
        });
    }


    transform(value: any): any {
        const temp = {};
        temp['name'] = value.name;
        temp['description'] = value.description;
        temp['character'] = value.character;
        temp['type'] = value.dataFormatType;
        const def = {};
        def['definition'] = this.buildDefinition(value.definition);
        def['type'] = value.type;
        temp['definition'] = [def];
        temp['description'] = value.description;
        return temp;
    }

}
