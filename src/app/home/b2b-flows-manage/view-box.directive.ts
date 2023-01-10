import { Directive, ElementRef, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { fromEvent } from 'rxjs';
import { switchMap, map, takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[odpViewBox]'
})
export class ViewBoxDirective implements AfterViewInit {

  @Input() move: EventEmitter<{ left: number, top: number }>;
  @Output() moved: EventEmitter<{ left: number, top: number }>;
  wrapper: HTMLElement;
  svg: SVGElement;
  startX: number;
  left: number;
  startY: number;
  top: number;
  constructor(private ele: ElementRef) {
    const self = this;
    self.startX = 0;
    self.startY = 0;
    self.wrapper = self.ele.nativeElement.parentElement;
    self.move = new EventEmitter();
    self.moved = new EventEmitter();
  }

  ngAfterViewInit() {
    const self = this;
    self.move.subscribe(data => {
      self.startX = data.left;
      self.startY = data.top;
      self.left = 0;
      this.top = 0;
      self.svg.setAttribute('viewBox', `${self.startX} ${self.startY} ${self.wrapper.clientWidth} ${self.wrapper.clientHeight}`);
    });
    self.svg = (self.ele.nativeElement as SVGElement);
    self.svg.setAttribute('viewBox', `${self.startX} ${self.startY} ${self.wrapper.clientWidth} ${self.wrapper.clientHeight}`);
    // self.drawGrid(self.wrapper.clientWidth, self.wrapper.clientHeight);


    fromEvent(self.ele.nativeElement, 'mousedown').pipe(
      switchMap((start: MouseEvent) => {
        return fromEvent(document, 'mousemove').pipe(
          map((move: MouseEvent) => {
            move.preventDefault();
            return {
              left: start.clientX - move.clientX,
              top: start.clientY - move.clientY
            };
          }),
          takeUntil(fromEvent(document, 'mouseup').pipe(map(end => {
            self.startX = self.left;
            self.startY = self.top;
          })))
        );
      })
    ).subscribe((ev: any) => {
      const x = self.startX + ev.left;
      const y = self.startY + ev.top;
      self.left = x > 0 ? x : 0;
      self.top = y > 0 ? y : 0;
      self.svg.setAttribute('viewBox', `${x > 0 ? x : 0} ${y > 0 ? y : 0} ${self.wrapper.clientWidth} ${self.wrapper.clientHeight}`);
      self.moved.emit({
        left: self.left,
        top: self.top
      });
    });

  }

  drawGrid(windowWidth: number, windowHeight: number) {
    const self = this;
    const colCount = (windowWidth * 10) / 32 + 1;
    const rowCount = windowHeight / 32 + 1;
    const group: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGElement;
    group.setAttribute('id', 'grid');
    for (let i = 0; i < rowCount; i++) {
      for (let j = 0; j < colCount; j++) {
        const distX = 32 * (j) - windowWidth;
        const distY = 32 * (i);
        const ele: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle') as SVGElement;
        ele.setAttribute('cx', `${distX}`);
        ele.setAttribute('cy', `${distY}`);
        ele.setAttribute('r', `1`);
        ele.setAttribute('fill', `rgba(0,0,0,0.2)`);
        group.appendChild(ele);
      }
    }
    (self.ele.nativeElement as SVGElement).insertBefore(group, (self.ele.nativeElement as SVGElement).children[0]);
  }
}
