import { UntypedFormControl } from '@angular/forms';
import { ipValidate } from './ip.validator';

describe('maxLen.validator.natural', () => {
    const invalidIP1 = new UntypedFormControl('123.124.345.345');
    const invalidIP2 = new UntypedFormControl('123.124.345');
    const invalidIP3 = new UntypedFormControl('123.124.345/24');
    const validIP = new UntypedFormControl('192.168.13.56');
    const invalidCIDR = new UntypedFormControl('123.124.345.345/34');
    const validCIDR = new UntypedFormControl('192.168.13.56/24');
    it('should be valid IP', () => {
        expect(ipValidate(validIP)).toBeNull();
    });
    it('should be invalid IP one', () => {
        expect(ipValidate(invalidIP1)).not.toBeNull();
    });
    it('should be invalid IP two', () => {
        expect(ipValidate(invalidIP2)).not.toBeNull();
    });
    it('should be invalid IP three', () => {
        expect(ipValidate(invalidIP3)).not.toBeNull();
    });
    it('should be valid CIDR', () => {
        expect(ipValidate(validCIDR)).toBeNull();
    });
    it('should be invalid CIDR', () => {
        expect(ipValidate(invalidCIDR)).not.toBeNull();
    });
});
