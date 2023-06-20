import { UntypedFormControl } from '@angular/forms';

export function ipValidate(control: UntypedFormControl) {
    const temp = control.value;
    if (temp) {
        try {
            const segments = temp.split('.');
            const lastSeg = segments[3];
            const cidr = lastSeg.split('/');
            let flag = false;
            segments[3] = cidr[0];
            if (segments.length !== 4) {
                flag = true;
            }
            for (let i = 0; i < 4; i++) {
                if (!segments[i] || segments[i].match(/[^0-9]+/g)) {
                    flag = true;
                }
                if (segments[i] !== '*' && (parseInt(segments[i], 10) < 0 || parseInt(segments[i], 10) > 255)) {
                    flag = true;
                }
            }
            if (cidr.length > 1 && parseInt(cidr[1], 10) > 32) {
                flag = true;
            }
            if (flag) {
                return {
                    ip: true
                };
            } else {
                return null;
            }
        } catch (e) {
            return {
                ip: true
            };
        }
    }
}
