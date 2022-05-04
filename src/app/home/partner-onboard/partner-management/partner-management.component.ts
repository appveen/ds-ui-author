import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { Router } from '@angular/router';

@Component({
  selector: 'odp-partner-management',
  templateUrl: './partner-management.component.html',
  styleUrls: ['./partner-management.component.scss'],
  animations: [
    trigger('stopping', [
      state('disabled', style({
        opacity: '0.5',
      })), state('enable', style({
        opacity: '1',
      })),
      transition('* => *', animate('1s'))
    ]),
    trigger('cardAction', [
      state('expand', style({
        'min-height': '230px',
        'max-height': '174px'
      })),
      state('collapse', style({
        'min-height': '40px',
        'max-height': '40px'
      })),
      state('centerLocate', style({
        transform: 'translate(-100px,42px)'
      })),
      state('initLocate', style({
        transform: 'translate(0px,0px)'
      })),
      state('circleExpand', style({
        background: 'rgba(209,239,218,1)'
      })),
      state('stopCircleExpand', style({
        background: 'rgba(248,220,220,1)'
      })),
      state('stopCircleShrink', style({
        background: 'rgba(248,220,220,0)'
      })),
      state('circleShrink', style({
        background: 'rgba(209,239,218,0)'
      })),
      state('buttonGroupShow', style({
        height: '87px',
        opacity: '1'
      })),
      state('buttonGroupHide', style({
        height: '0px',
        opacity: '0',
        display: 'none'
      })),
      state('loadingShow', style({
        opacity: '1',
        display: 'block'
      })),
      state('loadingHide', style({
        opacity: '0',
        display: 'none'
      })),
      state('showProcessing', style({
        opacity: '1',
        display: 'block',
        height: '13px'

      })),
      state('hideProcessing', style({
        opacity: '0',
        display: 'none',
        height: '0px'
      })),
      state('playIcon', style({
        opacity: '1',
        display: 'block',
        color: '#0d9e1b'
      })),
      state('midStage', style({
        opacity: '1',
        display: 'block',
        color: '#BDBDBD'
      })),
      state('playIconHide', style({
        opacity: '0',
        display: 'none',
        color: '#BDBDBD'
      })),

      transition('initLocate => centerLocate', animate('0.5s ease-in')),
      transition('buttonGroupHide => buttonGroupShow', animate('0.25s  ease-out')),
      transition('collapse => expand', animate('0.25s')),
      transition('* => *', animate('0.25s')),
    ])
  ]
})
export class PartnerManagementComponent implements OnInit {

  @Input() partner: FormGroup;
  @Input() edit: any;
  startFlowAttributes: any = {};
  confirmModalState: any;
  cardActionDisabled: string;
  flowStatus: any;
  totalFlowcount: number;
  activeFlowCount: number;
  proccessing: boolean;
  showLazyLoader: boolean;
  constructor(
    private commonService: CommonService,
    private router: Router,

  ) {
    const self = this;
    self.confirmModalState = {};
    self.flowStatus = {};
    self.startFlowAttributes = {
      startCircle: 'cricleEnd',
      iconAnimate: 'iconInit',
      loadAnimate: 'unload',
      startCard: 'closed',
      startAction: 'infoHide',
      startGroup: 'buttonGroupHide',
      processing: 'infoHide',
      playIcon: 'playIcon',
      tickAction: 'hideProcessing',
      complete: 'infoHide',
      playLoader: 'loadingHide',
      stopLoader: 'loadingHide'
    };
  }

  ngOnInit() {
    const self = this;
    self.getFlowCount();
    self.confirmModalState['allflow'] = true;
  }

  getFlowCount() {
    const self = this;
    self.showLazyLoader = true;
    const option: GetOptions = {
      filter: {
        app: self.commonService.app._id,
        partner: self.partner.get('_id').value,
      }
    };
    self.commonService.get('partnerManager', `/${this.commonService.app._id}/flow/utils/status/count`, option).subscribe(res => {
      self.flowStatus = res;
      self.showLazyLoader = false;
    }, err => {
      self.showLazyLoader = false;
      self.commonService.errorToast(err);
    });
  }

