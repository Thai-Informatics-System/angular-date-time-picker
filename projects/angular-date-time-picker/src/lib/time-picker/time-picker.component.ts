import { Component, EventEmitter, Input, Output, SimpleChanges, forwardRef } from '@angular/core';
import { AbstractControl, FormControl, NG_VALUE_ACCESSOR, ValidatorFn, Validators } from '@angular/forms';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { ValidationMessages } from '../models/validation-messages.model';
import { TimePickerDialogComponent } from './time-picker-dialog/time-picker-dialog.component';

@Component({
  selector: 'lib-time-picker',
  standalone: false,
  templateUrl: './time-picker.component.html',
  styleUrl: './time-picker.component.css',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TimePickerComponent),
    multi: true
  }]
})
export class TimePickerComponent {
  timeCtrl = new FormControl('');
  minTime: string = '00:00';
  maxTime: string = '23:59';

  @Input() label!: string;
  @Input() placeholder: string = '';
  @Input() classes: string = '';
  @Input() appearance: MatFormFieldAppearance = 'outline';
  @Input() hint!: string;
  @Input() validationMessages: ValidationMessages[] = [];
  @Input() min!: string;
  @Input() max!: string;
  @Input() required!: boolean;
  @Input() disabled!: boolean;
  @Input() isDisplayPickerLabel: boolean = false;
  /** '24' (default) keeps HH:MM; '12' shows HH:MM AM/PM while internal value stays 24h. */
  @Input() timeFormat: '12' | '24' = '24';
  @Output() timeChange = new EventEmitter<string>();

  timeStr!: string;
  touched = false;
  disable = false;
  dialogOpened = false;

  private _onDestroy = new Subject<void>();

  constructor(public dialog: MatDialog) {}

  ngOnInit() {
    this.validationMessages?.forEach(v => {
      if (v.type === 'required') {
        this.timeCtrl.setValidators(Validators.required);
        this.timeCtrl.updateValueAndValidity();
      }
    });

    this.validationMessages = [
      ...this.validationMessages,
      { type: 'minTime', message: this.timeErrorMessage },
      { type: 'maxTime', message: this.timeErrorMessage },
    ];

    if (this.required && !this.validationMessages?.length) {
      this.timeCtrl.setValidators(Validators.required);
      this.timeCtrl.updateValueAndValidity();
    }

    this.timeCtrl.valueChanges.pipe(takeUntil(this._onDestroy), debounceTime(400)).subscribe((time: any) => {
      if (this.timeFormat !== '12') this.timeStr = time;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['disabled']) {
      this.disabled = changes['disabled'].currentValue;
      this.setDisabledState(this.disabled);
    }
    if (changes['required']) {
      this.required = changes['required'].currentValue;
      if (this.required && !this.validationMessages?.length) {
        this.timeCtrl.setValidators(Validators.required);
        this.timeCtrl.updateValueAndValidity();
      } else if (!this.required && !this.validationMessages?.length) {
        this.timeCtrl.removeValidators(Validators.required);
        this.timeCtrl.updateValueAndValidity();
      }
    }
    if (changes['min']) {
      this.min = changes['min'].currentValue;
      this.minTime = this.min || '00:00';
      this.timeCtrl.setValidators([timeRangeValidator(this.minTime, this.maxTime)]);
    }
    if (changes['max']) {
      this.max = changes['max'].currentValue;
      this.maxTime = this.max || '23:59';
      this.timeCtrl.setValidators([timeRangeValidator(this.minTime, this.maxTime)]);
    }
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  /* eslint-disable */
  onChanged = (time: string) => {}
  onTouched = () => {}

  registerOnChange(fn: any) { this.onChanged = fn; }
  registerOnTouched(fn: any) { this.onTouched = fn; }

  writeValue(value: string): void {
    if (value) {
      this.timeStr = value;
      this.timeCtrl.setValue(this.timeFormat === '12' ? this.to12h(value) : value);
    } else {
      this.timeStr = '00:00';
      this.timeCtrl.setValue(this.timeFormat === '12' ? '' : '00:00');
    }
  }

  private to12h(time24: string): string {
    const parts = (time24 || '00:00').split(':');
    const hh = parseInt(parts[0] || '0', 10);
    const mm = parts[1] ?? '00';
    const period = hh < 12 ? 'AM' : 'PM';
    const h12 = hh % 12 || 12;
    return `${h12.toString().padStart(2, '0')}:${mm} ${period}`;
  }

  get displayPlaceholder(): string {
    if (this.placeholder) return this.placeholder;
    if (this.timeFormat === '12') return '00:00 --';
    return 'HH:MM';
  }

  setDateValue(time: string) {
    this.timeStr = time;
    this.timeCtrl.setValue(this.timeFormat === '12' ? this.to12h(time) : time);
    this.onChanged(time);
    this.timeChange.emit(time);
  }

  markAsTouched() {
    if (!this.touched) { this.onTouched(); this.touched = true; }
  }

  setDisabledState(isDisabled: boolean): void {
    this.disable = isDisabled;
    if (this.disabled || this.disable) this.timeCtrl.disable();
    else this.timeCtrl.enable();
  }

  openPicker(event: any): void {
    event.stopPropagation();
    event.preventDefault();
    if (this.disable) return;
    this.dialogOpened = true;
    const ref = this.dialog.open(TimePickerDialogComponent, {
      data: {
        label: this.isDisplayPickerLabel && this.label ? this.label : null,
        time: this.timeStr,
        min: this.min,
        max: this.max,
        timeFormat: this.timeFormat,
      },
      panelClass: ['lib-time-picker-dialog']
    });
    ref.afterClosed().subscribe((time: string | null) => {
      this.dialogOpened = false;
      if (time) this.setDateValue(time);
    });
  }

  get timeErrorMessage(): string {
    if (this.timeCtrl.hasError('minTime')) return `Time cannot be earlier than ${this.minTime}`;
    if (this.timeCtrl.hasError('maxTime')) return `Time cannot be later than ${this.maxTime}`;
    return '';
  }
}

export function timeRangeValidator(minTime: string, maxTime: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (!value) return null;
    if (value < minTime) return { minTime: true };
    if (value > maxTime) return { maxTime: true };
    return null;
  };
}
