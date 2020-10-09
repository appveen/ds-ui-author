import { TestBed, inject } from '@angular/core/testing';

import { FormulaBuilderService } from './formula-builder.service';
import { MapperFormula } from './formula-builder.component';

describe('FormulaBuilderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FormulaBuilderService]
    });
  });

  it('should be created', inject([FormulaBuilderService], (service: FormulaBuilderService) => {
    expect(service).toBeTruthy();
  }));

  it('restrictKey should return true for Control', inject([FormulaBuilderService], (service: FormulaBuilderService) => {
    const event = new KeyboardEvent('keyup', {
      key: 'Control'
    });
    expect(service.restrictKey(event)).toBe(true);
  }));
  it('restrictKey should return true for Shift', inject([FormulaBuilderService], (service: FormulaBuilderService) => {
    const event = new KeyboardEvent('keyup', {
      key: 'Shift'
    });
    expect(service.restrictKey(event)).toBe(true);
  }));
  it('restrictKey should return true for Alt', inject([FormulaBuilderService], (service: FormulaBuilderService) => {
    const event = new KeyboardEvent('keyup', {
      key: 'Alt'
    });
    expect(service.restrictKey(event)).toBe(true);
  }));
  it('restrictKey should return true for CapsLock', inject([FormulaBuilderService], (service: FormulaBuilderService) => {
    const event = new KeyboardEvent('keyup', {
      key: 'CapsLock'
    });
    expect(service.restrictKey(event)).toBe(true);
  }));
  it('restrictKey should return true for Tab', inject([FormulaBuilderService], (service: FormulaBuilderService) => {
    const event = new KeyboardEvent('keyup', {
      key: 'Tab'
    });
    expect(service.restrictKey(event)).toBe(true);
  }));
  it('restrictKey should return true for Escape', inject([FormulaBuilderService], (service: FormulaBuilderService) => {
    const event = new KeyboardEvent('keyup', {
      key: 'Escape'
    });
    expect(service.restrictKey(event)).toBe(true);
  }));
  it('restrictKey should return true for Meta', inject([FormulaBuilderService], (service: FormulaBuilderService) => {
    const event = new KeyboardEvent('keyup', {
      key: 'Meta'
    });
    expect(service.restrictKey(event)).toBe(true);
  }));

  it('restrictKey should return false', inject([FormulaBuilderService], (service: FormulaBuilderService) => {
    const event = new KeyboardEvent('keyup', {
      key: 'a'
    });
    expect(service.restrictKey(event)).toBe(false);
  }));

  it('removeFunction should execute one', inject([FormulaBuilderService], (service: FormulaBuilderService) => {
    const formula: MapperFormula = {
      operation: 'fn:concat'
    };
    const spy = spyOn(service, 'removeFunction').and.callThrough();
    service.removeFunction(formula, 'fn:concat');
    expect(spy).toHaveBeenCalledTimes(1);
  }));

  it('removeFunction should execute two', inject([FormulaBuilderService], (service: FormulaBuilderService) => {
    const formula: MapperFormula = {
      operation: 'fn:concat',
      _args: [
        { operation: 'hello' }
      ]
    };
    const spy = spyOn(service, 'removeFunction').and.callThrough();
    service.removeFunction(formula, 'sum');
    expect(spy).toHaveBeenCalledTimes(2);
  }));

  it('cleanPayload should execute one', inject([FormulaBuilderService], (service: FormulaBuilderService) => {
    const formula: MapperFormula = {
      operation: 'fn:concat'
    };
    const spy = spyOn(service, 'cleanPayload').and.callThrough();
    service.cleanPayload(formula);
    expect(spy).toHaveBeenCalledTimes(1);
  }));

  it('cleanPayload should execute two', inject([FormulaBuilderService], (service: FormulaBuilderService) => {
    const formula: MapperFormula = {
      operation: 'fn:concat',
      _args: [
        { operation: 'hello' }
      ]
    };
    const spy = spyOn(service, 'cleanPayload').and.callThrough();
    service.cleanPayload(formula);
    expect(spy).toHaveBeenCalledTimes(2);
  }));

  it('patchData should execute one', inject([FormulaBuilderService], (service: FormulaBuilderService) => {
    const formula: MapperFormula = {
      operation: 'fn:concat',
      XPath: './name/'
    };
    const spy = spyOn(service, 'patchData').and.callThrough();
    service.patchData(formula);
    expect(spy).toHaveBeenCalledTimes(1);
  }));

  it('patchData should execute two', inject([FormulaBuilderService], (service: FormulaBuilderService) => {
    const formula: MapperFormula = {
      operation: '',
      _args: [
        {
          operation: 'fn:conca',
          XPath: './name/'
        }
      ]
    };
    const spy = spyOn(service, 'patchData').and.callThrough();
    service.patchData(formula);
    expect(spy).toHaveBeenCalledTimes(2);
  }));

  it('getFunctionList should not be null', inject([FormulaBuilderService], (service: FormulaBuilderService) => {
    expect(service.getFunctionList()).not.toBeNull();
  }));

});