  toggleCard(name: string) {
    const self = this;
    Object.keys(self.confirmModalState).forEach(key => {
      self.confirmModalState[key] = false;
    });
    self.startFlowAttributes['playIcon'] = 'playIcon';
    self.startFlowAttributes['playLoader'] = 'loadingHide';
    self.confirmModalState[name] = true;
    if (self.confirmModalState['startAll']) {
      self.startFlowAttributes = {
        startCard: 'expand',
        animateItems: 'centerLocate',
        playCircle: 'circleExpand',
        startGroup: 'buttonGroupShow',
        playLoader: 'loadingHide',
        stopLoader: 'loadingHide',
      };

    } else if (self.confirmModalState['allflow']) {
      self.startFlowAttributes = {
        startCard: 'collapse',
        animateItems: 'initLocate',
        startGroup: 'buttonGroupHide',
        playLoader: 'loadingHide',
        stopLoader: 'loadingHide',
      };
    }
  }
  toggleStopCard(name: string) {
    const self = this;
    Object.keys(self.confirmModalState).forEach(key => {
      self.confirmModalState[key] = false;
    });
    self.startFlowAttributes['stopLoader'] = 'loadingHide';
    if (!self.confirmModalState['startAll']) {
      self.startFlowAttributes = {
        stopCard: 'expand',
        stopanimateItems: 'centerLocate',
        stopCircle: 'stopCircleExpand',
        stopGroup: 'buttonGroupShow',
        stopLoader: 'loadingHide',
        playLoader: 'loadingHide'
      };

    } else if (self.confirmModalState['allflow']) {
      self.startFlowAttributes = {
        stopCard: 'collapse',
        stopanimateItems: 'initLocate',
        stopCircle: 'stopCircleExpand',
        stopGroup: 'buttonGroupHide',
        stopLoader: 'loadingHide',
        playLoader: 'loadingHide'
      };
    }
  }

  startAllFlows() {
    const self = this;
    self.startFlowAttributes['playCircle'] = 'circleShrink';
    self.startFlowAttributes['playLoader'] = 'loadingShow';
    self.startFlowAttributes['startGroup'] = 'buttonGroupHide';
    self.startFlowAttributes['processing'] = 'playIcon';
    self.startFlowAttributes['playIcon'] = 'midStage';
    self.proccessing = true;
    self.cardActionDisabled = 'disabled';
    self.commonService.put('partnerManager', `/${self.commonService.app._id}/partner/` + `${self.partner.get('_id').value}/startAll`,{ app: this.commonService.app._id }).subscribe(res => {
      if (res) {
        self.startFlowAttributes['playIcon'] = 'playIconHide';
        self.startFlowAttributes['playLoader'] = 'hideProcessing';
        self.startFlowAttributes['tickAction'] = 'playIcon';
        self.proccessing = false;
        self.startFlowAttributes['complete'] = 'showProcessing';
        self.cardActionDisabled = 'enable';
        self.getFlowCount();

      }
    });
  }
  stopAllFlows() {
    const self = this;
    self.startFlowAttributes['stopCircle'] = 'stopCircleShrink';
    self.startFlowAttributes['stopLoader'] = 'loadingShow';
    self.startFlowAttributes['stopGroup'] = 'buttonGroupHide';
    self.startFlowAttributes['processing'] = 'playIcon';
    self.proccessing = true;
    self.cardActionDisabled = 'disabled';
    self.commonService.put('partnerManager', `/${self.commonService.app._id}/partner/` + `${self.partner.get('_id').value}/stopAll`,{ app: this.commonService.app._id }).subscribe(res => {
      if (res) {
        self.startFlowAttributes['stopIcon'] = 'playIconHide';
        self.startFlowAttributes['stopCircle'] = 'hideProcessing';
        self.startFlowAttributes['stopTickAction'] = 'playIcon';
        self.startFlowAttributes['stopLoader'] = 'loadingHide';
        self.proccessing = false;
        self.startFlowAttributes['complete'] = 'showProcessing';
        self.cardActionDisabled = 'enable';
        self.getFlowCount();
      }
    });
  }

  goTopartnerPage() {
    const self = this;
    self.router.navigate(['/app', self.commonService.app._id, 'pm']);
  }
}
