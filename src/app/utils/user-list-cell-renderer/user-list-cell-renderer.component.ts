import { Component, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AgRendererComponent } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

import { AppService } from '../services/app.service';
import { CommonService } from '../services/common.service';

@Component({
    selector: 'odp-user-list-cell-renderer',
    templateUrl: './user-list-cell-renderer.component.html',
    styleUrls: ['./user-list-cell-renderer.component.scss']
})
export class UserListCellRendererComponent implements AgRendererComponent {
    data: any;
    params: ICellRendererParams;
    field: string;
    userList: Array<any>;
    sameUser: boolean;
    authType: string;
    azureToken: string;
    appsHtml: string;

    constructor(private appService: AppService, private commonService: CommonService, private domSanitizer: DomSanitizer) { }

    refresh(params: any): boolean {
        return false;
    }

    agInit(params: ICellRendererParams): void {
        this.params = params;
        this.data = params.data || {};
        this.field = this.params.colDef.field;
        this.sameUser = this.commonService.isThisUser(this.data);
        this.appsHtml = this.getApps(this.data);
    }

    getApps(user) {
        if (user) {
            const temp = !!user.accessControl?.apps?.length ? [...user.accessControl.apps.map(e => e._id).filter(i => !!i)] : [];
            if (temp.length <= 3) {
                return temp.splice(0, 3).join(', ');
            } else {
                return this.domSanitizer.sanitize(
                    SecurityContext.NONE,
                    `${temp.splice(0, 3).join(', ')} <span class="text-accent"> + ${temp.length - 3}</span>`
                );
            }
        }
    }
}
