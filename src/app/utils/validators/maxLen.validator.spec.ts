import { UntypedFormControl } from '@angular/forms';
import { natural } from './maxLen.validator';

describe('maxLen.validator.natural', () => {
    const control = new UntypedFormControl(1234);
    it('should be null', () => {
        expect(natural(4)(control)).toBeNull();
    });
    it('should be maxLenError', () => {
        expect(natural(3)(control)).not.toBeNull();
    });
});
