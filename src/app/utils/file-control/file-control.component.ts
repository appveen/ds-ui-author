import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { SizePipe } from '../pipes/size/size.pipe';
import { Observable } from 'rxjs';

@Component({
  selector: 'odp-file-control',
  templateUrl: './file-control.component.html',
  styleUrls: ['./file-control.component.scss'],
  providers: [SizePipe]
})
export class FileControlComponent implements OnInit {

  @ViewChild('fileEle', { static: true }) fileEle: HTMLInputElement;
  @Input() disabled: boolean;
  @Input() file: any;
  @Output() fileChange: EventEmitter<any>;
  @Input() fileName: string;
  @Output() fileNameChange: EventEmitter<string>;
  @Output() content: EventEmitter<any>;
  constructor(private sizePipe: SizePipe) {
    const self = this;
    self.fileChange = new EventEmitter();
    self.fileNameChange = new EventEmitter();
    self.content = new EventEmitter();
  }

  ngOnInit() {
    const self = this;
  }

  onChange(event) {
    const self = this;
    self.file = event.target.files[0];
    self.fileChange.emit(self.file);
    self.fileEle.value = '';
    self.fileName = self.file.name;
    self.fileNameChange.emit(self.fileName);
    self.readContent(self.file).subscribe(c => self.content.emit(c));
  }

  readContent(file: any): Observable<any> {
    return new Observable(observer => {
      const reader = new FileReader();
      reader.onload = (event) => {
        observer.next(reader.result);
        observer.complete();
      };
      reader.onerror = (event) => {
        observer.error(event);
      };
      reader.readAsText(file);
    });
  }

  get filename() {
    const self = this;
    if (self.file && self.file.name) {
      return self.file.name;
    }
    if (self.fileName) {
      return self.fileName;
    }
    return 'Choose a file';
  }

  get filesize() {
    const self = this;
    if (self.file && self.file.size) {
      return self.sizePipe.transform(self.file.size);
    }
    return '';
  }
}
