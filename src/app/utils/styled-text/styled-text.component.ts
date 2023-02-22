import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation, } from '@angular/core';

@Component({
  selector: 'odp-styled-text',
  template: `
    <div #editableDiv id="editableDiv" class="value-holder" contentEditable="true" (input)="onInput($event)" ></div>
    <div [innerHTML]="formattedText"></div>
  `,
  styles: [`
  .value-holder {
    width: 260px;
    border: 0px;
    border-left: 1px solid #ddd;
    height: 100%;
}
  `],
  encapsulation: ViewEncapsulation.None
})
export class StyledTextComponent implements OnInit {
  regex: RegExp = /\${{([^}]*)}}/g;
  @Input() cssClass: string;
  @Input() cssStyle: string;
  unformattedText: string = '';
  formattedText: string = '';

  @ViewChild('editableDiv', { static: true }) editableDiv: ElementRef;
  constructor() { }

  ngOnInit() {
    this.formatText();
  }


  moveCursorToEnd() {
    var el = document.getElementById('editableDiv') as any
    el.focus()
    if (typeof el.selectionStart == "number") {
      el.selectionStart = el.selectionEnd = el.value.length;
    } else if (typeof el.createTextRange != "undefined") {
      var range = el.createTextRange();
      range.collapse(false);
      range.select();
    }
  }

  onInput(event: InputEvent) {
    this.unformattedText = this.editableDiv.nativeElement.innerText;
    this.formatText();
    this.moveCursorToEnd();

  }


  formatText() {
    if (this.editableDiv.nativeElement.innerHTML) {
      const matches = this.editableDiv.nativeElement.innerHTML.match(this.regex) || [];

      this.formattedText = this.unformattedText.replace(this.regex, `<span class="fw-500 rounded bg-light p-2 mx-1 border font-12 d-flex align-items-center">$&</span>`);
      // this.unformattedText = this.formattedText.replace(/<\/?span[^>]*>/g, '');

      this.editableDiv.nativeElement.innerHTML = this.formattedText;
    } else {
      this.formattedText = '';
      this.unformattedText = '';
    }
  }
  // formatText() {

  //   if (this.unformattedText) {
  //     const pattern = new RegExp(this.regex, 'g');
  //     const matches = this.unformattedText.match(pattern);
  //     if (matches) {
  //       this.formattedText = this.unformattedText.replace(pattern, `<span class="fw-500 rounded bg-light p-2 mx-1 border font-12 d-flex align-items-center">$&</span>`);
  //       this.editableDiv.nativeElement.innerHTML = this.formattedText;
  //     }

  //   } else {
  //     this.formattedText = '';
  //   }
  // }

}

