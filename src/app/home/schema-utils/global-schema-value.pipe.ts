import { Pipe, PipeTransform } from '@angular/core';
import * as faker from 'faker';

@Pipe({ name: 'globalSchemaValue' })
export class GlobalSchemaValuePipe implements PipeTransform {

    private idPreview(definition) {
        let zeros = '';
        const arr = [];
        const size = parseInt(definition.counter ? definition.counter.toString().length : 0, 10);
        const sub = parseInt(definition.padding ? definition.padding : 0, 10);
        if (sub - size > 0) {
            const a = sub - size;
            for (let i = 0; i < a; i++) {
                arr.push('0');
                zeros = arr.toString().replace(/\,/g, '');
            }
        }
        if (definition.prefix !== null) {
            const counter = definition.counter ? definition.counter : '';
            const prefix = definition.prefix ? definition.prefix : '';
            const suffix = definition.suffix ? definition.suffix : '';
            const id = prefix + zeros + counter + suffix;
            return id;
        }
    }

    private _fillValue(definition): any {
        const temp = {};
        for (let i = 0; i < definition.length; i++) {
            if ((!definition[i].key || definition[i].key.trim() === '') && !definition[i].id) {
                continue;
            }
            if (definition[i].id) {
                temp['_id'] = this.idPreview(definition[i].id);
            } else if (definition[i].type === 'String') {
                if (definition[i].key.match(/^.*(phone|contact|mobile|cell).*$/i)) {
                    temp[definition[i].key] = faker.phone.phoneNumber('##########');
                } else if (definition[i].properties.name.split(' ').map(e => e.toLowerCase()).indexOf('data') > -1) {
                    temp[definition[i].key] = faker.date.past().toISOString();
                } else if (definition[i].key.toLowerCase() === 'internet') {
                    temp[definition[i].key] = faker.internet.userName();
                } else if (definition[i].key.toLowerCase() === 'email' || definition[i].key.toLowerCase() === 'username') {
                    temp[definition[i].key] = faker.internet.email();
                } else if (definition[i].key.toLowerCase() === 'password') {
                    temp[definition[i].key] = faker.internet.password();
                } else if (definition[i].key.toLowerCase() === 'gender') {
                    const genderFull = ['Male', 'Female', 'Others'];
                    const index = Math.floor(Math.random() * 1000) % 3;
                    temp[definition[i].key] = genderFull[index];
                } else if (definition[i].key.match(/^.*(company|organization).*$/i)) {
                    temp[definition[i].key] = faker.company.companyName();
                } else if (definition[i].key.match(/^.*(pincode|zipcode).*$/i)) {
                    temp[definition[i].key] = faker.address.zipCode('######');
                } else if (definition[i].key.match(/^.*(city).*$/i)) {
                    temp[definition[i].key] = faker.address.city();
                } else if (definition[i].key.match(/^.*(state).*$/i)) {
                    temp[definition[i].key] = faker.address.state();
                } else if (definition[i].key.match(/^.*(country).*$/i)) {
                    temp[definition[i].key] = faker.address.country();
                } else if (definition[i].key.match(/^.*name$/i)) {
                    if (definition[i].key.match(/^.*first$/i)) {
                        temp[definition[i].key] = faker.name.firstName();
                    } else if (definition[i].key.match(/^.*last$/i)) {
                        temp[definition[i].key] = faker.name.lastName();
                    } else {
                        temp[definition[i].key] = faker.name.findName();
                    }
                } else {
                    temp[definition[i].key] = faker.fake('{{random.words}}');
                }
            } else if (definition[i].type === 'Number') {
                if (definition[i].key.match(/^.*(phone|contact|mobile|cell).*$/i)) {
                    temp[definition[i].key] = +faker.phone.phoneNumber('##########');
                } else if (definition[i].key.match(/^.*(pincode|zipcode).*$/i)) {
                    temp[definition[i].key] = +faker.address.zipCode('######');
                } else {
                    temp[definition[i].key] = +faker.random.number();
                }
            } else if (definition[i].type === 'Boolean') {
                temp[definition[i].key] = faker.random.boolean();
            } else if (definition[i].type === 'Date') {
                temp[definition[i].key] = faker.date.past().toISOString();
            } else if (definition[i].type === 'Object') {
                temp[definition[i].key] = this._fillValue(definition[i].definition);
            } else if (definition[i].type === 'Array') {
                temp[definition[i].key] = [this._fillValue(definition[i].definition)._self];
            }
        }
        return temp;
    }

    transform(value: any) {
        let temp = null;
        if (value.type === 'Object') {
            temp = this._fillValue(value.definition);

        } else {
            temp = [];
            temp.push(this._fillValue(value.definition));
        }
        return temp;
    }
}
