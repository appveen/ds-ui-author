import { Component, OnInit, ViewChild, TemplateRef, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';

import { APIConfig } from 'src/app/utils/interfaces/apiConfig';
import { CommonService } from 'src/app/utils/services/common.service';


@Component({
  selector: 'odp-user-group-members-search',
  templateUrl: './user-group-members-search.component.html',
  styleUrls: ['./user-group-members-search.component.scss']
})
export class UserGroupMembersSearchComponent implements OnInit, OnDestroy {

  @Input() open: EventEmitter<any>;
  // tslint:disable-next-line:no-output-native
  @Output() close: EventEmitter<any>;
  @ViewChild('searchModal', { static: false }) searchModal: TemplateRef<HTMLElement>;
  searchModalRef: NgbModalRef;
  data: any;

  userList: Array<any>;
  selectedUsers: Array<any>;
  apiConfig: APIConfig;
  showLoader: boolean;

  constructor(private commonService: CommonService) {
    this.open = new EventEmitter();
    this.close = new EventEmitter();
    this.data = {};
    this.userList = [];
    this.selectedUsers = [];
    this.apiConfig = {
      count: 10,
      select: 'username, basicDetails, _id, bot',
      page: 1,
      sort: 'basicDetails.name',
      filter: {},
      noApp: true
    }
    this.showLoader = false;
  }

  ngOnInit() {
    this.open.subscribe(data => {
      this.data = data;
      if (this.data.type == 'bots' || this.data.type == 'bot') {
        this.apiConfig.filter = { bot: true };
      } else {
        this.apiConfig.filter = { bot: false };
      }
      this.getUsers();
      if (this.searchModalRef) {
        this.searchModalRef.close();
      }
      this.searchModalRef = this.commonService
        .modal(this.searchModal, { centered: true, windowClass: '.search-user-modal', size: 'xl' });
      this.searchModalRef.result.then(close => {
        this.searchModalRef = null;
        if (close && this.selectedUsers && this.selectedUsers.length > 0) {
          this.close.emit(JSON.parse(JSON.stringify(this.selectedUsers)));
        } else {
          this.close.emit(null);
        }
        this.selectedUsers.splice(0);
      }, dismiss => {
        this.searchModalRef = null;
        this.close.emit(null);
        this.selectedUsers.splice(0);
      });
    });
  }

  ngOnDestroy() {
    if (this.searchModalRef) {
      this.searchModalRef.close(false);
    }
  }

  getUsers() {
    this.showLoader = true;
    this.commonService.get('user', `/${this.commonService.app._id}/${this.data.type}`, this.apiConfig).subscribe(res => {
      this.showLoader = false;
      this.userList = res;
    }, err => {
      this.showLoader = false;
      this.commonService.errorToast(err);
    });
  }

  onSearch(searchTerm) {
    this.apiConfig.filter = { $or: [{ '_id': `/${searchTerm}/` }, { 'basicDetails.name': `/${searchTerm}/` }] };
    this.getUsers();
  }

  onSearchReset() {
    this.apiConfig.filter = {};
    this.getUsers();
  }

  toggleUser(flag, user) {
    if (flag) {
      this.selectUser(user);
    } else {
      const index = this.selectedUsers.findIndex(e => e._id === user._id);
      if (index > -1) {
        this.removeSelectedUser(index);
      }
    }
  }

  selectUser(user: any) {
    this.selectedUsers.push(JSON.parse(JSON.stringify(user)));
  }

  isUserSelected(user: any) {
    return this.selectedUsers.findIndex(e => e._id === user._id) > -1;
  }

  removeSelectedUser(index: number) {
    this.selectedUsers.splice(index, 1);
  }

  get selectAll() {
    if (this.userList.length == 0) {
      return false;
    }
    const searchedUsers = this.userList.map(e => e._id);
    const matchedUsers = _.intersection(this.selectedUsers.map(e => e._id), searchedUsers);
    return searchedUsers.length === matchedUsers.length;
  }

  set selectAll(val: boolean) {
    this.userList.forEach(user => {
      const index = this.selectedUsers.findIndex(e => e._id === user._id);
      if (val && index == -1) {
        this.selectUser(user);
      }
      if (!val && index > -1) {
        this.removeSelectedUser(index);
      }
    });
  }
}
