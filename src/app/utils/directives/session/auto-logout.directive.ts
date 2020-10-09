import {Directive, HostListener} from '@angular/core';
import {CommonService} from 'src/app/utils/services/common.service';

@Directive({
    selector: '[odpAutoLogout]'
})
export class AutoLogoutDirective {

    constructor(private commonService: CommonService) {
    }

    @HostListener('window:unload', ['$event'])
    public beforeunloadHandler($event) {
        this.commonService.logout();
        $event.returnValue = true;
    }

}
