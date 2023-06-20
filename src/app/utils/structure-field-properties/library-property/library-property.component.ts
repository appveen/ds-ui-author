import { Component, OnInit, Input, EventEmitter, OnDestroy } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { GetOptions, CommonService } from '../../services/common.service';

@Component({
  selector: 'odp-library-property',
  templateUrl: './library-property.component.html',
  styleUrls: ['./library-property.component.scss']
})
export class LibraryPropertyComponent implements OnInit, OnDestroy {
  @Input() form: UntypedFormGroup;
  @Input() edit: any;
  @Input() isLibrary: boolean;
  @Input() isDataFormat: boolean;
  @Input() type;
  properties: UntypedFormGroup;
  libraries: Array<any>;
  documents: Array<any>;
  openDeleteModal: EventEmitter<any>;
  private subscriptions: any;
  constructor(private commonService: CommonService) {
    const self = this;
    self.libraries = [];
    self.subscriptions = {};
  }

  ngOnInit() {
    const self = this;
    self.properties = self.form.get('properties') as UntypedFormGroup;
    self.getLibraries();
    self.getLibraryName();
  }

  ngOnDestroy() {
    const self = this;
    Object.keys(self.subscriptions).forEach(key => {
      if (self.subscriptions[key]) {
        self.subscriptions[key].unsubscribe();
      }
    });
  }

  getLibraryName() {
    const self = this;
    const options: GetOptions = {
      select: 'name'
    };
    options.filter = { app: this.commonService.app._id };
    if (self.subscriptions['getLibraryName']) {
      self.subscriptions['getLibraryName'].unsubscribe();
    }
    const id = self.form.get('properties.schema').value;
    if (!self.form.get('properties.schemaName').value && id) {
      self.subscriptions['getLibraryName'] = self.commonService
        .get('serviceManager', `/${this.commonService.app._id}/globalSchema/` + id, options).subscribe(res => {
          if (self.form.get('properties.schemaName')) {
            self.form.get('properties.schemaName').patchValue(res.name);
          }
        }, err => {
          self.commonService.errorToast(err);
        });
    }
  }

  getLibraries() {
    const self = this;
    const options: GetOptions = {
      select: '_id,name',
      count: 30,
      noApp: true,
      filter: {
        app: this.commonService.app._id,
        definition: { $ne: null, $not: { $size: 0 } }
      }
    };
    if (self.subscriptions['getLibraries']) {
      self.subscriptions['getLibraries'].unsubscribe();
    }
    self.subscriptions['getLibraries'] = self.commonService
      .get('serviceManager', `/${this.commonService.app._id}/globalSchema`, options)
      .subscribe(data => {
        self.libraries = data;
      }, err => {
        self.libraries = [];
      });
  }

  searchSchema = (text$: Observable<any>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(val => {
        const self = this;
        const options: GetOptions = {
          count: 10,
          select: 'name definition app',
          filter: {
            name: '/' + val + '/',
            app: self.commonService.app._id,
            definition: { $ne: null, $not: { $size: 0 } }
          }
        };
        return self.commonService.get('serviceManager', `/${this.commonService.app._id}/globalSchema`, options).toPromise().then(res => {
          return res;
        });
      })
    )

  selectSchema(val) {
    const self = this;
    self.form.get('properties.schema').patchValue(val.item._id);
    self.form.get('properties.schemaName').patchValue(val.item.name);
    self.form.get('properties.definition').patchValue(val.item.definition);
  }

  formatter = (x: { _id: string, name: string, version: number }) => x.name;

  get schemaName() {
    const self = this;
    if (self.properties.get('schemaName')) {
      return self.properties.get('schemaName').value;
    }
    return null;
  }
}
