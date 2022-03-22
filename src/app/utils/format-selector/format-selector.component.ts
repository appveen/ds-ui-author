import { Component, ViewChild, TemplateRef, Input, EventEmitter, Output, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CommonService, GetOptions } from '../services/common.service';
import { SchemaBuilderService } from 'src/app/home/schema-utils/schema-builder.service';
import { SchemaStructurePipe } from 'src/app/home/schema-utils/schema-structure.pipe';
import { AppService } from '../services/app.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'odp-format-selector',
    templateUrl: './format-selector.component.html',
    styleUrls: ['./format-selector.component.scss'],
    providers: [SchemaStructurePipe]
})
export class FormatSelectorComponent implements OnDestroy {

    @ViewChild('selectDataStructureModalTemplate', { static: false }) selectDataStructureModalTemplate: TemplateRef<HTMLElement>;
    @ViewChild('customFormatModalTemplate', { static: false }) customFormatModalTemplate: TemplateRef<HTMLElement>;
    @Input() restrictToFormat: Array<string>;
    @Input() format: any;
    @Output() formatChange: EventEmitter<any>;
    selectDataStructureModalTemplateRef: NgbModalRef;
    customFormatModalTemplateRef: NgbModalRef;
    dataList: Array<any>;
    searchTerm: string;
    selectedType: string;
    form: FormGroup;
    showDataStructure: boolean;
    showLoader: boolean;
    subscription: Subscription;

    constructor(
        private commonService: CommonService,
        private appService: AppService,
        private fb: FormBuilder,
        private schemaService: SchemaBuilderService,
        private schemaStructurePipe: SchemaStructurePipe) {

        this.formatChange = new EventEmitter();
        this.dataList = [];
        this.form = this.fb.group({
            name: [null, [Validators.required]],
            description: [null],
            type: ['Object', [Validators.required]],
            definition: this.fb.array([
                this.schemaService.getDefinitionStructure()
            ]),
            formatType: ['JSON', [Validators.required]],
            character: [',', [Validators.required]],
            excelType: ['XLS', [Validators.required]],
            length: [10, [Validators.required]],
            strictValidation: [false]
        });
        this.restrictToFormat = [];
        this.setupSubscriptions();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    private setupSubscriptions() {
        this.subscription = new Subscription();
        this.subscription.add(
            this.form.get('formatType').valueChanges.subscribe(
                formatType => {
                    if (formatType === 'EXCEL') {
                        this.form.get('excelType').setValue('xls');
                    } else if (formatType === 'EXCEL_XML') {
                        this.form.get('formatType').setValue('EXCEL', { emitEvent: false });
                        this.form.get('excelType').setValue('xlsx');
                    } else if (!!this.form.get('excelType').value) {
                        this.form.get('excelType').setValue('');
                    }
                }
            )
        )
    }

    openSelectDataStructure() {
        const self = this;
        if (self.selectDataStructureModalTemplateRef) {
            self.selectDataStructureModalTemplateRef.close(false);
        }
        self.selectDataStructureModalTemplateRef = self.commonService.modal(self.selectDataStructureModalTemplate, {
            centered: true,
            windowClass: 'data-structure-modal'
        });
        self.selectDataStructureModalTemplateRef.result.then(close => {
            if (close) {
                let temp = self.dataList.find(e => e.selected);
                if (temp) {
                    temp.type = self.selectedType;
                } else {
                    temp = {
                        type: self.selectedType,
                        formatType: 'BINARY'
                    };
                }
                self.formatChange.emit(temp);
            } else {
                self.selectedType = null;
            }
            self.dataList = [];
        }, dismiss => {
            self.selectedType = null;
            self.dataList = [];
        });
    }

    openCustomDataModal() {
        const self = this;
        if (self.restrictToFormat && self.restrictToFormat.length > 0) {
            self.form.get('formatType').patchValue(self.restrictToFormat[0]);
        }
        self.customFormatModalTemplateRef = self.commonService
            .modal(self.customFormatModalTemplate, { centered: true, windowClass: 'custom-format-modal' });
        self.customFormatModalTemplateRef.result.then(close => {
            if (close) {
                const data = self.form.value;
                const temp: any = {};
                const def = self.schemaStructurePipe.transform(data).definition;
                temp._id = self.appService.randomID(5);
                temp.definition = def;
                temp.attributeCount = self.schemaService.countAttr(def);
                temp.name = 'Custom';
                temp.type = self.selectedType;
                temp.formatType = data.formatType;
                temp.character = data.character;
                temp.excelType = data.excelType;
                temp.lineSeparator = data.lineSeparator;
                self.formatChange.emit(temp);
            } else {
                self.selectedType = null;
            }
            self.dataList = [];
        }, dismiss => {
            self.selectedType = null;
            self.dataList = [];
        });
    }

    searchFormat(searchTerm: string, type: string) {
        const self = this;
        const options: GetOptions = {
            filter: {
                name: '/' + searchTerm + '/',
                definition: { $exists: true },
                app: this.commonService.app._id
            },
            select: 'name,definition,attributeCount,formatType,character,excelType,strictValidation,lineSeparator',
            count: 5
        };
        let request;
        self.searchTerm = searchTerm;
        self.showLoader = true;
        if (self.selectedType === 'dataService') {
            request = self.commonService.get('serviceManager', `/${this.commonService.app._id}/service`, options);
        } else {
            if (self.restrictToFormat && self.restrictToFormat.length > 0) {
                options.filter['formatType'] = {
                    $in: self.restrictToFormat
                };
            }
            request = self.commonService.get('partnerManager', `/${this.commonService.app._id}/dataFormat`, options);
        }
        request.subscribe(res => {
            self.showLoader = false;
            self.dataList = res;
        }, err => {
            self.showLoader = false;
            self.dataList = [];
        });
    }

    clearSearch() {
        const self = this;
        self.dataList = [];
        self.searchTerm = null;
    }

    uncheckAll() {
        const self = this;
        self.dataList.forEach(e => {
            e.selected = false;
        });
    }

    addField(place) {
        const self = this;
        self.schemaService.addAttribute.emit(place);
    }

    clearSchema() {
        const self = this;
        (self.form.get('definition') as FormArray).controls.splice(0);
        (self.form.get('definition') as FormArray).push(self.schemaService.getDefinitionStructure());
    }

    showFormat(format: string) {
        return (
            !!this.restrictToFormat &&
            !!this.restrictToFormat.length &&
            this.restrictToFormat.includes(format)
        );
    }

    get showBinary() {
        const self = this;
        if (self.restrictToFormat.indexOf('BINARY') > -1) {
            return true;
        }
        return false;
    }

    get showDataService() {
        const self = this;
        if (self.restrictToFormat.indexOf('JSON') > -1) {
            return true;
        }
        return false;
    }

    get dummyRows() {
        const arr = new Array(5);
        arr.fill(1);
        return arr;
    }

    get formatSelected() {
        const self = this;
        const temp = self.dataList.find(e => e.selected);
        if (temp) {
            return true;
        } else {
            return false;
        }
    }

    get definitions() {
        const self = this;
        return (self.form.get('definition') as FormArray).controls;
    }
}
