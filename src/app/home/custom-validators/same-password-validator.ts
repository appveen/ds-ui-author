import { AbstractControl } from '@angular/forms';

export function matchPassword(form: AbstractControl) {
    const password = form.get('password').value;
    const confirmPassword = form.get('cpassword').value;
    if (!password || !confirmPassword) {
        return { match: 'Passwords do not match' };
    }
    if (password === confirmPassword) {
        return null;
    } else {
        return { match: 'Passwords do not match' };
    }
}
