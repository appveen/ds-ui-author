import { UntypedFormControl } from '@angular/forms';

export function positiveNumber(control: UntypedFormControl) {
    const input = control.value;
    if (input) {
        if (!control.value.toString().match(/^[1-9][0-9]*$/)) {
            control.patchValue(control.value.toString().substr(0, control.value.toString().length - 1));
        }
    }
    return null;
}
