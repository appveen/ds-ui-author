import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'globalSchemaStructure' })

export class GlobalSchemaStructurePipe implements PipeTransform {

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

    private buildDefinition(definiiton) {
        const tempDef = {};
        for (const i of definiiton) {
            if (i.key !== undefined) {
                tempDef[i.key] = {};
                tempDef[i.key]['type'] = i.type;
                tempDef[i.key]['properties'] = this.properties(i.properties);
                if (i.definition && i.definition.length > 0) {
                    tempDef[i.key]['definition'] = this.buildDefinition(i.definition);
                }
            }
        }
        return tempDef;
    }


    transform(value: any): any {
        const temp = {};
        temp['name'] = value.name;
        temp['description'] = value.description;
        temp['character'] = value.character;
        temp['type'] = value.dataFormatType;
        temp['definition'] = {};
        temp['definition']['definition'] = this.buildDefinition(value.definition);
        temp['definition']['type'] = value.type;
        temp['description'] = value.description;
        return temp;
    }

}
