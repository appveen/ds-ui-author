import { FormGroup, AsyncValidatorFn, FormControl } from '@angular/forms';
import { CommonService } from 'src/app/utils/services/common.service';


export function counterPaddingValidator(group: FormGroup) {
    const counterLength = group.get('counter').value;
    const paddingValue = group.get('padding').value;
    if (counterLength && paddingValue && counterLength.toString().length > paddingValue
        && (group.get('counter').dirty || group.get('padding').dirty)) {
        return {
            counterPadding: true
        };
    }
    return null;
}

export function counterValidator(commonService: CommonService, id: string): AsyncValidatorFn {
    return (control: FormControl) => {
        return new Promise((resolve, reject) => {
            const counterLength = control.value;
            if (counterLength !== null && control.dirty && id) {
                return commonService.get('serviceManager', '/' + id + '/' + commonService.app._id + '/idCount')
                    .toPromise().then(res => {
                        if (counterLength <= res) {
                            resolve({
                                counter: 'Invalid value for counter. Current counter value is ' + res
                            });
                        } else {
                            resolve(null);
                        }
                    }, err => {
                        commonService.errorToast(err, 'Unable to get the count.');
                    });
            }
            resolve(null);
        });
    };
}

