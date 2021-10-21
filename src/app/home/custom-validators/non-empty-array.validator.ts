import { FormControl } from "@angular/forms";

export function arrayNonEmpty(control: FormControl) {
    const arr = control.value;
    if (arr.length == 0) {
        return { emptyArray: true };
    }
    return null;
}