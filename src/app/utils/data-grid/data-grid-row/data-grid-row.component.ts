import { Component, OnInit, Input, ContentChildren, QueryList, AfterContentInit, AfterContentChecked, HostListener } from '@angular/core';
import { DataGridCellComponent } from '../data-grid-cell/data-grid-cell.component';

@Component({
  selector: 'odp-data-grid-row',
  templateUrl: './data-grid-row.component.html',
  styleUrls: ['./data-grid-row.component.scss']
})
export class DataGridRowComponent implements OnInit, AfterContentChecked {

  @Input() hideRow: boolean;
  @Input() widthList: Array<number>;
  @ContentChildren(DataGridCellComponent) gridCells: QueryList<DataGridCellComponent>;
  constructor() {
    const self = this;
    self.widthList = [];
  }

  ngOnInit() {
  }

  ngAfterContentChecked() {
    const self = this;
    self.gridCells.forEach((cell, index) => {
      cell.width = self.widthList[index];
      cell.selectedChange.subscribe(_val => {
        if (self.gridCells.first.checkbox) {
          self.gridCells.first.checkbox.checkedChange.emit(_val);
        }
      });
    });
  }

 
  get rowSelected() {
    const self = this;
    if (self.gridCells && self.gridCells.first && self.gridCells.first.checkbox) {
      return self.gridCells.first.checkbox.checked;
    }
    return false;
  }
}
