import { Component, OnInit, Input } from '@angular/core';
import { CommonService } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';

@Component({
    selector: 'odp-user-group-appcenter',
    templateUrl: './user-group-appcenter.component.html',
    styleUrls: ['./user-group-appcenter.component.scss']
})
export class UserGroupAppcenterComponent implements OnInit {

    @Input() roles: Array<any>;
    activeSubTab: number;

    constructor(private commonService: CommonService,
        private appService: AppService) {
        const self = this;
        self.roles = [];
        self.activeSubTab = 0;
    }

    ngOnInit() {
        const self = this;
        if (self.hasPermission('PVGCDS') || self.hasPermission('PMGCDS')) {
            self.activeSubTab = 0;
        } else if (self.hasPermission('PVGCIF') || self.hasPermission('PMGCIF')) {
            self.activeSubTab = 1;
        } else if (self.hasPermission('PVGCBM') || self.hasPermission('PMGCBM')) {
            self.activeSubTab = 2;
        }
    }

    hasPermission(type: string) {
        const self = this;
        return self.commonService.hasPermission(type);
    }

    isAppAdmin() {
        const self = this;
        return self.commonService.isAppAdmin;
    }
}
