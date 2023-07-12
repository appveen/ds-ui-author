import { Component, OnInit, Input } from '@angular/core';
import { AppService } from 'src/app/utils/services/app.service';

@Component({
  selector: 'odp-file-rw-properties',
  templateUrl: './file-rw-properties.component.html',
  styleUrls: ['./file-rw-properties.component.scss']
})
export class FileRwPropertiesComponent implements OnInit {

  @Input() edit: any;
  @Input() flowData: any;
  @Input() currNode: any;
  volumeMountList: Array<any>;
  constructor(private appService: AppService) {
    this.volumeMountList = [];
    this.edit = { status: false };
  }

  ngOnInit(): void {
    if (this.flowData && this.flowData.volumeMounts) {
      this.volumeMountList = this.appService.cloneObject(this.flowData.volumeMounts);
    }
  }

  selectDefault() {
    if (this.currNode) {
      this.volumeMountList.forEach(item => {
        if (item._id == this.currNode._id) {
          item._selected = true;
        }
      });
    }
  }

  toggleItem(flag: boolean, item: any) {
    this.volumeMountList.forEach(df => {
      df._selected = false;
    });
    item._selected = flag;
  }

  selectVolumeMount() {
    this.currNode.options.volumeMount = this.appService.cloneObject(this.volumeMountList.find(e => e._selected));
    delete this.currNode._selected;
  }

  get isVolumeMountSelected() {
    return this.volumeMountList.some(e => e._selected);
  }
  
  get fileType() {
    if (this.currNode
      && this.currNode.dataStructure
      && this.currNode.dataStructure.outgoing
      && this.currNode.dataStructure.outgoing.formatType) {
      return this.currNode.dataStructure.outgoing.formatType;
    }
    return 'BINARY';
  }
}
