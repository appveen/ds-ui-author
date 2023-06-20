import { UntypedFormControl } from '@angular/forms';

export function natural(len: number) {
  return (control: UntypedFormControl) => {
    if (control.value && control.value.toString().length <= len) {
      return null;
    } else {
      return {
        maxLenError: true
      };
    }
  };
}
