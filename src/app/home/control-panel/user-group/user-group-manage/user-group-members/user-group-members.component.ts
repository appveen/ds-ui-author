import { Component, OnInit, Input } from '@angular/core';
import { CommonService } from 'src/app/utils/services/common.service';


@Component({
    selector: 'odp-user-group-members',
    templateUrl: './user-group-members.component.html',
    styleUrls: ['./user-group-members.component.scss']
})
export class UserGroupMembersComponent implements OnInit {

    @Input() users: Array<string>;
    activeSubTab: number;
    constructor(private commonService: CommonService) {
        this.users = [];
        this.activeSubTab = 0
    }

    ngOnInit(): void {

    }

    hasPermission(type: string) {
        const self = this;
        return self.commonService.hasPermission(type);
    }
}
