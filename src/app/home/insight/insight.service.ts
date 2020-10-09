import {EventEmitter, Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class InsightService {

    searchUserLog: EventEmitter<any>;
    userLogFilter: any;
    applyFilter: EventEmitter<any>;
    constructor() {
        const self = this;
        self.searchUserLog = new EventEmitter();
        self.applyFilter = new EventEmitter();
    }
}
