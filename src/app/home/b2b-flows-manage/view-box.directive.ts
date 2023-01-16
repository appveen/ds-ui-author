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
    this.startX = 0;
    this.startY = 0;
    this.wrapper = this.ele.nativeElement.parentElement;
    this.move = new EventEmitter();
    this.moved = new EventEmitter();
  }

  ngAfterViewInit() {
    // this.move.subscribe(data => {
    //   this.startX = data.left;
    //   this.startY = data.top;
    //   this.left = 0;
    //   this.top = 0;
    //   this.svg.setAttribute('viewBox', `${this.startX} ${this.startY} ${this.wrapper.clientWidth} ${this.wrapper.clientHeight}`);
    // });
    this.svg = (this.ele.nativeElement as SVGElement);
    // this.svg.setAttribute('viewBox', `${this.startX} ${this.startY} ${this.wrapper.clientWidth} ${this.wrapper.clientHeight}`);
    this.drawGrid(this.wrapper.clientWidth, this.wrapper.clientHeight);


    // fromEvent(this.ele.nativeElement, 'mousedown').pipe(
    //   switchMap((start: MouseEvent) => {
    //     return fromEvent(document, 'mousemove').pipe(
    //       map((move: MouseEvent) => {
    //         move.preventDefault();
    //         return {
    //           left: start.clientX - move.clientX,
    //           top: start.clientY - move.clientY
    //         };
    //       }),
    //       takeUntil(fromEvent(document, 'mouseup').pipe(map(end => {
    //         this.startX = this.left;
    //         this.startY = this.top;
    //       })))
    //     );
    //   })
    // ).subscribe((ev: any) => {
    //   const x = this.startX + ev.left;
    //   const y = this.startY + ev.top;
    //   this.left = x > 0 ? x : 0;
    //   this.top = y > 0 ? y : 0;
    //   this.svg.setAttribute('viewBox', `${x > 0 ? x : 0} ${y > 0 ? y : 0} ${this.wrapper.clientWidth} ${this.wrapper.clientHeight}`);
    //   this.moved.emit({
    //     left: this.left,
    //     top: this.top
    //   });
    // });

  }

  drawGrid(windowWidth: number, windowHeight: number) {
    const colCount = (windowWidth * 3) / 20 + 1;
    const rowCount = (windowHeight * 3) / 20 + 1;
    const group: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGElement;
    group.setAttribute('id', 'grid');
    for (let i = 0; i < rowCount; i++) {
      for (let j = 0; j < colCount; j++) {
        const distX = 20 * (j) - windowWidth;
        const distY = 20 * (i + 1);
        const ele: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle') as SVGElement;
        ele.setAttribute('cx', `${distX}`);
        ele.setAttribute('cy', `${distY}`);
        ele.setAttribute('r', `1`);
        ele.setAttribute('fill', `rgba(0,0,0,0.2)`);
        group.appendChild(ele);
      }
    }
    (this.ele.nativeElement as SVGElement).prepend(group);
    // (this.ele.nativeElement as SVGElement).insertBefore(group, (this.ele.nativeElement as SVGElement).children[0]);
  }
}
