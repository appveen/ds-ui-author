import { Component, OnInit, EventEmitter } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { DataGridColumn } from 'src/app/utils/data-grid/data-grid.directive';
import { AppService } from 'src/app/utils/services/app.service';

@Component({
  selector: 'odp-bookmarks',
  templateUrl: './bookmarks.component.html',
  styleUrls: ['./bookmarks.component.scss'],
  animations: [
    trigger('slideIn', [
      state('void', style({
        // top: '116px',
        right: '0'
      })),
      transition('void => *', [
        animate('400ms ease-in', keyframes([
          style({
            opacity: 0,
            transform: 'translateX(80px)'
          }),
          style({
            opacity: 1,
            transform: 'translateX(0px)'
          })
        ]))
      ]),
      transition('* => void', [
        animate('600ms ease-out', keyframes([
          style({
            opacity: .7,
            transform: 'translateX(80px)'
          }),
          style({
            opacity: .5,
            transform: 'translateX(100px)'
          }),
          style({
            opacity: 0
          })
        ]))
      ])
    ])
  ]
})
export class BookmarksComponent implements OnInit {
  showLazyLoader: boolean;
  subscriptions: any;
  showManageBookmark: boolean;
  selectedBookmark: any;
  breadcrumbPaths: string;
  alertModalRef: NgbModalRef;
  alertModal: {
    statusChange?: boolean;
    title: string;
    message: string;
    _id: string;
  };
  openDeleteModal: EventEmitter<any>;
  openBulkDeleteModal: EventEmitter<any>;
  userList: Array<any>;
  bookmarkConfig: GetOptions;
  bookmarkList: Array<any>;
  totalRecords: number;
  currentPage: number;
  tableColumns: Array<DataGridColumn>;
  constructor(
    private commonService: CommonService,
    private appService: AppService,
    private ts: ToastrService
  ) {
    const self = this;
    self.showLazyLoader = true;
    self.bookmarkConfig = {};
    self.bookmarkConfig.count = 30;
    self.bookmarkConfig.page = 1;
    self.bookmarkConfig.filter = {};
    self.showManageBookmark = false;
    self.openDeleteModal = new EventEmitter();
    self.openBulkDeleteModal = new EventEmitter();
    self.alertModal = {
      statusChange: false,
      title: '',
      message: '',
      _id: null
    };
    self.userList = [];
    self.bookmarkList = [];
    self.subscriptions = {};
    self.totalRecords = 0;
    self.currentPage = 1;
    self.tableColumns = [];
  }

  ngOnInit() {
    const self = this;
    self.tableColumns.push({
      label: '#',
      dataKey: '_checkbox',
      width: 50,
      show: true
    });
    self.tableColumns.push({
      label: 'Bookmark name',
      dataKey: 'name',
      width: 160,
      show: true
    });
    self.tableColumns.push({
      label: 'URL',
      dataKey: 'url',
      width: 400,
      show: true
    });
    self.tableColumns.push({
      label: 'Created By',
      dataKey: 'createdBy',
      width: 140,
      show: true
    });
    self.tableColumns.push({
      label: 'Created On',
      dataKey: '_metadata.createdAt',
      width: 130,
      show: true
    });
    self.tableColumns.push({
      label: 'Action',
      dataKey: '_options',
      show: true
    });
    self.loadMore(self.bookmarkConfig);
  }


  getBookmarkCount() {
    const self = this;
    self.showLazyLoader = true;
    const options: GetOptions = {
      filter: self.bookmarkConfig.filter,
      noApp: true
    };
    const path = '/app/' + self.commonService.app._id + '/bookmark/count';
    self.subscriptions['getBookmarkList'] = self.commonService.get('user', path, options)
      .subscribe((res) => {
        self.totalRecords = res;
      }, (err) => {
        self.commonService.errorToast(err);
      });
  }

  getBookmarkList() {
    const self = this;
    const path = '/app/' + self.commonService.app._id + '/bookmark';
    self.subscriptions['getBookmarkList'] = self.commonService.get('user', path, self.bookmarkConfig)
      .subscribe((res) => {
        self.showLazyLoader = false;
        self.bookmarkList = res;
        self.userList = this.bookmarkList.map(item => item.createdBy).filter((value, index, self1) => self1.indexOf(value) === index);
        if (self.userList.length) {
          self.getMembers();
        }
      }, (err) => {
        self.showLazyLoader = false;
        self.commonService.errorToast(err);
      });
  }

  loadMore(config: any) {
    const self = this;
    self.bookmarkConfig = config;
    self.bookmarkList = [];
    self.getBookmarkList();
    self.getBookmarkCount();
  }

