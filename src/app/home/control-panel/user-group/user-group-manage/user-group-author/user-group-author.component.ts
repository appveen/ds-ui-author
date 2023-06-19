import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-user-group-author',
  templateUrl: './user-group-author.component.html',
  styleUrls: ['./user-group-author.component.scss']
})
export class UserGroupAuthorComponent implements OnInit {

  @Input() roles: Array<any>;
  @Output() rolesChange: EventEmitter<Array<any>>;
  activeSubTab: number;
  constructor(private commonService: CommonService) {
    const self = this;
    self.activeSubTab = 0;
    self.rolesChange = new EventEmitter();
  }

  ngOnInit() {
    const self = this;
    if (self.hasPermission('PVGADS') || self.hasPermission('PMGADS')) {
      self.activeSubTab = 0;
    } else if (self.hasPermission('PVGAL') || self.hasPermission('PMGAL')) {
      self.activeSubTab = 1;
    } else if (self.hasPermission('PVGAF') || self.hasPermission('PMGAF')) {
      self.activeSubTab = 2;
    } else if (self.hasPermission('PVGACON') || self.hasPermission('PMGACON')) {
      self.activeSubTab = 3;
    } else if (self.hasPermission('PVGADF') || self.hasPermission('PMGADF')) {
      self.activeSubTab = 4;
    } else if (self.hasPermission('PVGANS') || self.hasPermission('PMGANS')) {
      self.activeSubTab = 5;
    } else if (self.hasPermission('PVGAA') || self.hasPermission('PMGAA')) {
      self.activeSubTab = 6;
    } else if (self.hasPermission('PVGABM') || self.hasPermission('PMGABM')) {
      self.activeSubTab = 7;
    } else if (self.hasPermission('PVGAU') || self.hasPermission('PMGAU')) {
      self.activeSubTab = 8;
    } else if (self.hasPermission('PVGAB') || self.hasPermission('PMGAB')) {
      self.activeSubTab = 9;
    } else if (self.hasPermission('PVGAG') || self.hasPermission('PMGAG')) {
      self.activeSubTab = 10;
    } else if (self.hasPermission('PVGIF') || self.hasPermission('PMGIF')) {
      self.activeSubTab = 11;
    } else if (self.hasPermission('PVGPF') || self.hasPermission('PMGPF')) {
      self.activeSubTab = 12;
    } else if (self.hasPermission('PVGPFN') || self.hasPermission('PMGPFN')) {
      self.activeSubTab = 13;
    }
  }

  onChange(value) {
    const self = this;
    self.rolesChange.emit(value);
  }

  hasPermission(type: string) {
    const self = this;
    return self.commonService.hasPermission(type);
  }

  get authType() {
    const self = this;
    if (self.commonService.userDetails.auth && self.commonService.userDetails.auth.authType) {
      return self.commonService.userDetails.auth.authType;
    }
    return 'local';
  }
}
