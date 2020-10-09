import { Component, OnInit, Input, HostListener } from '@angular/core';
import { Definition } from '../mapper.model';
import { MapperService } from '../mapper.service';

@Component({
  selector: 'odp-source-field',
  templateUrl: './source-field.component.html',
  styleUrls: ['./source-field.component.scss']
})
export class SourceFieldComponent implements OnInit {

  @Input() level: number;
  @Input() definition: Definition;
  @Input() first: boolean;
  @Input() last: boolean;
  left: number;
  top: number;
  constructor(private mapperService: MapperService) {
    const self = this;
    self.level = 0;
    self.definition = Definition.getInstance();
  }

  ngOnInit() {
    const self = this;
  }

  onMouseDown(event: MouseEvent) {
    const self = this;
    self.left = event.clientX;
    self.top = event.clientY;
    self.mapperService.selectedEle = self.definition;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const self = this;
    self.left = event.pageX;
    self.top = event.pageY;
    event.preventDefault();
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    const self = this;
    self.mapperService.selectedEle = null;
  }

  get depth() {
    const self = this;
    const arr = self.definition.path.split('.');
    arr.shift();
    return arr;
  }

  get ghostEleStyle() {
    const self = this;
    return {
      top: (self.top - 17) + 'px',
      left: (self.left - 100) + 'px'
    };
  }

  get showGhostEle() {
    const self = this;
    if (self.mapperService.selectedEle) {
      return true;
    }
    return false;
  }
}
