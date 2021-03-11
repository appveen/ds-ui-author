import { FormArray, FormGroup } from '@angular/forms';

export function sameName(control: FormArray) {
    for (let i = 0; i < control.controls.length - 1; i++) {
        const idControl = control.controls.find(c => c.get('key').value === '_id');
        const sameNameErr = control.controls.find(
            e =>
                e.get('key').value !== '_id' &&
                e.get('properties.name') &&
                idControl &&
                e.get('properties.name').value === idControl.get('properties.name').value
        );
        if (sameNameErr) {
            sameNameErr.setErrors({ sameName: true });
        }
        if (i !== 0) {
            for (let j = 1; j < control.controls.length; j++) {
                if (
                    i !== j &&
                    control.get([i, 'key']).value &&
                    control.get([j, 'key']).value &&
                    control.get([i, 'key']).value === control.get([j, 'key']).value
                ) {
                    control.at(j).setErrors({ sameName: true });
                    control.at(i).setErrors({ sameName: true });
                    return null;
                } else {
                    const errorOne = control.at(i).errors;
                    if (errorOne) {
                        delete errorOne.sameName;
                        if (Object.keys(errorOne).length > 0) {
                            control.at(i).setErrors(errorOne);
                        } else {
                            control.at(i).setErrors(null);
                        }
                    }
                    const errorTwo = control.at(i).errors;
                    if (errorTwo) {
                        delete errorTwo.sameName;
                        if (Object.keys(errorTwo).length > 0) {
                            control.at(j).setErrors(errorTwo);
                        } else {
                            control.at(j).setErrors(null);
                        }
                    }
                }
            }
        }
    }
    return null;
}
