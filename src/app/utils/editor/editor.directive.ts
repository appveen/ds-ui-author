import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, EventEmitter, HostListener, Inject, Input, OnInit, Output } from '@angular/core';

@Directive({
  selector: '[odpEditor]'
})
export class EditorDirective implements OnInit {

  @Input() insertText: EventEmitter<string>;
  @Input() data: string;
  @Output() dataChange: EventEmitter<string>;
  element: HTMLElement;
  selectedObj: Selection;
  rangeObj: Range;
  constructor(private ele: ElementRef,
    @Inject(DOCUMENT) private document: Document) {
    this.insertText = new EventEmitter();
    this.dataChange = new EventEmitter();
    this.data = '';
    (this.ele.nativeElement as HTMLElement).setAttribute('contenteditable', 'true');
    (this.ele.nativeElement as HTMLElement).style.display = 'inline-block';
  }

  ngOnInit(): void {
    if (!this.data) {
      this.data = '';
    }
    this.element = (this.ele.nativeElement as HTMLElement);
    this.element.innerText = this.data;
    this.insertText.subscribe((text: string) => {
      if (this.selectedObj && this.rangeObj) {
        this.rangeObj.deleteContents();
        this.rangeObj.insertNode(this.document.createTextNode(text));
        this.selectedObj.addRange(this.rangeObj);
        this.data = this.element.innerText;
        this.dataChange.emit(this.data);
      }
    });
  }

  @HostListener('keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    this.ele.nativeElement.scrollTop = this.ele.nativeElement.scrollHeight;
    this.selectedObj = this.document.getSelection();
    this.rangeObj = this.selectedObj.getRangeAt(0);
    console.table([this.rangeObj])
    this.data = this.element.innerText;
    this.dataChange.emit(this.data);
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    this.selectedObj = this.document.getSelection();
    this.rangeObj = this.selectedObj.getRangeAt(0);
    console.table([this.rangeObj])
    this.data = this.element.innerText;
    this.dataChange.emit(this.data);
  }
}
