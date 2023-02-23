import { Component, ElementRef, EventEmitter, Input, OnInit, ViewChild, ViewEncapsulation, } from '@angular/core';


@Component({
  selector: 'odp-styled-text',
  templateUrl: './styled-text.component.html',
  styleUrls: ['styled-text.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StyledTextComponent implements OnInit {
  regex: RegExp = /\${{([^}]*)}}/g;
  @Input() cssClass: string;
  @Input() cssStyle: string;
  @Input() onDblClick: EventEmitter<any> = new EventEmitter();
  unformattedText: string = '';
  formattedText: string = '';
  @ViewChild('contentDiv') contentDiv: ElementRef;
  @ViewChild('hiddenDiv') hiddenDiv: ElementRef;
  constructor() { }

  ngOnInit() {
    this.formatText();

  }

  someTrigger(event) {
    // console.log(event.target.innerText)
    this.unformattedText = event.target.innerText;
    this.formatText();
  }


  formatText() {
    if (this.unformattedText) {
      const pattern = new RegExp(this.regex, 'g');
      this.formattedText = this.unformattedText.replace(this.regex, `<span class="d-flex align-items-center text-primary">$&</span>`);
    } else {
      this.formattedText = '';
    }
  }

  check() {
    console.log('yes')
  }

}

