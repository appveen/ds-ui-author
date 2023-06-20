import { UntypedFormControl } from '@angular/forms';

export function emptyEnum(control: UntypedFormControl) {
    const enumList = control.value;
    if (enumList.length == 0) {
        return { emptyEnum: true };
    }
    return null;
}