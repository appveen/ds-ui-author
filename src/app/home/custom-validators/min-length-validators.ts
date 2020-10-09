import { AbstractControl } from '@angular/forms';

export function minLengthCheck(control: AbstractControl) {
    const input = control.value;
    if (input !== null) {
        if ((control.value) < 0) {
            control.patchValue(null);
        } else {
            const regex = new RegExp('[0-9]$');
            if (regex.test(input)) {
            } else {
                control.patchValue(input.slice(0, input.length - 1));
            }
        }
    }
    return null;
}
