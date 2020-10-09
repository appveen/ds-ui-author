import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';

import { SelectBlockComponent } from './select-block.component';
import { CommonService } from 'src/app/utils/services/common.service';
import { AppService } from 'src/app/utils/services/app.service';
import { SchemaBuilderService } from '../../schema-builder.service';
import { PathCreatorComponent } from '../path-creator/path-creator.component';
import { LogicalConditionComponent } from '../logical-condition/logical-condition.component';
import { FieldTypeModule } from 'src/app/utils/field-type/field-type.module';
import { IconsModule } from 'src/app/utils/icons/icons.module';
import { FilterDefinitionModule } from 'src/app/utils/pipes/filter-definition/filter-definition.module';

describe('SelectBlockComponent', () => {
  let component: SelectBlockComponent;
  let fixture: ComponentFixture<SelectBlockComponent>;
  let commonService: CommonService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [CommonService, AppService, SchemaBuilderService],
      declarations: [
        SelectBlockComponent,
        PathCreatorComponent,
        LogicalConditionComponent,
      ],
      imports: [
        NgbModule,
        FieldTypeModule,
        IconsModule,
        FilterDefinitionModule,
        HttpClientTestingModule,
        RouterTestingModule,
        ToastrModule.forRoot({}),
        ReactiveFormsModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    commonService = TestBed.get(CommonService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not call getService of commonService and store prevDataService', () => {
    component.rules = null;
    expect(component.prevDataService._id).toBeUndefined();
    component.ngOnInit();
  });

  it('should call getService of commonService and store prevDataService', async(() => {
    component.rules = [{}, {}];
    component.index = 1;
    fixture.detectChanges();
    spyOn(commonService, 'getService').and.returnValue(Promise.resolve({
      _id: 'TES1001',
      name: 'Test Service',
      definition: {
        _id: {

        },
        name: {
          type: 'String',
          properties: {
            name: 'Name'
          }
        }
      }
    }));
    component.ngOnInit();
    fixture.whenStable().then(() => {
      expect(component.prevDataService._id).toBeDefined();
    });
  }));

  it('should call selectService', async(() => {
    component.rules = [{ dataService: 'TES1001' }, { dataService: 'TES1001' }];
    component.index = 1;
    fixture.detectChanges();
    spyOn(commonService, 'getService').and.returnValue(Promise.resolve({
      _id: 'TES1001',
      name: 'Test Service',
      definition: {
        _id: {

        },
        name: {
          type: 'String',
          properties: {
            name: 'Name'
          }
        }
      }
    }));
    const spyOnSelectService = spyOn(component, 'selectService').and.callThrough();
    const spyOnAddCondition = spyOn(component, 'addCondition').and.callThrough();
    component.ngOnInit();
    fixture.whenStable().then(() => {
      expect(spyOnSelectService).toHaveBeenCalled();
      expect(component.conditions.length).toBe(1);
      expect(spyOnAddCondition).toHaveBeenCalled();
    });
  }));

  it('should call createCondition', async(() => {
    component.rules = [
      {
        dataService: 'TES1001'
      }, {
        dataService: 'TES1001',
        filter: `{
          "$and": [
              {
                  "$or": [
                      {
                          "country": {
                              "$eq": "__#USER.attributes.country1__"
                          }
                      },
                      {
                          "country": {
                              "$eq": "__#USER.attributes.country2__"
                          }
                      }
                  ]
              },
              {
                  "email": {
                      "$eq": "__#ANS.attributes.email__"
                  }
              }
          ]
      }`
      }
    ];
    component.index = 1;
    fixture.detectChanges();
    spyOn(commonService, 'getService').and.returnValue(Promise.resolve({
      _id: 'TES1001',
      name: 'Test Service',
      definition: {
        _id: {

        },
        name: {
          type: 'String',
          properties: {
            name: 'Name'
          }
        }
      }
    }));
    const spyOnCreateCondition = spyOn(component, 'createCondition').and.callThrough();
    component.ngOnInit();
    fixture.whenStable().then(() => {
      expect(spyOnCreateCondition).toHaveBeenCalled();
      expect(component.conditions.length).toBeGreaterThan(0);
    });
  }));
});
