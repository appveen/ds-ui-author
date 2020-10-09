import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  Renderer2,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { App } from 'src/app/utils/interfaces/app';
import { CommonService } from 'src/app/utils/services/common.service';
import { trigger, transition, style, animate, state, keyframes } from '@angular/animations';
import { FilterPipe } from 'src/app/utils/pipes/filter.pipe';
import { OrderByPipe } from '../pipes/order-by/order-by.pipe';

@Component({
  selector: 'odp-app-switcher',
  templateUrl: './app-switcher.component.html',
  styleUrls: ['./app-switcher.component.scss'],
  animations: [
    trigger('slideIn', [
      state('hidden', style({
        transform: 'translateY(-20vh)',
        opacity: '0'
      })),
      state('visible', style({
        transform: 'translateY(0)',
        opacity: '1'
      })),
      transition('hidden => visible', [
        animate('400ms ease-in', keyframes([
          style({
            opacity: 0,
            transform: 'translateY(-10vh)'
          }),
          style({
            opacity: 1,
            transform: 'translateY(0)'
          })
        ]))
      ]),
      transition('visible => hidden', [
        animate('500ms ease-out', keyframes([
          style({
            opacity: .7,
            transform: 'translateY(-10vh)'
          }),
          style({
            opacity: .5,
            transform: 'translateY(-20vh)'
          }),
          style({
            opacity: 0
          })
        ]))
      ])
    ]),
    trigger('toggleOverlay', [
      state('visible', style({ opacity: '1' })),
      state('hidden', style({ opacity: '0' })),
      transition('*=>visible', [
        style({ opacity: '0' }),
        animate('200ms ease-in', style({ opacity: '1' }))
      ]),
      transition('visible=>hidden', [
        style({ opacity: '1' }),
        animate('100ms ease-out', keyframes([
          style({
            opacity: .7
          }),
          style({
            opacity: .5
          }),
          style({
            opacity: 0
          })
        ]))
      ])
    ])
  ],
  providers: [FilterPipe, OrderByPipe]
})
export class AppSwitcherComponent implements OnInit, AfterViewInit {

  @Input() activeApp: App;
  @Output() activeAppChange: EventEmitter<App>;
  @Output() cancel: EventEmitter<boolean>;
  @ViewChild('searchBox', { static: false }) searchBox: ElementRef;
  appList: Array<App>;
  state: string;
  switcherState: string;
  searchTerm: string;

  constructor(private commonService: CommonService,
    private renderer: Renderer2,
    private orderBy: OrderByPipe,
    private appFilter: FilterPipe) {
    const self = this;
    self.activeAppChange = new EventEmitter();
    self.cancel = new EventEmitter();
    self.appList = [];
  }

  ngOnInit() {
    const self = this;
    self.state = 'visible';
    self.switcherState = 'hidden';
    self.appList = self.orderBy.transform(this.commonService.appList, '_id');
    self.appList.forEach(app => {
      self.commonService.getAppDetails(app);
    });
    self.renderer.listen('body', 'keyup', (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        self.onCancel();
      }
    });
    setTimeout(() => {
      self.switcherState = 'visible';
    }, 50);
  }

  ngAfterViewInit() {
    const self = this;
    self.searchBox.nativeElement.focus();
  }

  selectApp(app: App) {
    const self = this;
    self.state = 'hidden';
    self.activeAppChange.emit(app);
    self.commonService.currentAppUpdated.next(app._id);
  }

  onEnter(event: KeyboardEvent) {
    const self = this;
    if (self.searchTerm) {
      const returnedApps = self.appFilter.transform(self.appList, self.searchTerm);
      if (returnedApps.length > 0) {
        self.selectApp(returnedApps[0]);
      }
    } else if (self.appList.length > 0) {
      self.selectApp(self.appList[0]);
    }
  }

  onCancel() {
    const self = this;
    self.state = 'hidden';
    self.switcherState = 'hidden';
    setTimeout(() => {
      self.cancel.emit(true);
    }, 200);
  }
}
