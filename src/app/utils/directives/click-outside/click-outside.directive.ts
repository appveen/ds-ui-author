import { Directive, Output, EventEmitter, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[odpClickOutside]'
})
export class ClickOutsideDirective {

  @Input() ignore: Array<string>;
  @Output() outside: EventEmitter<boolean>;
  @Output() inside: EventEmitter<boolean>;

  constructor(private element: ElementRef) {
    this.outside = new EventEmitter<boolean>();
    this.inside = new EventEmitter<boolean>();
  }

  @HostListener('document:click', ['$event'])
  onClick(event) {
    let nodeList: NodeListOf<HTMLElement>;
    if (this.ignore && this.ignore.length > 0) {
      if (this.ignore.indexOf('#' + event.target.id) > -1) {
        this.inside.emit(true);
        return;
      }
      if (this.ignore.filter(e => event.target.classList.contains(e.substr(1, e.length))).length > 0) {
        this.inside.emit(true);
        return;
      }
      const temp = this.ignore.filter(e => {
        nodeList = document.querySelectorAll(e);
        return this.targetInIgnore(nodeList, event.target);
      });
      if (temp && temp.length > 0) {
        this.inside.emit(true);
        return;
      }
    }
    if (event.target.classList.contains('ignore-outside')) {
      this.inside.emit(true);
      return;
    }
    nodeList = document.querySelectorAll('.ignore-outside');
    if (this.targetInIgnore(nodeList, event.target)) {
      this.inside.emit(true);
      return;
    }
    if (!this.element.nativeElement.contains(event.target)) {
      this.outside.emit(true);
    } else {
      this.inside.emit(true);
    }
  }
  private targetInIgnore(nodeList: NodeListOf<HTMLElement>, target: HTMLElement) {
    let flag = false;
    if (nodeList && nodeList.length > 0) {
      for (let i = 0; i < nodeList.length; i++) {
        const node = nodeList.item(i);
        if (node.contains(target)) {
          flag = true;
          break;
        }
      }
    }
    return flag;
  }

}
