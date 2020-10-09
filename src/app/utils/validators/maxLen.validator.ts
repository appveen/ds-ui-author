import { FormControl } from '@angular/forms';

export function natural(len: number) {
  return (control: FormControl) => {
    if (control.value && control.value.toString().length <= len) {
      return null;
    } else {
      return {
        maxLenError: true
      };
    }
  };
}
