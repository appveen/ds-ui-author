import { UntypedFormArray, FormControl } from "@angular/forms";

export function duplicateStepName(control: UntypedFormArray) {
    const arr = control.value;

    var duplicates = arr.map(step => step.name).reduce(function (acc, el, i, arr) {
        if (arr.indexOf(el) !== i && acc.indexOf(el) < 0) acc.push(el); return acc;
    }, []);

    control.controls.forEach(step => {
        if (duplicates.indexOf(step.value.name) > -1) {
            step.setErrors({
                duplicateStepName: true
            });
        }
        else {
            if (step.hasError('duplicateStepName')) {
                step.setErrors(null);
            }
        }
    });

    return null;
}