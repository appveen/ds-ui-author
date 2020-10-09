import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'odp-basic-info',
  templateUrl: './basic-info.component.html',
  styleUrls: ['./basic-info.component.scss'],
  animations: [
    trigger('moveFields', [
      state('closed', style({ transform: 'translateY(0px)' })),
      state('opened', style({ transform: 'translateY(85px)' })),
      transition('closed<=>opened', [
        animate('0.25s')
      ])
    ]),
    trigger('toggleWindow', [
      state('hidden', style({
        opacity: '0',
        'min-height': '0px',
        'max-height': '0px'
      })),
      state('visible', style({
        opacity: '1',
        'min-height': '240px',
        'max-height': 'unset'
      })),
      transition('void<=>*', [
        animate('0.25s')
      ])
    ])
  ]
})
export class BasicInfoComponent implements OnInit {

  @ViewChild('logoInput', { static: false }) logoInput: ElementRef;
  @ViewChild('thumbnail', { static: false }) thumbnail: ElementRef;
  @Input() holderStyle: string;
  @Input() logo: string;
  @Output() logoChange: EventEmitter<string>;
  @Input() name: string;
  @Output() nameChange: EventEmitter<string>;
  @Input() description: string;
  @Output() descriptionChange: EventEmitter<string>;
  @Input() edit: any;
  @Input() hideLogo: boolean;
  @Input() nameCharLimit: number;
  @Input() descCharLimit: number;
  @Input() pattern;
  toggleEdit: boolean;
  message: string;
  constructor() {
    const self = this;
    self.logoChange = new EventEmitter();
    self.nameChange = new EventEmitter();
    self.descriptionChange = new EventEmitter();
    self.holderStyle = 'circle';
    self.edit = {
      status: false
    };
    
  }

  ngOnInit() {
    const self = this;
    if (!self.descCharLimit) {
      self.descCharLimit = 240;
    }
    if (!self.nameCharLimit) {
      self.nameCharLimit = 40;
    }
  }
  nameChanges(val) {
    const self = this;
    if (val && val.length > self.nameCharLimit) {
      self.message = `Name truncated to ${self.nameCharLimit} characters`;
    }
  }

  discriptionChanges(val) {
    const self = this;
    if (val && val.length > 240) {
      self.message = 'Description truncated to 240 characters';
    }
  }
  onNameChange(val: string) {
    const self = this;
    self.message = null;
    if (val && val.length > self.nameCharLimit) {
      self.message = `Name truncated to ${self.nameCharLimit} characters`;
      setTimeout(() => {
        self.message = null;
      }, 3000);
      val = val.substr(0, self.nameCharLimit);
    }
    self.name = val;
    self.nameChange.emit(val);
  }

  onDescriptionChange(val: string) {
    const self = this;
    self.message = null;
    if (val && val.length > self.descCharLimit) {
      self.message = 'Description truncated to 240 characters';
      setTimeout(() => {
        self.message = null;
      }, 3000);
      val = val.substr(0, self.descCharLimit);
    }
    self.description = val;
    self.descriptionChange.emit(val);
  }

  changeLogo(data: { message?: string, image?: string }) {
    if (data.message) {
      this.message = data.message;
      return;
    }
    this.logo = data.image;
    this.logoChange.emit(data.image);
  }

  removeLogo() {
    const self = this;
    self.logo = null;
    self.logoChange.emit(null);
    self.logoInput.nativeElement.value = null;
  }

  get logoAsBackground() {
    const self = this;
    if (self.logo) {
      return {
        'background-image': `url('${self.logo}')`,
        'background-position': 'center',
        'background-size': 'contain',
        'background-repeat': 'no-repeat'
      };
    } else {
      return null;
    }
  }

  get initials() {
    const self = this;
    if (self.name && self.name.trim()) {
      const parts = self.name.trim().split(' ');
      if (parts.length > 1) {
        return parts[0][0] + parts[1][0];
      } else {
        return parts[0][0] + parts[0][0];
      }
    }
    return 'UN';
  }

  get style() {
    const self = this;
    const temp: HTMLElement = self.thumbnail.nativeElement;
    return {
      top: (temp.offsetTop - 16) + 'px',
      left: (temp.offsetLeft - 16) + 'px'
    };
  }
}
