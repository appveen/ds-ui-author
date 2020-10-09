import { Component, AfterContentChecked, ElementRef } from '@angular/core';

@Component({
  selector: 'odp-radio-btn',
  templateUrl: './radio-btn.component.html',
  styleUrls: ['./radio-btn.component.scss']
})
export class RadioBtnComponent implements AfterContentChecked {

  checked: boolean;
  constructor(private element: ElementRef) {
    const self = this;
  }

  ngAfterContentChecked() {
    const self = this;
    const ele: HTMLElement = self.element.nativeElement;
    const input: HTMLInputElement = ele.children[0].querySelector('input') as HTMLInputElement;
    if (input && input.checked) {
      self.checked = true;
    } else {
      self.checked = false;
    }
  }

}
