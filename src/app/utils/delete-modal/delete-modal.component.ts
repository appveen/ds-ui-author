import { Component, OnInit, ViewChild, TemplateRef, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../services/common.service';

@Component({
  selector: 'odp-delete-modal',
  templateUrl: './delete-modal.component.html',
  styleUrls: ['./delete-modal.component.scss']
})
export class DeleteModalComponent implements OnInit, OnDestroy {

  @Input() open: EventEmitter<any>;
  // tslint:disable-next-line:no-output-native
  @Output() close: EventEmitter<any>;
  @ViewChild('deleteModalTemplate', { static: false }) deleteModalTemplate: TemplateRef<HTMLElement>;
  deleteModalTemplateRef: NgbModalRef;
  data: any;
  constructor(private commonService: CommonService) {
    const self = this;
    self.open = new EventEmitter();
    self.close = new EventEmitter();
    self.data = {};
  }

  ngOnInit() {
    const self = this;
    self.open.subscribe(data => {
      self.data = data;
      if (self.deleteModalTemplateRef) {
        self.deleteModalTemplateRef.close();
      }
      self.deleteModalTemplateRef = self.commonService
        .modal(self.deleteModalTemplate, { centered: true, windowClass: '.delete-partner-modal' });
      self.deleteModalTemplateRef.result.then(close => {
        self.deleteModalTemplateRef = null;
        if (close) {
          self.close.emit(self.data);
        } else {
          self.close.emit(null);
        }
      }, dismiss => {
        self.deleteModalTemplateRef = null;
        self.close.emit(null);
      });
    });
  }

  ngOnDestroy() {
    const self = this;
    if (self.deleteModalTemplateRef) {
      self.deleteModalTemplateRef.close(false);
    }
  }
}
