import { Component, Input, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'odp-source-fields',
  templateUrl: './source-fields.component.html',
  styleUrls: ['./source-fields.component.scss']
})
export class SourceFieldsComponent implements OnInit {

  @Input() edit: any;
  @Input() definition: any;
  constructor() {
    this.edit = { status: false };
  }

  ngOnInit(): void {
    if (!environment.production) {
      console.log(this.definition);
    }
  }

}
