import { UntypedFormControl } from "@angular/forms";

export function arrayNonEmpty(control: UntypedFormControl) {
    const arr = control.value;
    if (arr.length == 0) {
        return { emptyArray: true };
    }
    return null;
}