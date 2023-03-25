import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgbDropdown, NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'odp-multi-dropdown',
  templateUrl: './multi-dropdown.component.html',
  styleUrls: ['./multi-dropdown.component.scss'],
  providers: [NgbDropdownConfig, NgbDropdown]
})
export class MultiDropdownComponent implements OnInit {
  show: boolean = false;
  @Input() isOpen: boolean = false;
  @Input() data: any;
  @ViewChild(NgbDropdown) dropdown!: NgbDropdown;
  @Input() toggle: EventEmitter<any> = new EventEmitter<any>();
  @Output() onSelect: EventEmitter<any> = new EventEmitter<any>();
  activeItem: any;
  activeLevel: any;
  value: any;


  constructor(private elementRef: ElementRef) {
    this.show = false;
    // this.data = [
    //   {
    //     "name": "Home",
    //   },
    //   {
    //     "name": "About",
    //     "children": [
    //       {
    //         "name": "Company",
    //         "children": [
    //           {
    //             "name": "Overview",
    //             "children": null
    //           },
    //           {
    //             "name": "History",
    //             "children": null
    //           }
    //         ]
    //       },
    //       {
    //         "name": "Team",
    //         "children": [
    //           {
    //             "name": "Management",
    //             "children": null
    //           },
    //           {
    //             "name": "Development",
    //             "children": null
    //           }
    //         ]
    //       }
    //     ]
    //   },
    //   {
    //     "name": "Contact",
    //     "children": null
    //   }
    // ]


  }

  ngOnInit() {

    for (let obj of this.data) {
      this.addRef(obj, null);
    }
  }

  addRef(obj, parentName) {
    obj.ref = parentName ? parentName + "." + obj.name : obj.name;
    if (obj.children) {
      for (let child of obj.children) {
        this.addRef(child, obj.ref);
      }
    }
  }

  openMenu(event, item, level) {
    event.stopPropagation();




    if (!this.activeItem) {
      item.isOpen = !item.isOpen;
    }
    else {
      this.updateAll(this.data, false)
      this.manipulate(this.data, item.ref.split('.'), true)

    }

    console.log(this.data)
    this.activeLevel = level;
    this.activeItem = item;


  }


  manipulate(data, refArray, val) {
    let modifiedArray = refArray
    this.updateDataByRef(data, refArray[0], val)
    if (refArray.length > 1) {
      const firstTwo = refArray.slice(0, 2).join('.');
      modifiedArray = [firstTwo].concat(refArray.slice(2));

      this.manipulate(data, modifiedArray, val)
    }

  }

  updateDataByRef(array, refValue, val) {
    for (let i = 0; i < array.length; i++) {
      const obj = array[i];

      if (obj.ref === refValue) {
        obj.isOpen = val;
        return;
      }
      if (obj.children && obj.children.length > 0) {
        this.updateDataByRef(obj.children, refValue, val);
      }
    }
  }

  updateAll(array, val) {
    for (let i = 0; i < array.length; i++) {
      const obj = array[i];
      obj.isOpen = val;
      if (obj.children && obj.children.length > 0) {
        this.updateAll(obj.children, val);
      }
    }
  }


  itemClicked(event, item, level) {
    console.log(item.value)
    this.onSelect.emit(item);
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }



}


