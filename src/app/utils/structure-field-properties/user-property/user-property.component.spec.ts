import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPropertyComponent } from './user-property.component';
import { CommonService, GetOptions } from '../../services/common.service';
import { AppService } from '../../services/app.service';
import { SchemaBuilderService } from 'src/app/home/schema-utils/schema-builder.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FieldTypeModule } from '../../field-type/field-type.module';
import { FilterDefinitionModule } from '../../pipes/filter-definition/filter-definition.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrModule } from 'ngx-toastr';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, FormArray } from '@angular/forms';
import { DeleteModalComponent } from '../../delete-modal/delete-modal.component';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('UserPropertyComponent', () => {
  let component: UserPropertyComponent;
  let fixture: ComponentFixture<UserPropertyComponent>;
  let commonService: CommonService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [CommonService, AppService, SchemaBuilderService],
      declarations: [
        UserPropertyComponent,
        DeleteModalComponent
      ],
      imports: [
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
        FieldTypeModule,
        FilterDefinitionModule,
        HttpClientTestingModule,
        RouterTestingModule,
        ToastrModule.forRoot({})
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserPropertyComponent);
    component = fixture.componentInstance;
    commonService = TestBed.get(CommonService);
    commonService.app = {}

    component.form = new FormGroup({
      name: new FormControl(),
      properties: new FormGroup({
        name: new FormControl(),
        default: new FormControl(),
        _listInput: new FormControl(),
        relatedViewFields: new FormArray([])
      })
    })
    component.edit = {
    }
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should declare the properties attribute', () => {
    expect(component.properties).toBeDefined();
  });

 
  it('should add the value to relatedViewFields control ', () => {
    let temp = component.properties.get('relatedViewFields').value.length
    component.addToList('relatedViewFields', 'fieldValue')
    expect(component.properties.get('relatedViewFields').value.length).toBeGreaterThan(temp);
  });

  it('should not add the empty value to relatedViewFields control', () => {
    let temp = component.properties.get('relatedViewFields').value.length
    component.addToList('relatedViewFields')
    expect(component.properties.get('relatedViewFields').value.length).toBe(temp);
  });


  it('should not add the duplicate value to relatedViewFields control', () => {
    component.addToList('relatedViewFields', 'fieldValue')
    let temp = component.properties.get('relatedViewFields').value.length
    component.addToList('relatedViewFields', 'fieldValue')
    expect(component.properties.get('relatedViewFields').value.length).toBe(temp);
  });


  it('should get all the users', () => {
    const userList = [{
      username: 'sowbhagya@appveen.com',
      basicDetails: {
        alternateEmail: '',
        name: 'sowbhagya'
      }
    }]
    spyOn(commonService, 'get').and.returnValue(of(userList))
    expect(component.documents.length).toBe(0);
    component.getDocuments();
    expect(component.documents.length).toBe(1);
  })


  
















});
