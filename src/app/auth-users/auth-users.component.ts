import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'odp-auth-users',
  templateUrl: './auth-users.component.html',
  styleUrls: ['./auth-users.component.scss']
})
export class AuthUsersComponent implements OnInit {

  @Input() admin: boolean;
  @Input() authType: string;
  @Input() toggle: boolean;
  @Output() toggleChange: EventEmitter<boolean>;
  constructor() {
    const self = this;
    self.toggleChange = new EventEmitter();
  }

  ngOnInit() {
    const self = this;
  }

  toggleChangeListner(event) {
    const self = this;
    self.toggleChange.emit(event);
  }

}
