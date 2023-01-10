import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[odpPasswordField]'
})
export class PasswordFieldDirective implements OnInit {

  @Input() odpPasswordField: boolean;
  @Input() edit: any;

  constructor(private ele: ElementRef) {
    this.odpPasswordField = false;
    this.edit = { status: false };
  }

  ngOnInit(): void {
    if (this.odpPasswordField && this.ele && this.ele.nativeElement) {
      const temp: HTMLInputElement = this.ele.nativeElement as HTMLInputElement;
      const rect = temp.getBoundingClientRect();
      const rectParent = temp.parentElement.getBoundingClientRect();
      const eyeEle = document.createElement('span');
      eyeEle.style.top = `${(rect.y - rectParent.y) + 9}px`;
      eyeEle.style.right = `${(rect.x - rectParent.x) + 9}px`;
      eyeEle.style.zIndex = '2';
      eyeEle.classList.add('hover');
      eyeEle.classList.add('position-absolute');
      eyeEle.classList.add('text-accent');
      eyeEle.classList.add('dsi');
      eyeEle.classList.add('dsi-view');
      eyeEle.addEventListener('click', () => {
        if (!this.edit.status) {
          return;
        }
        if (eyeEle.classList.contains('dsi-view')) {
          temp.type = 'text';
          eyeEle.classList.remove('dsi-view');
          eyeEle.classList.add('dsi-hide');
        } else {
          temp.type = 'password';
          eyeEle.classList.remove('dsi-hide');
          eyeEle.classList.add('dsi-view');
        }
      });
      if (!temp.parentElement.classList.contains('position-relative')) {
        temp.parentElement.classList.add('position-relative');
      }
      temp.parentElement.appendChild(eyeEle);
    }
  }
}
