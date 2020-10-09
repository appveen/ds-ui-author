import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'odp-partner-configuration',
  templateUrl: './partner-configuration.component.html',
  styleUrls: ['./partner-configuration.component.scss']
})
export class PartnerConfigurationComponent implements OnInit {
  @Input() edit: any;

  constructor() { }

  ngOnInit() {
  }

}
