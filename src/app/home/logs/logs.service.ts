import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LogsService {

  searchPostHookLog: EventEmitter<any>;
  postHookFilter: any;
  applyFilter: EventEmitter<any>;
  constructor() {
    const self = this;
    self.searchPostHookLog = new EventEmitter();
    self.applyFilter = new EventEmitter();
  }
}
