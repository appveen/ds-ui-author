import {
    Component,
    OnInit,
    Input,
    EventEmitter,
    Output,
    ContentChildren,
    QueryList,
    AfterContentChecked,
    OnDestroy,
    ElementRef,
    AfterContentInit
} from '@angular/core';
import { DataGridHeaderComponent } from './data-grid-header/data-grid-header.component';
import { DataGridRowComponent } from './data-grid-row/data-grid-row.component';

@Component({
    selector: 'odp-data-grid',
    templateUrl: './data-grid.component.html',
    styleUrls: ['./data-grid.component.scss']
})
export class DataGridComponent implements OnInit, AfterContentInit, AfterContentChecked, OnDestroy {

    @Input() pageSize: number;
    @Input() totalRecords: number;
    @Input() loading: boolean;
    @Input() enablebulkDelete: boolean;
    @Input() enableFilter: boolean;
    @Input() enableSelectOptions: boolean;
    @Input() checkAll: boolean;
    @Output() checkAllChange: EventEmitter<boolean>;
    @Output() loadData: EventEmitter<LoadData>;
    @Output() bulkDelete: EventEmitter<LoadData>;
    @Output() sortSelected: EventEmitter<any>;
    @ContentChildren(DataGridHeaderComponent) gridHeaders: QueryList<DataGridHeaderComponent>;
    @ContentChildren(DataGridRowComponent) gridRows: QueryList<DataGridRowComponent>;
    private totalPages: number;
    private currentPage: number;
    private subscription: any;
    private sortModel: any;
    private clientWidth: number;
    constructor(private element: ElementRef) {
        const self = this;
        self.pageSize = 30;
        self.totalRecords = 400;
        self.subscription = {};
        self.sortModel = {};
        self.loadData = new EventEmitter();
        self.checkAllChange = new EventEmitter();
        self.sortSelected = new EventEmitter();
        self.bulkDelete = new EventEmitter();
    }

    ngOnInit() {
        const self = this;
        self.totalPages = Math.ceil(self.totalRecords / self.pageSize);
        self.currentPage = 1;
    }

    ngOnDestroy() {
        const self = this;
        Object.keys(self.subscription).forEach(key => {
            if (self.subscription[key]) {
                self.subscription[key].unsubscribe();
            }
        });
    }

    ngAfterContentInit() {
        const self = this;
       
    }

    ngAfterContentChecked() {
        const self = this;
        self.totalPages = Math.ceil(self.totalRecords / self.pageSize);
        if (!self.gridHeaders.first.key) {
            self.gridHeaders.first.hideOptions = true;
        }
        self.gridHeaders.forEach(_head => {
            if (self.subscription[_head.key]) {
                self.subscription[_head.key].unsubscribe();
            }
            self.subscription[_head.key] = _head.clicked.subscribe(_data => {
                if (_data.key) {
                    if (!_data.sortType) {
                        delete self.sortModel[_data.key];
                    } else {
                        self.sortModel[_data.key] = _data.sortType;
                    }
                    self.sortSelected.emit(self.sortModel);
                }
            });
        });
        self.gridRows.forEach(_row => {
            _row.widthList = self.gridHeaders.map(_e => _e.width);
        });
    }

    selectRecords(type: string) {
        const self = this;
        if (type === 'alternate') {
            self.gridRows.forEach((_row, _index) => {
                if (_row.gridCells.first.checkbox) {
                    _row.gridCells.first.checkbox.checkedChange.emit(false);
                    if (_index % 2 === 0) {
                        _row.gridCells.first.checkbox.checkedChange.emit(true);
                    }
                }
            });
        } else if (type === 'first') {
            self.gridRows.forEach((_row, _index) => {
                if (_row.gridCells.first.checkbox) {
                    _row.gridCells.first.checkbox.checkedChange.emit(false);
                    if (_index < 10) {
                        _row.gridCells.first.checkbox.checkedChange.emit(true);
                    }
                }
            });
        } else {
            self.gridRows.forEach((_row, _index) => {
                if (_row.gridCells.first.checkbox) {
                    _row.gridCells.first.checkbox.checkedChange.emit(false);
                }
            });
        }
    }

    checkedChange(val) {
        const self = this;
        self.checkAllChange.emit(val);
    }

    prevPage() {
        const self = this;
        self.currentPage--;
        self.loadData.emit({ page: self.currentPage });
    }

    nextPage() {
        const self = this;
        self.currentPage++;
        self.loadData.emit({ page: self.currentPage });
    }
    deleteAll() {
        const self = this;
        self.bulkDelete.emit();

    }
    get disablePrev() {
        const self = this;
        if (self.currentPage === 1 || self.totalRecords === 0) {
            return true;
        }
        return false;
    }

    get disableNext() {
        const self = this;
        if (self.currentPage === self.totalPages || self.totalRecords === 0) {
            return true;
        }
        return false;
    }

    get docStartNo() {
        const self = this;
        if (self.totalRecords > 0) {
            return ((self.currentPage - 1) * self.pageSize) + 1;
        } else {
            return self.totalRecords;
        }
    }
    get docEndNo() {
        const self = this;
        const temp = self.currentPage * self.pageSize;
        return temp > self.totalRecords ? self.totalRecords : temp;
    }

    get dummyRows() {
        const self = this;
        const arr = new Array(self.pageSize);
        arr.fill(1);
        return arr;
    }

    get hideSelectAll() {
        const self = this;
        if (self.checkAll === undefined) {
            return true;
        }
        return false;
    }
}

export interface LoadData {
    page?: number;
    count?: number;
    select?: string;
    filter?: any;
}
