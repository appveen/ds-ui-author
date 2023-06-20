import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';

export function minMax(group: UntypedFormGroup) {
    const min = group.get('min');
    const max = group.get('max');
    if (!min || !max || (!min.value && min.value !== 0) || (!max.value && max.value !== 0)) {
        return null;
    }
    if (parseFloat(min.value) >= parseFloat(max.value)) {
        return { minMax: true };
    }
    return null;
}

export function minMaxLength(group: UntypedFormGroup) {
    const minlength = group.get('minlength');
    const maxlength = group.get('maxlength');
    if (!minlength || !maxlength || !minlength.value || !maxlength.value) {
        return null;
    }
    if (parseInt(minlength.value, 10) > parseInt(maxlength.value, 10)) {
        return { minMaxLength: true };
    }
    return null;
}

export function patternValidator(control: UntypedFormControl) {
    if (!control || !control.value) {
        return null;
    }
    try {
        const regEx = new RegExp(control.value);
        return null;
    } catch (e) {
        return { patternValidator: true };
    }
}

export function restrictSpecialChars(control: UntypedFormControl): { [key: string]: boolean } | null {
    if (control.value && control.value.toString().match(/^[a-zA-Z0-9-_]+$/)) {
        return null;
    } else {
        return { 'specialCharinAppName': true };
    }
}

export function maxLenValidator(len: number) {
    return (fcControl: UntypedFormControl) => {
        if (fcControl.value && fcControl.value.toString().length > len) {
            return { length: true };
        }
        return null;
    };
}