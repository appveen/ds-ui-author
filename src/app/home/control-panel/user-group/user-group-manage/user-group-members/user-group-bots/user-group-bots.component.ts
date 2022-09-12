import { Component, OnInit, Input, OnDestroy, EventEmitter } from '@angular/core';

import { CommonService } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { UserDetails } from 'src/app/utils/interfaces/userDetails';

@Component({
  selector: 'odp-user-group-bots',
  templateUrl: './user-group-bots.component.html',
  styleUrls: ['./user-group-bots.component.scss']
})
export class UserGroupBotsComponent implements OnInit, OnDestroy {

  @Input() users: Array<any>;

  subscriptions: any;
  userList: Array<any>;
  searchTerm: string;
  showLazyLoader: boolean;

  openSearch: EventEmitter<any>;
  ogUserList: any[];

  constructor(private commonService: CommonService,
    private appService: AppService) {
    this.subscriptions = {};
    this.userList = [];
    this.openSearch = new EventEmitter();
  }

  ngOnInit() {
    if (this.users) {
      this.userList = this.users.filter(e => e.bot);
      this.ogUserList = this.userList;
    }
  }

  ngOnDestroy() {
  }


  isThisUser(user: any) {
    return this.commonService.userDetails._id === user._id;
  }

  removeUsers(singleUser?: any) {
    const temp = this.appService.cloneObject(!!singleUser ? [singleUser] : this.selectedUsers);
    const tempUserList = this.appService.cloneObject(this.userList);
    temp.forEach(user => {
      let index = tempUserList.findIndex(u => u._id === user._id);
      if (index > -1) {
        tempUserList.splice(index, 1);
      }
      index = this.users.findIndex(u => u._id === user._id);
      if (index > -1) {
        this.users.splice(index, 1);
      }
    });
    this.userList = [...tempUserList];
  }

  hasPermission(type: string) {
    return this.commonService.hasPermission(type);
  }

  isAppAdmin(user: UserDetails) {
    if (user.accessControl
      && user.accessControl.apps
      && user.accessControl.apps.length > 0
      && user.accessControl.apps.find(e => e._id === this.commonService.app._id)) {
      return true;
    }
    return false;
  }

  openBotsModal() {
    this.openSearch.emit({
      type: 'bot'
    });
  }

  onSearchModalClose(data) {
    if (data && data.length > 0) {
      data.forEach(user => {
        const index = this.userList.findIndex(e => e._id == user._id);;
        if (index == -1) {
          const tempUsr = JSON.parse(JSON.stringify(user));
          this.userList.push(tempUsr);
          this.users.push(tempUsr);
        }
      });
    }
  }

  toggleCheck(event, user) {
    if (event) {
      this.userList.forEach(e => {
        if (e._id === user._id) {
          e._selected = event
        }
      })
    }
  }

  get selectedUsers() {
    return this.userList.filter(e => e._selected);
  }

  get checkAll() {
    return this.userList.every(e => e._selected);
  }

  set checkAll(val) {
    this.userList.forEach(e => {
      e._selected = val;
    });
  }

  search(event) {
    this.searchTerm = event
    if (event === '' || this.searchTerm === null) {
      this.userList = this.ogUserList
    }
    else {
      this.userList = this.ogUserList.filter(ele => {
        if (ele.basicDetails.name.toLowerCase().indexOf(this.searchTerm) >= 0) {
          return ele
        }
        else {
          if (ele._id.toLowerCase().indexOf(this.searchTerm) >= 0) {
            return ele
          }
        }
      })
    }
  }
}
