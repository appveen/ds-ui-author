import { FormControl } from '@angular/forms';

export function emptyEnum(control: FormControl) {
    const enumList = control.value;
    if (enumList.length == 0) {
        return { emptyEnum: true };
    }
    return null;
}