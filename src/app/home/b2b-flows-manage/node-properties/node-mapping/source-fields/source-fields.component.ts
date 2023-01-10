import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'odp-source-fields',
  templateUrl: './source-fields.component.html',
  styleUrls: ['./source-fields.component.scss']
})
export class SourceFieldsComponent implements OnInit {

  @Input() definition: any;
  constructor() { }

  ngOnInit(): void {
  }

}
