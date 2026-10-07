import { ChangeDetectorRef, Injector } from '@angular/core';
import { AbstractControl, NgControl, TouchedChangeEvent } from '@angular/forms';
import { Observable, filter, takeUntil } from 'rxjs';

/**
 * Mirrors the touched state of the control bound to this component (formControlName /
 * formControl / ngModel) onto an internal control, so a parent `markAllAsTouched()` shows
 * validation errors inside the picker and a form reset clears them.
 *
 * Call from ngAfterContentInit: by then formControlName has set up its control, and the
 * component's own view has not been checked yet.
 */
export function syncTouchedState(
  injector: Injector,
  target: AbstractControl,
  changeDetectorRef: ChangeDetectorRef,
  destroy$: Observable<void>,
): void {
  const control = injector.get(NgControl, null, { self: true, optional: true })?.control;
  if (!control) return;

  const apply = (touched: boolean) => {
    if (touched) target.markAsTouched();
    else target.markAsUntouched();
    changeDetectorRef.markForCheck();
  };

  if (control.touched) apply(true);

  control.events
    .pipe(
      filter((e): e is TouchedChangeEvent => e instanceof TouchedChangeEvent),
      takeUntil(destroy$),
    )
    .subscribe(e => apply(e.touched));
}
