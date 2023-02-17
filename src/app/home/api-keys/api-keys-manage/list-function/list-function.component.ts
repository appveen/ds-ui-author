import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-list-function',
  templateUrl: './list-function.component.html',
  styleUrls: ['./list-function.component.scss']
})
export class ListFunctionComponent implements OnInit {

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
    this.fetchFunctions();
  }

  fetchFunctions() {
    this.showLazyLoader = true;
    this.commonService
      .get('partnerManager', `/${this.commonService.app._id}/faas/utils/count`)
      .pipe(switchMap((ev: number) => {
        if (ev > 0) {
          return this.commonService.get('partnerManager', `/${this.commonService.app._id}/faas`, {
            count: ev,
            select: '_id app name'
          })
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

  isRoleSelected(faas: any) {
    if (this.data && this.data.roles && this.data.roles.findIndex(e => e.entity.split('FAAS_')[1] == faas._id) > -1) {
      return true;
    }
    return false;
  }

  toggleRole(flag: boolean, faas: any) {
    const index = this.data.roles.findIndex(e => e.entity.split('FAAS_')[1] == faas._id);
    if (index > -1) {
      this.data.roles.splice(index, 1);
    }
    if (flag) {
      const temp = {
        app: faas.app,
        entity: 'FAAS_' + faas._id,
        id: faas._id,
        type: 'appcenter'
      };
      this.data.roles.push(temp);
    }
    this.dataChange.emit(this.data);
  }
}
