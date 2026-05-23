import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

export class CustomValidators {
  static skuPattern(): ValidatorFn {
    return Validators.pattern(/^[A-Za-z0-9\-_]+$/);
  }

  static positiveNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const val = control.value;
      if (val === null || val === '') return null;
      return Number(val) > 0 ? null : { positiveNumber: true };
    };
  }

  static nonNegative(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const val = control.value;
      if (val === null || val === '') return null;
      return Number(val) >= 0 ? null : { nonNegative: true };
    };
  }
}

