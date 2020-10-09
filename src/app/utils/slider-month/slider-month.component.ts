import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { fromEvent } from 'rxjs';
import { switchMap, map, takeUntil, flatMap } from 'rxjs/operators';

@Component({
  selector: 'odp-slider-month',
  templateUrl: './slider-month.component.html',
  styleUrls: ['./slider-month.component.scss']
})
export class SliderMonthComponent implements OnInit {

  @Input() toggle: boolean;
  @Output() toggleChange: EventEmitter<boolean>;
  @Input() value: string;
  @Output() valueChange: EventEmitter<string>;
  oldVal: string;
  months: Array<{
    label?: string;
    value?: number;
  }>;
  searchTermFrom: string;
  searchTermTo: string;
  stepDistance: number;
  constructor() {
    const self = this;
    self.toggleChange = new EventEmitter();
    self.valueChange = new EventEmitter();
    self.months = [
      { label: 'January', value: 1 },
      { label: 'February', value: 2 },
      { label: 'March', value: 3 },
      { label: 'April', value: 4 },
      { label: 'May', value: 5 },
      { label: 'June', value: 6 },
      { label: 'July', value: 7 },
      { label: 'August', value: 8 },
      { label: 'September', value: 9 },
      { label: 'October', value: 10 },
      { label: 'November', value: 11 },
      { label: 'December', value: 12 }
    ];
    self.stepDistance = 226 / 11;
  }

  ngOnInit() {
    const self = this;
    if (!self.value || self.value === '*' || !self.value.match(/[0-9]{1,2}-[0-9]{1,2}/)) {
      self.value = '1-12';
    }
    self.oldVal = self.value;
    fromEvent(document.querySelector('.slider-nob.left'), 'mousedown').pipe(
      flatMap((start: MouseEvent) => {
        let oldX;
        let oldY;
        const startVal = this.fromVal;
        return fromEvent(document, 'mousemove').pipe(
          map((move: MouseEvent) => {
            if (!oldX) {
              oldX = move.clientX;
            }
            if (!oldY) {
              oldY = move.clientY;
            }
            const moveDetails = {
              startVal,
              startX: start.clientX,
              startY: start.clientY,
              moveX: move.clientX,
              moveY: move.clientY,
              directionX: move.clientX - oldX,
              directionY: move.clientY - oldY,
            };
            oldX = move.clientX;
            oldY = move.clientY;
            return moveDetails;
          }),
          takeUntil(fromEvent(document, 'mouseup'))
        );
      })
    ).subscribe(ev => {
      const val = Math.floor(((ev.moveX - ev.startX) / self.stepDistance)) + (ev.startVal - 1);
      if (val > 0 && val < self.toVal) {
        self.fromVal = val;
      }
    });
    fromEvent(document.querySelector('.slider-nob.right'), 'mousedown').pipe(
      flatMap((start: MouseEvent) => {
        let oldX;
        let oldY;
        const startVal = this.toVal;
        return fromEvent(document, 'mousemove').pipe(
          map((move: MouseEvent) => {
            if (!oldX) {
              oldX = move.clientX;
            }
            if (!oldY) {
              oldY = move.clientY;
            }
            const moveDetails = {
              startVal,
              startX: start.clientX,
              startY: start.clientY,
              moveX: move.clientX,
              moveY: move.clientY,
              directionX: move.clientX - oldX,
              directionY: move.clientY - oldY,
            };
            oldX = move.clientX;
            oldY = move.clientY;
            return moveDetails;
          }),
          takeUntil(fromEvent(document, 'mouseup'))
        );
      })
    ).subscribe(ev => {
      const val = Math.floor(((ev.moveX - ev.startX) / self.stepDistance)) + (ev.startVal - 1);
      if (val > self.fromVal && val < 13) {
        self.toVal = val;
      }
    });
  }

  done() {
    const self = this;
    self.toggle = false;
    self.valueChange.emit(self.value);
    self.toggleChange.emit(self.toggle);
  }

  reset() {
    const self = this;
    self.value = self.oldVal;
  }

  getSelected(type: string) {
    const self = this;
    try {
      if (type === 'to') {
        return self.months.find(e => e.value === self.toVal).label;
      } else {
        return self.months.find(e => e.value === self.fromVal).label;
      }
    } catch (e) {
      return null;
    }
  }

  get searchedValuesFrom() {
    const self = this;
    const temp = self.months.filter(e => e.value < self.toVal);
    if (self.searchTermFrom) {
      return temp.filter(e => e.label.toLowerCase().indexOf(self.searchTermFrom.toLowerCase()) > -1);
    }
    return temp;
  }

  get searchedValuesTo() {
    const self = this;
    const temp = self.months.filter(e => e.value > self.fromVal);
    if (self.searchTermTo) {
      return temp.filter(e => e.label.toLowerCase().indexOf(self.searchTermTo.toLowerCase()) > -1);
    }
    return temp;
  }


  get fromVal() {
    const self = this;
    return parseInt(self.value.split('-')[0], 10);
  }

  set fromVal(val) {
    const self = this;
    if (typeof val === 'string') {
      val = parseInt(val, 10);
    }
    if (val < 1) {
      val = 1;
    }
    if (val > 11) {
      val = 11;
    }
    const segment = self.value.split('-');
    segment.splice(0, 1, val + '');
    self.value = segment.join('-');
  }

  get toVal() {
    const self = this;
    return parseInt(self.value.split('-')[1], 10);
  }

  set toVal(val) {
    const self = this;
    if (typeof val === 'string') {
      val = parseInt(val, 10);
    }
    if (val < 2) {
      val = 2;
    }
    if (val > 12) {
      val = 12;
    }
    const segment = self.value.split('-');
    segment.splice(1, 1, val + '');
    self.value = segment.join('-');
  }

  get activeStyle() {
    const self = this;
    const len = self.value.split('-').map(e => parseInt(e, 10)).reduce((p, c) => c - p, 0);
    const fromVal = parseInt(self.value.split('-')[0], 10);
    const val = (self.stepDistance) * (fromVal - 1);
    const width = (self.stepDistance) * (len);
    return {
      width: `${width}px`,
      transform: `translateX(${val}px)`
    };
  }

  get leftNobStyle() {
    const self = this;
    const fromVal = parseInt(self.value.split('-')[0], 10);
    const val = (self.stepDistance) * (fromVal - 1);
    return {
      transform: `translateX(${val}px)`
    };
  }

  get rightNobStyle() {
    const self = this;
    const toVal = parseInt(self.value.split('-')[1], 10);
    const val = (self.stepDistance) * (toVal - 1) + 8;
    return {
      transform: `translateX(${val}px)`
    };
  }

  get marks() {
    const self = this;
    const arr = new Array(10);
    arr.fill(self.stepDistance);
    return arr.map((e, i) => e * (i + 1) + 8);
  }

}
