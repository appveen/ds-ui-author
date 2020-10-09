import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { GroupAuthorPartnersComponent } from './group-author-partners.component';
import { ControlPanelModule } from '../../../../control-panel.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonService } from '../../../../../../utils/services/common.service';
import { AppService } from '../../../../../../utils/services/app.service';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

fdescribe('GroupAuthorPartnersComponent', () => {
  let component: GroupAuthorPartnersComponent;
  let fixture: ComponentFixture<GroupAuthorPartnersComponent>;
  let commonService: any;
  let appService: any;
  let el: DebugElement;

  beforeEach(async(() => {
    const commonServiceSpy = jasmine.createSpyObj('CommonService', ['get', 'modal', 'hasPermission', 'hasPermissionStartsWith']);
    const appServiceSpy = jasmine.createSpyObj('AppService', ['cloneObject']);
    TestBed.configureTestingModule({
      imports: [ControlPanelModule, HttpClientTestingModule, RouterTestingModule],
      providers: [
          {provide: CommonService, useValue: commonServiceSpy},
          {provide: AppService, useValue: appServiceSpy}
      ]
    })
    .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(GroupAuthorPartnersComponent);
          component = fixture.componentInstance;
          el = fixture.debugElement;
          commonService = TestBed.get(CommonService);
          appService = TestBed.get(AppService);
          commonService.app = {_id: 'Adam'};
        });
  }));

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call ngOnInit while roles array is empty and getpartnerList gets called', () => {
    const pl = spyOn(component, 'getPartnersList');
    component.roles = null;
    component.ngOnInit();
    expect(component.exceptionList.length).toBe(0);
    expect(component.flowExceptionList.length).toBe(0);
    expect(pl).toHaveBeenCalled();
    expect(pl).toHaveBeenCalledTimes(1);
  });

  it('should call ngOnInit with roles array', () => {
    component.roles = [
      {_id: '5d07a0ad7d940c75f70c99d8', id: 'PNPH', app: 'Bijay-App', entity: 'PM', type: 'author'},
      {_id: '5d07a0ad7d940c64b90c99d7', id: 'PNPB', app: 'Bijay-App', entity: 'PM', type: 'author'},
      {_id: '5d07a0ad7d940cebff0c99d9', id: 'PNPP', app: 'Bijay-App', entity: 'PM_PTR2036', type: 'author'},
      {_id: '5d07a0ad7d940c75f70c99d8', id: 'PNPH', app: 'Bijay-App', entity: 'PM_PTR2036', type: 'author'},
      {_id: '5d07a0ad7d940cfb330c99d5', id: 'PNPFPD', app: 'Bijay-App', entity: 'PM_PTR2036', type: 'author'},
      {_id: '5d07a0ad7d940c4fb20c99d4', id: 'PNPFPS', app: 'Bijay-App', entity: 'PM_PTR2036', type: 'author'},
      {_id: '5c821d226a7fdc9ce9b786db', id: 'PNPS', app: 'Bijay-App', entity: 'PM_PTR2036', type: 'author'},
      {id: 'PMPFMBC', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
      {id: 'PVPFMB', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
      {id: 'PNPFMS', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
      {id: 'PNPFMD', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
      {id: 'PNPFMB', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
      {id: 'PNPFMS', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'}
    ];
    const pl = spyOn(component, 'getPartnersList');
    component.ngOnInit();
    expect(component.exceptionList.length).toBe(1);
    expect(component.flowExceptionList.length).toBe(1);
    expect(pl).toHaveBeenCalled();
    expect(pl).toHaveBeenCalledTimes(1);
  });

  it('should fetch all partner list with valid exception list', () => {
      const partners = [{
          flows: [],
          name: 'Partner1',
          _id: 'PTR1111'
      }, {
          flows: ['FLOW001', 'FLOW002', 'FLOW003'],
          name: 'Partner2',
          _id: 'PTR1112'
      }];
      component.exceptionList = [{
          _id: 'PTR1112'
      }];
      commonService.get.and.returnValue(of(partners));
      expect(component.partersList.length).toBe(0);
      component.getPartnersList();
      expect(component.partersList.length).toBe(2);
  });

  it('should fetch all partner list with invalid exception list', () => {
    const partners = [{
      flows: [],
      name: 'Partner1',
      _id: 'PTR1111'
    }, {
      flows: ['FLOW001', 'FLOW002', 'FLOW003'],
      name: 'Partner2',
      _id: 'PTR1112'
    }];
    component.exceptionList = [{
      _id: 'PTR1000'
    }];
    commonService.get.and.returnValue(of(partners));
    expect(component.partersList.length).toBe(0);
    component.getPartnersList();
    expect(component.partersList.length).toBe(2);
  });

  it('should return permission object for partner if flow is false/null', () => {
    const prtnr = {
        _id: 'PTR1001',
        flows: [],
        name: 'Partner 1',
        attribute: 3
    };
    const permissionObj = component.getPermissionObject('PVPM', prtnr);
    expect(permissionObj.id).toEqual('PVPM');
    expect(permissionObj.app).toEqual(commonService.app._id);
    expect(permissionObj.entity).toEqual(`PM_${prtnr._id}`);
    expect(permissionObj.type).toEqual('author');
  });

  it('should return permission object for partner if flow is true', () => {
        commonService.app = { _id: 'Adam'};
        const prtnr = {
            _id: 'FLOW',
            name: 'FLOW 1',
            partner: 'Partner 1'
        };
        const permissionObj = component.getPermissionObject('PVPFMB', prtnr, true);
        expect(permissionObj.id).toEqual('PVPFMB');
        expect(permissionObj.app).toEqual(commonService.app._id);
        expect(permissionObj.entity).toEqual(`FLOW_${prtnr._id}`);
        expect(permissionObj.type).toEqual('author');
    });

  it('should return empty permission object if required params are not provided in getPermissionObject', () => {
    const permissionObj1 = component.getPermissionObject('', null);
    expect(Object.keys(permissionObj1).length).toEqual(0);
    const permissionObj2 = component.getPermissionObject(null, null);
    expect(Object.keys(permissionObj2).length).toEqual(0);
  });

  it('should open modal for flow fine grain access control when flowFGAModalRef returns false', () => {
    const exp = {
        name: 'Partner 1',
        _id: 'PTR1001'
    };
    commonService.modal.and.returnValue({
        result: new Promise((resolve, reject) => resolve(false))
    });
    component.selectedException = exp;
    const fl = spyOn(component, 'fetchFlowList');
    component.openFlowFGAModal(exp);
    const modal = el.queryAll(By.css('.flow-modal-class'));
    expect(fl).toHaveBeenCalled();
    expect(modal).toBeTruthy('Could not find the modal');
  });

  it('should open modal for flow fine grain access control when flowFGAModalRef returns true', fakeAsync(() => {
    const exp = {
        name: 'Partner 1',
        _id: 'PTR1001'
    };
    commonService.modal.and.returnValue({
        result: new Promise((resolve, reject) => resolve(true))
    });
    component.selectedException = exp;
    const fl = spyOn(component, 'fetchFlowList');
    component.openFlowFGAModal(exp);
    tick();
    const modal = el.queryAll(By.css('.flow-modal-class'));
    expect(fl).toHaveBeenCalled();
    expect(modal).toBeTruthy('Could not find the modal');
    expect(component.flowExceptionsSaved).toBe(true, 'flow exception changes were not saved');
  }));

  it('should test openExceptionModal when exceptionListModalRef return false', () => {
    commonService.modal.and.returnValue({
        result: new Promise((resolve, reject) => resolve(false))
    });
    component.openExceptionModal();
    const modal = el.queryAll(By.css('.service-exception-modal'));
    expect(modal).toBeTruthy('Could not find the modal');
  });

  it('should test openExceptionModal when exceptionListModalRef return true', fakeAsync(() => {
    commonService.modal.and.returnValue({
        result: new Promise((resolve, reject) => resolve(true))
    });
    component.partersList = [{
      attribute: 3,
      flows: ['FLOW2588', 'FLOW2597', 'FLOW2737'],
      name: 'Partner 2',
      selected: false,
      _id: 'PTR2005'
    },
    {
      _id: 'PTR2531',
      flows: [],
      name: 'DEFTest1',
      attribute: 0,
      selected: false
    },
    {
      attribute: 3,
      flows: ['FLOW2580', 'FLOW3597', 'FLOW2547'],
      hide: false,
      name: 'Partner 1',
      selected: true,
      _id: 'PTR1001'
    }];
    component.roles = [
      {_id: '5d07a0ad7d940cebff0c99d9', id: 'PMPBC', app: 'Bijay-App', entity: 'PM', type: 'author'},
      {_id: '5d07a0ad7d940c75f70c99d8', id: 'PNPH', app: 'Bijay-App', entity: 'PM', type: 'author'},
      {_id: '5d07a0ad7d940c64b90c99d7', id: 'PNPB', app: 'Bijay-App', entity: 'PM', type: 'author'}
    ];
    const clonedRoles = JSON.parse(JSON.stringify(component.roles));
    appService.cloneObject.and.returnValue(clonedRoles);
    component.openExceptionModal();
    tick();
    expect(component.exceptionList.length).toBe(1);
  }));

  it('should fetch all flows for a partner if partner has flows', fakeAsync(() => {
    component.selectedException = {
      name: 'Partner 1',
      id: 'PTR1001'
    };
    const partners = [{
      flows: ['FLOW001', 'FLOW002', 'FLOW003'],
      name: 'Partner 1',
      _id: 'PTR1111'
     }, {
      flows: [],
      name: 'Partner 2',
      _id: 'PTR1112'
    }];
    const flow = {
        name: 'Flow 1',
        partner: 'PTR1111',
        _id: 'FLOW1001'
    };
    commonService.get.and.returnValue(of(partners));
    spyOn(component, 'fetchFlowForPartner').and.returnValue(of(flow));
    expect(component.flowList.length).toBe(0, 'flow list is not empty');
    component.fetchFlowList();
    tick();
    expect(component.flowList.length).toBe(3, 'flow list is empty');
  }));

  it('should fetch all flows for a partner if partner has flows with flow exception', fakeAsync(() => {
    component.selectedException = {
        name: 'Partner 1',
        id: 'PTR1001'
    };
    component.flowExceptionList = [{_id: 'FLOW003'}];
    const partners = [{
        flows: ['FLOW001', 'FLOW002', 'FLOW003'],
        name: 'Partner 1',
        _id: 'PTR1111'
    }, {
        flows: [],
        name: 'Partner 2',
        _id: 'PTR1112'
    }];
    const flow = {
        name: 'Flow 1',
        partner: 'PTR1111',
        _id: 'FLOW1001'
    };
    commonService.get.and.returnValue(of(partners));
    spyOn(component, 'fetchFlowForPartner').and.returnValue(of(flow));
    expect(component.flowList.length).toBe(0, 'flow list is not empty');
    component.fetchFlowList();
    tick();
    expect(component.flowList.length).toBe(3, 'flow list is empty');
  }));

  it('should fetch all flows for a partner if partner has flows with flow exception and flowListPlaceHolder', fakeAsync(() => {
    component.selectedException = {
      name: 'Partner 1',
      id: 'PTR1001'
    };
    component.flowExceptionList = [{_id: 'FLOW003'}];
    const partners = [{
      flows: ['FLOW001', 'FLOW002', 'FLOW003'],
      name: 'Partner 1',
      _id: 'PTR1001'
    }, {
      flows: [],
      name: 'Partner 2',
      _id: 'PTR1112'
    }];
    const flow = {
      name: 'Flow 3',
      partner: 'PTR1001',
      _id: 'FLOW003'
    };
    commonService.get.and.returnValue(of(partners));
    spyOn(component, 'fetchFlowForPartner').and.returnValue(of(flow));
    expect(component.flowListPlaceHolder.length).toBe(0, 'flow list placeholder is not empty');
    component.fetchFlowList();
    tick();
    expect(component.flowListPlaceHolder.length).toBe(1, 'flow list placeholder is empty');
  }));

  it('should not fetch any flows if partner has no flows', fakeAsync(() => {
     component.selectedException = {
        name: 'Partner 1',
        id: 'PTR1001'
    };
     const partners = [{
        flows: [],
        name: 'Partner 1',
        _id: 'PTR1111'
     }, {
        flows: [],
        name: 'Partner 2',
        _id: 'PTR1112'
     }];
     const flow = {};
     commonService.get.and.returnValue(of(partners));
     spyOn(component, 'fetchFlowForPartner').and.returnValue(of(flow));
     expect(component.flowList.length).toBe(0, 'flow list is not empty');
     component.fetchFlowList();
     tick();
     expect(component.flowList.length).toBe(0, 'flow list is not empty');
   }));

  it('should call fetchFlowList method with some pre existing roles', fakeAsync(() => {
    component.roles = [{_id: '5d07a0ad7d940cebff0c99d9', id: 'PNPP', app: 'Bijay-App', entity: 'PM', type: 'author'},
      {_id: '5d07a0ad7d940c75f70c99d8', id: 'PNPH', app: 'Bijay-App', entity: 'PM', type: 'author'},
      {_id: '5d07a0ad7d940c64b90c99d7', id: 'PNPB', app: 'Bijay-App', entity: 'PM', type: 'author'},
      {id: 'PNPFMD', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
      {id: 'PVPFMB', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
      {id: 'PNPFMS', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
      {id: 'PNPFMD', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
      {id: 'PNPFMB', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
      {id: 'PNPFMS', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'}];
    component.selectedException = {
          name: 'Partner 1',
          id: 'PTR1001'
      };
    const partners = [{
      flows: ['FLOW2476', 'FLOW002', 'FLOW003'],
      name: 'Partner 1',
      _id: 'PTR1111'
  }, {
      flows: [],
      name: 'Partner 2',
      _id: 'PTR1112'
  }];
    const flow = {
      name: 'Flow 1',
      partner: 'PTR1111',
      _id: 'FLOW2476'
  };
    commonService.get.and.returnValue(of(partners));
    spyOn(component, 'fetchFlowForPartner').and.returnValue(of(flow));
    expect(component.flowExceptionPlaceHolder.length).toBe(0);
    component.fetchFlowList();
    tick();
    expect(component.flowExceptionPlaceHolder.length).toBe(6);
  }));

  it('should call fetchFlowForPartner method and return an observable', () => {
    component.fetchFlowForPartner('FLOW1001');
    expect(commonService.get).toHaveBeenCalled();
    expect(commonService.get).toHaveBeenCalledTimes(1);
  });

  it('should discard the role changes for fine grain access control of flows', () => {
  component.roles = [{_id: '5d07a0ad7d940cebff0c99d9', id: 'PNPP', app: 'Bijay-App', entity: 'PM', type: 'author'},
      {_id: '5d07a0ad7d940c75f70c99d8', id: 'PNPH', app: 'Bijay-App', entity: 'PM', type: 'author'},
      {_id: '5d07a0ad7d940c64b90c99d7', id: 'PNPB', app: 'Bijay-App', entity: 'PM', type: 'author'},
      {id: 'PNPFMD', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
      {id: 'PVPFMB', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
      {id: 'PNPFMS', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
      {id: 'PNPFMD', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
      {id: 'PNPFMB', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
      {id: 'PNPFMS', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'}];
  const roleCount1 = component.roles.length;
  component.discardFlowExceptionChngs();
  const rolesCount2 = component.roles.length;
  expect(roleCount1).toBeGreaterThan(rolesCount2, 'Roles were not discarded');
  });

  it('should add a flow of a partner or exception roles', () => {
  const flow = {
    name: 'flow1',
    partner: 'PTR2036',
    _id: 'FLOW2476'
  };
  expect(component.roles.length).toBe(0, 'roles are not empty');
  expect(component.flowExceptionList.length).toBe(0);
  component.addFlowException(flow);
  expect(component.roles.length).toBe(3, 'more than one role added');
  expect(component.flowExceptionList.length).toBe(1);
  });

  it('should add a flow of a partner or exception roles with flow list', () => {
    const flow = {
      name: 'flow1',
      partner: 'PTR2036',
      _id: 'FLOW2476'
    };
    component.flowList = [{
        name: 'flow1',
        partner: 'PTR2036',
        _id: 'FLOW2476'
    }];
    expect(component.roles.length).toBe(0, 'roles are not empty');
    expect(component.flowExceptionList.length).toBe(0);
    component.addFlowException(flow);
    expect(component.roles.length).toBe(3, 'more than one role added');
    expect(component.flowExceptionList.length).toBe(1);
  });

  it('should return true if user has particular permission', () => {
    commonService.hasPermission.and.returnValue(true);
    const userHasPermission = component.hasPermission('PMGADS');
    expect(userHasPermission).toBe(true);
  });

  it('should return false if user does not have particular permission', () => {
    commonService.hasPermission.and.returnValue(false);
    const userHasPermission = component.hasPermission('PMGADS');
    expect(userHasPermission).toBe(false);
  });

  it('should remove an added partner exception for a group', () => {
    component.exceptionList = [{
      name: 'Partner 1',
      _id: 'PTR1001'

    },
    {
      attribute: 3,
      flows: [
        'FLOW2588',
        'FLOW2597',
        'FLOW2737'
      ],
      hide: true,
      name: 'Partner 2',
      selected: false,
      _id: 'PTR2005'
    }];
    const paramObj = {
        attribute: 3,
        flows: [
            'FLOW2588',
            'FLOW2597',
            'FLOW2737'
        ],
        hide: true,
        name: 'Partner 2',
        selected: false,
        _id: 'PTR2005'
    };
    component.partersList = [{
        attribute: 3,
        flows: ['FLOW2588', 'FLOW2597', 'FLOW2737'],
        name: 'Partner 2',
        selected: false,
        _id: 'PTR2005'
    },
    {
        _id: 'PTR2531',
        flows: [],
        name: 'DEFTest1',
        attribute: 0,
        selected: false
    },
    {
        attribute: 3,
        flows: ['FLOW2580', 'FLOW3597', 'FLOW2547'],
        hide: false,
        name: 'Partner 1',
        selected: false,
        _id: 'PTR1001'
    }];
    expect(component.exceptionList.length).toBe(2);
    component.removeException(paramObj);
    expect(component.exceptionList.length).toBe(1);
  });

  it('should remove an added flow exception for a group', () => {
    component.flowExceptionList = [{
      name: 'flow1',
      partner: 'PTR2036',
      _id: 'FLOW2476'
    }];

    const paramObj = {
        name: 'flow1',
        partner: 'PTR2036',
        _id: 'FLOW2476'
    };

    expect(component.flowExceptionList.length).toBe(1);
    component.removeException(paramObj, true);
    expect(component.flowExceptionList.length).toBe(0);
  });

  it('should return proper role for partner role dropdown in UI when user has proper permission I', () => {
    component.roles = [
      {_id: '5d07a0ad7d940cebff0c99d9', id: 'PNPP', app: 'Bijay-App', entity: 'PM', type: 'author'},
      {_id: '5d07a0ad7d940c75f70c99d8', id: 'PNPH', app: 'Bijay-App', entity: 'PM', type: 'author'},
      {_id: '5d07a0ad7d940c64b90c99d7', id: 'PNPB', app: 'Bijay-App', entity: 'PM', type: 'author'},
      {id: 'PNPFMD', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
      {id: 'PVPFMB', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
      {id: 'PNPFMS', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
      {id: 'PNPFMD', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
      {id: 'PNPFMB', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
      {id: 'PNPFMS', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'}
    ];
    expect(component.roles.length).toBe(9);
    spyOn(component, 'hasPermission').and.returnValue(true);
    spyOn(component, 'getPermissionObject');
    component.togglePermissionLevel('BC');
    expect(component.roles.length).toBe(10);
    });

  it('should return proper role for partner role dropdown in UI when user has proper permission II', () => {
    component.roles = [
    {_id: '5d07a0ad7d940cebff0c99d9', id: 'PMPBC', app: 'Bijay-App', entity: 'PM', type: 'author'},
    {_id: '5d07a0ad7d940c75f70c99d8', id: 'PNPH', app: 'Bijay-App', entity: 'PM', type: 'author'},
    {_id: '5d07a0ad7d940c64b90c99d7', id: 'PNPB', app: 'Bijay-App', entity: 'PM', type: 'author'},
    {id: 'PNPFMD', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
    {id: 'PVPFMB', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
    {id: 'PNPFMS', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
    {id: 'PNPFMD', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
    {id: 'PNPFMB', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
    {id: 'PNPFMS', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'}
    ];
    expect(component.roles.length).toBe(9);
    spyOn(component, 'hasPermission').and.returnValue(true);
    spyOn(component, 'getPermissionObject');
    component.togglePermissionLevel('BC');
    expect(component.roles.length).toBe(8, `roles count mismatch expected ${component.roles.length} to be 8`);
  });

  it('should return proper role for partner role dropdown in UI when user does not have proper permission', () => {
    component.roles = [];
    expect(component.roles.length).toBe(0);
    spyOn(component, 'hasPermission').and.returnValue(false);
    component.togglePermissionLevel('BC');
    expect(component.roles.length).toBe(0);
  });

  it('should return proper role for flow role dropdown in UI when user has proper permission I', () => {
        component.roles = [
            {_id: '5d07a0ad7d940cebff0c99d9', id: 'PNPP', app: 'Bijay-App', entity: 'PM', type: 'author'},
            {_id: '5d07a0ad7d940c75f70c99d8', id: 'PNPH', app: 'Bijay-App', entity: 'PM', type: 'author'},
            {_id: '5d07a0ad7d940c64b90c99d7', id: 'PNPB', app: 'Bijay-App', entity: 'PM', type: 'author'},
            {id: 'PNPFMD', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
            {id: 'PVPFMB', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
            {id: 'PNPFMS', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
            {id: 'PNPFMD', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
            {id: 'PNPFMB', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
            {id: 'PNPFMS', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'}
        ];
        expect(component.roles.length).toBe(9);
        spyOn(component, 'hasPermission').and.returnValue(true);
        spyOn(component, 'getPermissionObject');
        component.togglePermissionLevel('BC', true);
        expect(component.roles.length).toBe(10);
    });

  it('should return proper role for flow role dropdown in UI when user has proper permission II', () => {
    component.roles = [
      {_id: '5d07a0ad7d940cebff0c99d9', id: 'PNPP', app: 'Bijay-App', entity: 'PM', type: 'author'},
      {_id: '5d07a0ad7d940c75f70c99d8', id: 'PNPH', app: 'Bijay-App', entity: 'PM', type: 'author'},
      {_id: '5d07a0ad7d940c64b90c99d7', id: 'PNPB', app: 'Bijay-App', entity: 'PM', type: 'author'},
      {id: 'PMPFMBC', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
      {id: 'PVPFMB', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
      {id: 'PNPFMS', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
      {id: 'PNPFMD', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
      {id: 'PNPFMB', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'},
      {id: 'PNPFMS', app: 'Bijay-App', entity: 'FLOW_FLOW2476', type: 'author'}
    ];
    component.selectedException = {
      name: 'FLOW 1',
      _id: 'FLOW2476'
    };
    expect(component.roles.length).toBe(9);
    spyOn(component, 'hasPermission').and.returnValue(true);
    spyOn(component, 'getPermissionObject');
    component.togglePermissionLevel('BC', true);
    expect(component.roles.length).toBe(10, `roles count mismatch expected ${component.roles.length} to be 8`);
  });

  it('should return whether a partner has flows', () => {
        const pFlows = component.currentPartnerFlows('PTR1001');
        expect(pFlows).toBe(false);
    });

  it('should return true if a permission starts with certain string of characters', () => {
    commonService.hasPermissionStartsWith.and.returnValue(true);
    const psw = component.hasPermissionStartsWith('PMPFMB');
    expect(psw).toBe(true);
  });

  it('should return false if a permission does not starts with certain string of characters', () => {
    commonService.hasPermissionStartsWith.and.returnValue(false);
    const psw = component.hasPermissionStartsWith('PMPF');
    expect(psw).toBe(false);
  });
});
