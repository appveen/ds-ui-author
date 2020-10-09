import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  HostListener,
  Renderer2,
  AfterViewInit,
  ElementRef,
  AfterContentChecked
} from '@angular/core';

@Component({
  selector: 'odp-data-grid-header',
  templateUrl: './data-grid-header.component.html',
  styleUrls: ['./data-grid-header.component.scss']
})
export class DataGridHeaderComponent implements OnInit, AfterViewInit, AfterContentChecked {

  @Input() index: number;
  @Input() key: string;
  @Input() hideOptions: boolean;
  @Input() widthInPercent: boolean;
  @Input() width: number;
  @Output() widthChange: EventEmitter<number>;
  @Output() clicked: EventEmitter<any>;
  sortType: string;
  private isMouseDown: boolean;
  private resizeX: number;
  private startWidth: number;
  private clientWidth: number;
  constructor(private element: ElementRef,
    private renderer: Renderer2) {
    const self = this;
     self.width = 100;
    self.widthChange = new EventEmitter();
    self.clicked = new EventEmitter();
  }

  ngOnInit() {
    const self = this;
    self.renderer.listen('body', 'mouseup', (event) => {
      self.startWidth = parseFloat(self.startWidth + '') + (event.pageX - self.resizeX);
      self.isMouseDown = false;
      self.resizeX = null;
    });
    self.startWidth = parseInt(self.width + '', 10) || 200;
  }

  ngAfterViewInit() {
    const self = this;
    self.clientWidth = parseFloat(self.element.nativeElement.parentElement.parentElement.clientWidth);
    if (self.widthInPercent && self.clientWidth && self.width) {
      self.width = parseFloat(((parseFloat(self.clientWidth + '') * parseFloat(self.width + '')) / 100) + '');
      self.widthChange.emit(self.width);
    }
  }

  ngAfterContentChecked() {
    const self = this;
    
    if (self.noWidth) {
      self.element.nativeElement.classList.add('w-100');
    } else {
      self.element.nativeElement.classList.remove('w-100');
    }
  }

  onMouseDown(event: MouseEvent) {
    const self = this;
    self.isMouseDown = true;
    self.resizeX = event.pageX;
  }

  @HostListener('click', ['$event'])
  headerClicked(event: MouseEvent) {
    const self = this;
    if (self.key) {
      if (!self.sortType) {
        self.sortType = 'asc';
      } else if (self.sortType === 'asc') {
        self.sortType = 'desc';
      } else {
        self.sortType = null;
      }
    }
    self.clicked.emit({ key: self.key, sortType: self.sortType });
  }

  @HostListener('mousemove', ['$event'])
  resizeColumn(event: MouseEvent) {
    const self = this;
    if (self.isMouseDown) {
      if (isNaN(self.startWidth)) {
        self.startWidth = parseInt('200', 10);
      }
      const width: number = parseFloat(self.startWidth + '') + (event.pageX - self.resizeX);
      self.width = width;
      self.widthChange.emit(width);
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
