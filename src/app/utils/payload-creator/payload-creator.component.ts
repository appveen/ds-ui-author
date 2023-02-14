import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'odp-payload-creator',
  templateUrl: './payload-creator.component.html',
  styleUrls: ['./payload-creator.component.scss']
})
export class PayloadCreatorComponent implements OnInit {

  @Input() data: any;
  @Output() dataChange: EventEmitter<any>;
  globalType: string;
  triggerAddChild: EventEmitter<any>;
  constructor() {
    this.dataChange = new EventEmitter();
    this.globalType = 'object';
    this.triggerAddChild = new EventEmitter();
    this.data = {};
  }

  ngOnInit(): void {
    if (!this.data) {
      this.data = {};
    }
  }

  // onPaste(event: ClipboardEvent) {
  //   let text: string = event.clipboardData?.getData('text') as string;
  //   try {
  //     const obj = JSON.parse(text);
  //     this.data = obj;
  //     this.fields = [];
  //     this.init();
  //   } catch (err) {
  //     this.fields = [];
  //     text.split('\n').map((e: string) => {
  //       this.fields.push(new Field({ key: e, type: 'string' }));
  //     });
  //   }
  // }

  onDataChange(data: any) {
    console.log('onDataChange', data);
  }

  addFromRoot() {
    this.triggerAddChild.emit();
  }

  get globalValue() {
    if (this.data) {
      return Object.keys(this.data).length + ' Items';
    }
    return '0 Items'
  }
}

export class Field {
  key: string;
  type: string;
  value: string | number | boolean | null;
  data: any;

  constructor(data?: any) {
    if (data) {
      this.key = data.key;
      this.type = data.type;
      this.value = data.value;
    } else {
      this.key = '';
      this.type = 'string';
      this.value = null;
    }
  }
}
