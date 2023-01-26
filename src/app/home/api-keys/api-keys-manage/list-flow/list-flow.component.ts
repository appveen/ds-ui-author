import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-list-flow',
  templateUrl: './list-flow.component.html',
  styleUrls: ['./list-flow.component.scss']
})
export class ListFlowComponent implements OnInit {

  @Input() data: any;
  @Output() dataChange: EventEmitter<any>;
  dataList: Array<any>;
  showLazyLoader: boolean;
  constructor(private commonService: CommonService,
    private ts: ToastrService) {
    this.dataList = [];
    this.dataChange = new EventEmitter();
  }

  ngOnInit(): void {
    this.fetchFlows();
  }

  fetchFlows() {
    this.showLazyLoader = true;
    this.commonService
      .get('partnerManager', `/${this.commonService.app._id}/flow/utils/count`)
      .pipe(switchMap((ev: number) => {
        if (ev > 0) {
          return this.commonService.get('partnerManager', `/${this.commonService.app._id}/flow`, {
            count: ev,
            select: '_id app name'
          });
        } else {
          return of([]);
        }
      })).subscribe((res) => {
        this.showLazyLoader = false;
        this.dataList = res;
      }, err => {
        this.showLazyLoader = false;
        this.commonService.errorToast(err);
      });
  }

  hasPermission(type: string) {
    return this.commonService.hasPermission(type);
  }

  isRoleSelected(flow: any) {
    if (this.data && this.data.roles && this.data.roles.findIndex(e => e.entity == flow._id) > -1) {
      return true;
    }
    return false;
  }

  toggleRole(flag: boolean, flow: any) {
    const index = this.data.roles.findIndex(e => e.entity == flow._id);
    if (index > -1) {
      this.data.roles.splice(index, 1);
    }
    if (flag) {
      const temp = {
        app: flow.app,
        entity: flow._id,
        id: 'POST',
        type: 'appcenter'
      };
      this.data.roles.push(temp);
    }
    this.dataChange.emit(this.data);
  }
}