  manageBookmark(event, index) {
    event.stopPropagation();
    const self = this;
    if (self.hasPermission('PMBM')) {
      self.showManageBookmark = true;
      self.selectedBookmark = self.bookmarkList[index];
    }
  }
  createNewBookmark() {
    const self = this;
    self.showManageBookmark = true;
    self.selectedBookmark = {};
  }
  deleteBookbark(bookmark) {
    const self = this;
    self.alertModal.statusChange = false;
    self.alertModal.title = 'Delete Bookmark';
    self.alertModal.message = 'Are you sure you want to delete <span class="text-delete font-weight-bold">'
      + bookmark.name + '</span> Bookmark?';
    self.alertModal._id = bookmark._id;
    self.openDeleteModal.emit(self.alertModal);

  }
  closeDeleteModal(event) {
    const self = this;
    const path = '/app/' + self.commonService.app._id + '/bookmark';
    if (event) {
      self.subscriptions['deleteBookmark'] = self.commonService.delete('user', path + '/' + event._id)
        .subscribe((res) => {
          self.showLazyLoader = false;
          self.getBookmarkList();
          self.getBookmarkCount();
          self.ts.success('Bookmark Deleted successfully');

        }, (err) => {
          self.commonService.errorToast(err);
        });
    }
  }
  closeBulkDeleteModal(event) {
    const self = this;
    const ids = self.bookmarkList.filter(e => e.checked).map(e => e._id);
    const path = '/app/' + self.commonService.app._id + '/bookmark';
    if (event) {
      self.subscriptions['bulkDeleteBookmark'] = self.commonService.delete('user', path + '/bulkDelete?id=' + ids.join(','))
        .subscribe((res) => {
          self.showLazyLoader = false;
          self.getBookmarkList();
          self.getBookmarkCount();
          self.ts.success('Bookmarks Deleted successfully');

        }, (err) => {
          self.commonService.errorToast(err);
        });
    }
  }
  bulkDelete() {
    const self = this;
    self.alertModal.title = 'Delete Bookmark';
    self.alertModal.message = 'Are you sure you want to delete all the selected bookmarks';
    // self.closeBulkDeleteModal();
    self.openBulkDeleteModal.emit(self.alertModal);
  }
  hasPermission(type: string) {
    const self = this;
    return self.commonService.hasPermission(type);
  }

  getMembers() {
    const self = this;
    const options = {
      select: 'username,basicDetails.name',
      filter: {
        _id: {
          $in: self.userList
        }
      },
      count: -1,
      noApp: true
    };
    self.subscriptions['getMembers'] = self.commonService.get('user', `/usr/`, options)
      .subscribe((res) => {
        self.userList = res;
      }, (err) => {
        self.commonService.errorToast(err);
      });
  }

  getUserName(userId) {
    const self = this;
    const data = self.userList.find(user => user._id === userId);
    if (data && data.basicDetails) {
      return data.basicDetails.name;
    }
  }

  get enableBulkDelete() {
    const self = this;
    let retValue = false;
    const result = self.bookmarkList.filter(boomark => boomark.checked);
    if (self.hasPermission('PMBM') && result.length > 0) {
      retValue = true;
    }
    return retValue;
  }

  sortModelChange(model: any) {
    const self = this;
    self.bookmarkConfig.sort = self.appService.getSortQuery(model);
    self.loadMore({
      page: 1
    });
  }

  prevPage() {
    const self = this;
    self.currentPage -= 1;
    self.loadMore({
      page: self.currentPage
    });
  }

  nextPage() {
    const self = this;
    self.currentPage += 1;
    self.loadMore({
      page: self.currentPage
    });
  }

  get startNo() {
    const self = this;
    return (self.currentPage - 1) * self.bookmarkConfig.count + 1;
  }

  get endNo() {
    const self = this;
    const temp = self.currentPage * self.bookmarkConfig.count;
    if (self.totalRecords > temp) {
      return temp;
    }
    return self.totalRecords;
  }

  get disablePrev() {
    const self = this;
    if (self.currentPage === 1) {
      return true;
    }
    return false;
  }

  get disableNext() {
    const self = this;
    if (self.totalRecords < self.recordsLoaded) {
      return true;
    }
    return false;
  }

  get recordsLoaded() {
    const self = this;
    return self.currentPage * self.bookmarkConfig.count;
  }

  get checkAllBookmark() {
    const self = this;
    if (self.bookmarkList && self.bookmarkList.length > 0) {
      return self.bookmarkList.every(e => e.checked);
    }
    return false;
  }

  set checkAllBookmark(val) {
    const self = this;
    self.bookmarkList.forEach(e => {
      e.checked = val;
    });
  }
}
