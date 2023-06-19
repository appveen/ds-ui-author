import { UntypedFormControl } from '@angular/forms';

export function number(control: UntypedFormControl) {
    if (control.value) {
        if (!control.value.toString().match(/^(-|-[1-9][0-9]*|-[1-9]|[0-9]*)$/)) {
            control.patchValue(control.value.toString().substr(0, control.value.toString().length - 1));
        }
        if (control.value.toString().length === 1 && control.value.toString()[0] === '-') {
            return { invalidNumber: true };
        }
    }
    return null;
}
