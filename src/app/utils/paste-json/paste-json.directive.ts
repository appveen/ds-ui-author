import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';
import * as _ from 'lodash';


@Directive({
  selector: '[odpPasteJson]'
})
export class PasteJsonDirective {

  @Output() odpPasteJson: EventEmitter<any>;
  structureType: string;
  constructor(private ele: ElementRef) {
    this.odpPasteJson = new EventEmitter();
    this.structureType = 'Object';
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    let text = event.clipboardData.getData('text/plain');
    let definition: Array<any>;
    this.ele.nativeElement.classList.remove('is-invalid');
    try {
      const json = JSON.parse(text);
      if (json && Array.isArray(json)) {
        this.structureType = 'Array';
        definition = this.createDefinition(json[0]);
      } else {
        definition = this.createDefinition(json);
      }
    } catch (err) {
      definition = this.createField(text);
    }
    if (!definition || definition.length == 0) {
      this.ele.nativeElement.classList.add('is-invalid');
      return;
    }
    this.odpPasteJson.emit({
      type: this.structureType,
      definition
    });
  }

  createDefinition(json: any, parent?: any) {
    if (Array.isArray(json)) {
      return this.createDefinition({ _self: json[0] }, parent);
    } else {
      return Object.keys(json).map(i => {
        const temp: any = {};
        if (json[i] == null) {
          json[i] = 'String';
        }
        temp.key = i;
        temp.properties = {
          name: i == '_self' ? '_self' : i
        };
        if (parent) {
          temp.properties.dataPathSegs = JSON.parse(JSON.stringify(parent.properties.dataPathSegs));
          if (i == '_self') {
            temp.properties.dataPath = parent.properties.dataPath + '[#]';
            temp.properties.dataPathSegs.push('[#]');
          } else {
            temp.properties.dataPath = parent.properties.dataPath + '.' + i;
            temp.properties.dataPathSegs.push(i);
          }
        } else {
          temp.properties.dataPath = i;
          temp.properties.dataPathSegs = [i];
        }
        temp.type = _.capitalize((typeof json[i] || 'string'));
        if (i.toLowerCase().split(' ').indexOf('date') > -1) {
          temp.type = 'Date';
        }
        if (i.toLowerCase().split(' ').indexOf('amount') > -1) {
          temp.type = 'Number';
          temp.properties.currency = 'INR';
        }
        if (typeof json[i] === 'object') {
          if (Array.isArray(json[i])) {
            temp.type = 'Array';
          } else {
            temp.type = 'Object';
          }
          temp.definition = this.createDefinition(json[i], temp);
        }
        return temp;
      });
    }
  }

  createField(val: string) {
    let def = val.split(/\n/).filter(e => {
      if (e && e.trim() && e.trim() !== ',') {
        return e;
      }
    }).map(e => e.trim());
    if (def && def.length < 2) {
      def = val.split(/\t/).filter(e => {
        if (e && e.trim() && e.trim() !== ',') {
          return e;
        }
      }).map(e => e.trim());
    }
    if (def && def.length < 2) {
      def = val.split(/,/).filter(e => {
        if (e && e.trim() && e.trim() !== ',') {
          return e;
        }
      }).map(e => e.trim());
    }
    const json = {};
    if (def.length > 1) {
      def.forEach(element => {
        this.getJSON(element, json);
      });
    }
    return this.createDefinition(json);
  }

  getJSON(field: string, value: any) {
    if (!value) {
      value = {};
    }
    const fields = field.split('.').map(e => e.trim());
    if (fields.length > 1) {
      if (!value[fields[0]]) {
        value[fields[0]] = {};
      }
      if (value[fields[0]] === 'String') {
        value[fields[0]] = {};
        value[fields[0]][fields[0]] = 'String';
      }
      this.getJSON(fields.splice(1).join('.'), value[fields[0]]);
    } else {
      value[fields[0]] = 'String';
    }
    return value;
  }
}
