import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppService } from '../../services/app.service';

@Component({
  selector: 'odp-custom-format-selector',
  templateUrl: './custom-format-selector.component.html',
  styleUrls: ['./custom-format-selector.component.scss']
})
export class CustomFormatSelectorComponent implements OnInit {

  @Input() edit: any;
  @Input() format: any;
  @Output() formatChange: EventEmitter<any>;

  definition: Array<any>;
  constructor(private appService: AppService) {
    this.definition = [];
    this.formatChange = new EventEmitter();
  }

  ngOnInit(): void {
    if (!this.format) {
      const id = this.appService.randomID(5);
      this.format = {
        _id: id,
        name: 'Custom_' + id
      }
    }
    if (this.format && this.format.definition) {
      this.definition = this.format.definition;
    }
    if (this.definition.length == 0) {
      this.definition.push({ type: 'String' });
    }
  }

  addField(index?: number) {
    if (index > -1) {
      this.definition.splice(index + 1, 0, { type: 'String' });
    } else {
      this.definition.push({ type: 'String' });
    }
  }

  deleteField(index: number) {
    this.definition.splice(index, 1);
  }

  setFieldName(val: any, def: any) {
    if (!def.properties) {
      def.properties = {};
    }
    def.properties.name = val;
  }

  clearSchema() {
    this.definition.splice(0);
  }

  onPaste(event: any, pasteIndex: number) {
    let val = event.clipboardData.getData('text/plain');
    try {
      const obj = JSON.parse(val);
      Object.keys(this.appService.flattenObject(obj)).forEach(key => {
        this.definition.push({ type: 'String', key: key, properties: { name: key } });
      });
    } catch (err) {
      let fields = val.split(/\n/).filter(e => {
        if (e && e.trim() && e.trim() !== ',') {
          return e;
        }
      }).map(e => e.trim());
      if (fields && fields.length < 2) {
        fields = val.split(/\t/).filter(e => {
          if (e && e.trim() && e.trim() !== ',') {
            return e;
          }
        }).map(e => e.trim());
      }
      if (fields && fields.length < 2) {
        fields = val.split(/,/).filter(e => {
          if (e && e.trim() && e.trim() !== ',') {
            return e;
          }
        }).map(e => e.trim());
      }
      fields.forEach(key => {
        this.definition.push({ type: 'String', key: key, properties: { name: key } });
      });
    }
    if (pasteIndex > -1) {
      this.deleteField(pasteIndex);
    }
  }

  createFormat() {
    this.format.definition = this.definition;
    this.formatChange.emit(this.format);
  }
}
