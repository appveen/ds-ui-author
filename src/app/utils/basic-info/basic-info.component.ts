import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'odp-basic-info',
  templateUrl: './basic-info.component.html',
  styleUrls: ['./basic-info.component.scss']
})
export class BasicInfoComponent implements OnInit {

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
  nameMessage: string;
  descMessage: string;

  constructor() {
    this.nameChange = new EventEmitter();
    this.descriptionChange = new EventEmitter();
    this.edit = {
      status: false
    };

  }

  ngOnInit() {
    if (!this.descCharLimit) {
      this.descCharLimit = 240;
    }
    if (!this.nameCharLimit) {
      this.nameCharLimit = 40;
    }
  }

  onNameChange(val) {
    this.nameMessage = null;
    if (val && val.length > this.nameCharLimit) {
      this.nameMessage = `Name cannot exceed ${this.nameCharLimit} characters. It will be truncated to ${this.nameCharLimit} characters`;
      setTimeout(() => {
        this.nameMessage = null;
      }, 3000);
      val = val.substr(0, this.nameCharLimit);
    }
    this.name = val;
    this.nameChange.emit(val);
  }

  onDescriptionChange(val: string) {
    this.descMessage = null;
    if (val && val.length > this.descCharLimit) {
      this.descMessage = `Description cannot exceed ${this.descCharLimit} characters. It will be truncated to ${this.descCharLimit} characters`;
      setTimeout(() => {
        this.descMessage = null;
      }, 3000);
      val = val.substr(0, this.descCharLimit);
    }
    this.description = val;
    this.descriptionChange.emit(val);
  }

}
