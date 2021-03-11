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
  // depth: Array<boolean>;
  constructor(private mapperService: MapperService) {
    this.level = 0;
    this.definition = new Definition();
    // this.depth = [];
  }

  ngOnInit() {
    // if (this.definition && this.definition.properties && this.definition.properties.dataPath) {
    //   this.depth = new Array(this.definition.properties.dataPath.split('.').length - 1);
    //   this.depth.fill(true);
    // }
  }
}
