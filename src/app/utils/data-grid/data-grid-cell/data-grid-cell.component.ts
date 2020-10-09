import { Component, OnInit, Input, Output, EventEmitter, ContentChild, HostListener, ElementRef, AfterContentChecked } from '@angular/core';
import { RoundCheckComponent } from '../../round-check/round-check.component';

@Component({
  selector: 'odp-data-grid-cell',
  templateUrl: './data-grid-cell.component.html',
  styleUrls: ['./data-grid-cell.component.scss']
})
export class DataGridCellComponent implements OnInit, AfterContentChecked {

  @Input() selectOnClick: boolean;
  @Input() width: number;
  @Output() widthChange: EventEmitter<number>;
  @Input() selected: boolean;
  @Output() selectedChange: EventEmitter<boolean>;
  @ContentChild(RoundCheckComponent, { static: false }) checkbox: RoundCheckComponent;
  constructor(private element: ElementRef) {
    const self = this;
    // self.width = 100;
    self.widthChange = new EventEmitter();
    self.selectedChange = new EventEmitter();
  }

  ngOnInit() {

  }

  ngAfterContentChecked() {
    const self = this;
    if (self.noWidth) {
      self.element.nativeElement.classList.add('w-100');
    } else {
      self.element.nativeElement.classList.remove('w-100');
    }
  }

  @HostListener('click', ['$event'])
  toggleRowSelect(event: Event) {
    const self = this;
    if (self.selectOnClick) {
      const target: HTMLElement = <HTMLElement>event.target;
      self.selected = !self.selected;
      self.selectedChange.emit(self.selected);
    }
  }

  get style() {
    const self = this;
    return {
      'min-width': self.width + 'px',
      'max-width': self.width + 'px'
    };
  }

  get noWidth() {
    const self = this;
    if (!self.width || isNaN(self.width)) {
      return true;
    }
    return false;
  }

}
