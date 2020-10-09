import { Directive, ElementRef, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { fromEvent } from 'rxjs';
import { switchMap, map, takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[odpViewBox]'
})
export class ViewBoxDirective implements AfterViewInit {

  @Input() move: EventEmitter<number>;
  @Output() moved: EventEmitter<number>;
  start: number;
  wrapper: HTMLElement;
  svg: SVGElement;
  left: number;
  constructor(private ele: ElementRef) {
    const self = this;
    self.start = 0;
    self.wrapper = self.ele.nativeElement.parentElement;
    self.move = new EventEmitter();
    self.moved = new EventEmitter();
  }

  ngAfterViewInit() {
    const self = this;
    self.move.subscribe(start => {
      self.start = start;
      self.left = 0;
      self.svg.setAttribute('viewBox', `${self.start} 0 ${self.wrapper.clientWidth} ${self.wrapper.clientHeight}`);
    });
    self.svg = (self.ele.nativeElement as SVGElement);
    self.svg.setAttribute('viewBox', `${self.start} 0 ${self.wrapper.clientWidth} ${self.wrapper.clientHeight}`);
    self.drawGrid(self.wrapper.clientWidth, self.wrapper.clientHeight);


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
            self.start = self.left;
          })))
        );
      })
    ).subscribe((ev: any) => {
      const x = self.start + ev.left;
      self.left = x > 0 ? x : 0;
      self.svg.setAttribute('viewBox', `${x > 0 ? x : 0} 0 ${self.wrapper.clientWidth} ${self.wrapper.clientHeight}`);
      self.moved.emit(self.left);
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
        ele.setAttribute('fill', `rgba(0,0,0,0.1)`);
        group.appendChild(ele);
      }
    }
    (self.ele.nativeElement as SVGElement).insertBefore(group, (self.ele.nativeElement as SVGElement).children[0]);
  }
}
