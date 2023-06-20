import { UntypedFormControl } from '@angular/forms';

export function wizardSteps(control: UntypedFormControl) {
    const steps = control.value;
    const ifEmptySteps = steps.findIndex(data => data.fields.length == 0)

    if (ifEmptySteps != -1) {
        return { emptySteps: true };
    }
    return null;
}