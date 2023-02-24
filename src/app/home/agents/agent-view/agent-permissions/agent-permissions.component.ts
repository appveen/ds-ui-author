import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-agent-permissions',
  templateUrl: './agent-permissions.component.html',
  styleUrls: ['./agent-permissions.component.scss']
})
export class AgentPermissionsComponent implements OnInit {

  @Input() agentDetails: any;
  @Output() dataChange: EventEmitter<any>;
  showSettings: boolean;
  activeTab: number;
  showLazyLoader: boolean;
  constructor(private commonService: CommonService,
    private ts: ToastrService) {
    this.dataChange = new EventEmitter();
    this.activeTab = 0;
  }

  ngOnInit(): void {
    this.activeTab = 0;
  }

  hasPermission(type: string) {
    return this.commonService.hasPermission(type);
  }

  onDataChange(data: any) {
    this.commonService.put('partnerManager', `/${this.commonService.app._id}/agent/${this.agentDetails._id}`, data).subscribe(res => {
      this.ts.success('API Key Modified');
    }, err => {
      this.commonService.errorToast(err);
    });
  }

}
