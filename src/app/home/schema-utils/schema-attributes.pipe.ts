import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'schemaAttributes' })
export class SchemaAttributesPipe implements PipeTransform {

    private _getAttribute(definitions, flatten, parentKey?, parentLabel?) {
        let temp = [];
        for (let i = 0; i < definitions.length; i++) {
            const def = definitions[i];
            if (!def.key) {
                continue;
            }
            const key = (parentKey ? parentKey + '.' : '') + def.key;
            const name = (parentLabel ? parentLabel + '.' : '') + def.properties.name;
            if (def.type === 'Object') {
                if (flatten) {
                    temp = temp.concat(this._getAttribute(def.definition, flatten, key, name));
                }
            } else if (def.type === 'Array') {

            } else if (def.type === 'Global' && def.properties.attributeList) {
                const attrList = JSON.parse(JSON.stringify(def.properties.attributeList));
                temp = temp.concat(attrList.map(e => {
                    e.key = def.key + '.' + e.key;
                    e.name = def.properties.name + '.' + e.name;
                    return e;
                }));
            } else if (def.type === 'Relation') {
                temp.push({
                    key: key + '._id',
                    name,
                    properties: def.properties
                });
            } else if (def.type === 'User') {
                temp.push({
                    key: key + '._id',
                    name,
                    properties: def.properties
                });
            } else {
                temp.push({
                    key,
                    name,
                    properties: def.properties
                });
            }
        }
        return temp;
    }

    transform(value: any, flatten?: boolean): any {
        let temp = [];
        if (value && value.definition) {
            temp = this._getAttribute(value.definition.filter(d => d.key !== '_id'), flatten);
        }
        temp.unshift({
            key: '_id',
            name: value.definition[0] ? value.definition[0]['properties']['name'] : 'ID',
            type: 'String'
        });
        return temp;
    }
}
