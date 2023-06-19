import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-list-dataservice',
  templateUrl: './list-dataservice.component.html',
  styleUrls: ['./list-dataservice.component.scss']
})
export class ListDataserviceComponent implements OnInit {

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
    this.fetchDataServices();
    if (!this.data) {
      this.data = {};
    }
    if (!this.data.roles) {
      this.data.roles = [];
    }
  }

  fetchDataServices() {
    this.showLazyLoader = true;
    this.commonService
      .get('serviceManager', `/${this.commonService.app._id}/service/utils/count`)
      .pipe(switchMap((ev: number) => {
        if (ev > 0) {
          return this.commonService.get('serviceManager', `/${this.commonService.app._id}/service`, {
            count: ev,
            select: '_id name app role.roles'
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

  isRoleSelected(role: any) {
    if (this.data && this.data.roles && this.data.roles.findIndex(e => e.id == role.id) > -1) {
      return true;
    }
    return false;
  }

  toggleRole(flag: boolean, role: any, dataService: any) {
    const index = this.data.roles.findIndex(e => e.id == role.id && e.entity == dataService._id);
    if (index > -1) {
      this.data.roles.splice(index, 1);
    }
    if (flag) {
      const temp = {
        app: dataService.app,
        entity: dataService._id,
        id: role.id,
        type: 'appcenter'
      };
      this.data.roles.push(temp);
    }
    this.dataChange.emit(this.data);
  }

  hasMethod(role: any, method: string) {
    if (role.operations.findIndex(e => e.method == method) > -1) {
      return true;
    }
    return false;
  }
}
