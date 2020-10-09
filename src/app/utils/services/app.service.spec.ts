import { TestBed, inject } from '@angular/core/testing';

import { AppService } from './app.service';

describe('AppService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppService]
    });
  });

  it('should be created', inject([AppService], (service: AppService) => {
    expect(service).toBeTruthy();
  }));
  it('should be defined', inject([AppService], (service: AppService) => {
    expect(service.toggleSideNav).toBeDefined();
    expect(service.resetUserPwd).toBeDefined();
    expect(service.openAppSwitcher).toBeDefined();
    expect(service.detectPermissionChange).toBeDefined();
    expect(service.setFocus).toBeDefined();
  }));
  it('getDefaultRoles() should not be null', inject([AppService], (service: AppService) => {
    expect(service.getDefaultRoles()).not.toBeNull();
  }));
  it('getUUID() should not be null', inject([AppService], (service: AppService) => {
    expect(service.getUUID()).not.toBeNull();
  }));
  it('getValue(null, null) should be null', inject([AppService], (service: AppService) => {
    expect(service.getValue(null, null)).toBeNull();
  }));
  it('getValue(name, { name: \'john\' }) should be john', inject([AppService], (service: AppService) => {
    expect(service.getValue('name', { name: 'john' })).toEqual('john');
  }));
  it('getValue(name.firstname, { name: { firstname: \'john\' } }) should be john', inject([AppService], (service: AppService) => {
    expect(service.getValue('name.firstname', { name: { firstname: 'john' } })).toEqual('john');
  }));
  it('getValue(basic.email, { name: { firstname: \'john\' }) should be null', inject([AppService], (service: AppService) => {
    expect(service.getValue('basic.email', { name: { firstname: 'john' } })).toBeNull();
  }));
  it('getFormatTypeList() should be equal', inject([AppService], (service: AppService) => {
    expect(service.getFormatTypeList()).toEqual(formatList);
  }));
  it('isValidURL(null) should be false', inject([AppService], (service: AppService) => {
    expect(service.isValidURL(null)).toBe(false);
  }));
  it('isValidURL(http://hello) should be false', inject([AppService], (service: AppService) => {
    expect(service.isValidURL('http://hello')).toBe(false);
  }));
  it('isValidURL(http://www.google.com) should be true', inject([AppService], (service: AppService) => {
    expect(service.isValidURL('http://www.google.com')).toBe(true);
  }));
  it('copyToClipboard(some text to copy) should return undefined', inject([AppService], (service: AppService) => {
    expect(service.copyToClipboard('some text to copy')).toBeUndefined();
  }));
  it('toCamelCase(some text) should return someText', inject([AppService], (service: AppService) => {
    expect(service.toCamelCase('some text')).toEqual('someText');
    expect(service.toCamelCase('some text again')).toEqual('someTextAgain');
    expect(service.toCamelCase('')).toEqual('');
  }));
  it('toCapitalize(some text) should return Some Text', inject([AppService], (service: AppService) => {
    expect(service.toCapitalize('some text')).toEqual('Some text');
    expect(service.toCapitalize('some text again')).toEqual('Some text again');
    expect(service.toCapitalize('')).toEqual('');
  }));
  it('isEqual() should return true', inject([AppService], (service: AppService) => {
    expect(service.isEqual({ hello: 'world' }, { hello: 'world' })).toEqual(true);
  }));
  it('isEqual() should return false', inject([AppService], (service: AppService) => {
    expect(service.isEqual({ hello: 'world' }, { hello: 'world', one: 'two' })).toEqual(true);
  }));
  it('getIpFormControl() should return an object', inject([AppService], (service: AppService) => {
    expect(service.getIpFormControl()).not.toBeNull();
  }));
  it('getSortQuery({name:\'asc\',age:\'desc\'}) should return name,-age', inject([AppService], (service: AppService) => {
    expect(service.getSortQuery({ name: 'asc', age: 'desc' })).toEqual('name,-age');
  }));
  it('randomID(5) should return an ID of 5 character', inject([AppService], (service: AppService) => {
    expect(service.randomID(5)).toMatch(/[A-Z]{5}/);
  }));
  it('randomID(7) should return an ID of 7 character', inject([AppService], (service: AppService) => {
    expect(service.randomID(7)).toMatch(/[A-Z]{7}/);
  }));
  it('randomStr(5) should return an string of 5 character', inject([AppService], (service: AppService) => {
    expect(service.randomStr(5)).toMatch(/[A-Za-z0-9]{5}/);
  }));
  it('randomStr(7) should return an string of 7 character', inject([AppService], (service: AppService) => {
    expect(service.randomStr(7)).toMatch(/[A-Za-z0-9]{7}/);
  }));
  it('flattenObject() should return a flattened structure', inject([AppService], (service: AppService) => {
    expect(service.flattenObject({
      name: {
        first: 'john',
        last: 'doe',
      },
      email: 'john@doe.com',
      addresses: [
        {
          stOne: 'one',
          pincode: 907865
        }
      ]
    })).toEqual({
      'name.first': 'john',
      'name.last': 'doe',
      'email': 'john@doe.com',
      'addresses.0.stOne': 'one',
      'addresses.0.pincode': 907865
    });
  }));
  it('unFlattenObject() should return a unflattened structure', inject([AppService], (service: AppService) => {
    expect(service.unFlattenObject({
      'name.first': 'john',
      'name.last': 'doe',
      'email': 'john@doe.com',
      'addresses.0.stOne': 'one',
      'addresses.0.pincode': 907865
    })).toEqual({
      name: {
        first: 'john',
        last: 'doe'
      },
      email: 'john@doe.com',
      addresses: [
        {
          stOne: 'one',
          pincode: 907865
        }
      ]
    });
  }));
  it('cloneObject should be called', inject([AppService], (service: AppService) => {
    const obj = {
      name: 'John Doe',
      email: 'john@doe.com'
    };
    expect(service.cloneObject(obj)).toEqual(obj);
  }));
});


const formatList = [
  {
    label: 'XML',
    formatType: 'XML',
  },
  {
    label: 'xls',
    formatType: 'EXCEL',
    excelType: 'xls'
  },
  {
    label: 'xlsx',
    formatType: 'EXCEL',
    excelType: 'xlsx'
  },
  {
    label: 'Fixed',
    formatType: 'FLATFILE'
  },
  {
    label: 'CSV',
    formatType: 'CSV',
    character: ','
  },
  {
    label: 'Delimiter',
    formatType: 'DELIMITER',
    character: ','
  },
  {
    label: 'JSON',
    formatType: 'JSON',
    selected: true
  }
];
