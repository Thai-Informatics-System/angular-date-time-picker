import { Component, EventEmitter, Input, Output, SimpleChanges, forwardRef } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { DatePickerDialogComponent } from './date-picker-dialog/date-picker-dialog.component';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { ValidationMessages } from '../models/validation-messages.model';

@Component({
  selector: 'lib-date-picker',
  standalone: false,
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.css',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DatePickerComponent),
    multi: true
  }]
})
export class DatePickerComponent {
  dateCtrl = new FormControl('');
  tempDate!: string;

  @Input() label!: string;
  @Input() placeholder: string = '';
  @Input() isLabelOutside = false;
  @Input() dateFormate: string = 'DD/MM/YYYY';
  @Input() classes: string = '';
  @Input() appearance: MatFormFieldAppearance = 'outline';
  @Input() hint!: string;
  @Input() validationMessages: ValidationMessages[] = [];
  @Input() min!: Date | number;
  @Input() max!: Date | number;
  @Input() required!: boolean;
  @Input() disabled!: boolean;
  @Input() isDisplayPickerLabel: boolean = false;
  @Output() dateChange = new EventEmitter<Date>();

  date!: Date;
  touched = false;
  disable = false;
  dialogOpened = false;

  private _onDestroy = new Subject<void>();

  constructor(public dialog: MatDialog) {}

  private toDate(value: Date | number): Date {
    return typeof value === 'number' ? new Date(value) : value;
  }

  get minDate(): Date | null {
    return this.min ? this.toDate(this.min) : null;
  }

  get maxDate(): Date | null {
    return this.max ? this.toDate(this.max) : null;
  }

  ngOnInit() {
    this.validationMessages?.forEach(v => {
      if (v.type === 'required') {
        this.dateCtrl.setValidators(Validators.required);
        this.dateCtrl.updateValueAndValidity();
      }
    });

    if (this.required && !this.validationMessages?.length) {
      this.dateCtrl.setValidators(Validators.required);
      this.dateCtrl.updateValueAndValidity();
    }

    this.dateCtrl.valueChanges.pipe(takeUntil(this._onDestroy), debounceTime(600)).subscribe((dateStr: any) => {
      if (dateStr && typeof dateStr === 'string' && dateStr.length >= 8) {
        const parsedDate = this.parseDate(dateStr);
        if (parsedDate && !isNaN(parsedDate.getTime())) {
          if (!this.date || this.date.getTime() !== parsedDate.getTime()) {
            let validDate = parsedDate;
            if (this.minDate && this.getDateEpoch(this.minDate) > this.getDateEpoch(parsedDate)) {
              validDate = this.minDate;
            } else if (this.maxDate && this.getDateEpoch(this.maxDate) < this.getDateEpoch(parsedDate)) {
              validDate = this.maxDate;
            }
            setTimeout(() => {
              this.date = validDate;
              if (validDate !== parsedDate) {
                this.dateCtrl.setValue(this.dateFormat(validDate), { emitEvent: false });
              }
              this.onChanged(this.date);
              this.dateChange.emit(this.date);
            }, 20);
          }
        }
      } else if (!dateStr || dateStr === '') {
        this.date = null as any;
        this.onChanged(null as any);
        this.dateChange.emit(null as any);
      }
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
        this.dateCtrl.setValidators(Validators.required);
        this.dateCtrl.updateValueAndValidity();
      } else if (!this.required && !this.validationMessages?.length) {
        this.dateCtrl.removeValidators(Validators.required);
        this.dateCtrl.updateValueAndValidity();
      }
    }
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  /* eslint-disable */
  onChanged = (date: Date) => {}
  onTouched = () => {}

  registerOnChange(fn: any) { this.onChanged = fn; }
  registerOnTouched(fn: any) { this.onTouched = fn; }

  writeValue(value: Date): void {
    if (value) {
      this.date = new Date(value);
      const date = this.dateFormat(this.date);
      this.dateCtrl.setValue(date);
      this.tempDate = date;
    } else {
      this.dateCtrl.setValue(null);
    }
  }

  public dateFormat(date: Date): string {
    const day = date.getDate();
    const dayStr = day < 10 ? '0' + day : '' + day;
    const month = date.getMonth() + 1;
    const monthStr = month < 10 ? '0' + month : '' + month;
    const year = date.getFullYear().toString().padStart(4, '0');
    const fmt = this.dateFormate || 'DD/MM/YYYY';
    if (fmt === 'MM/DD/YYYY') return `${monthStr}/${dayStr}/${year}`;
    if (fmt === 'YYYY/MM/DD') return `${year}/${monthStr}/${dayStr}`;
    if (fmt === 'YYYY-MM-DD') return `${year}-${monthStr}-${dayStr}`;
    if (fmt === 'DD-MM-YYYY') return `${dayStr}-${monthStr}-${year}`;
    if (fmt === 'MM-DD-YYYY') return `${monthStr}-${dayStr}-${year}`;
    return `${dayStr}/${monthStr}/${year}`;
  }

  public parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    const fmt = this.dateFormate || 'DD/MM/YYYY';
    const delim = fmt.includes('/') ? '/' : '-';
    const parts = dateStr.split(delim);
    if (parts.length !== 3) return null;
    let day: number, month: number, year: number;
    if (fmt === 'DD/MM/YYYY' || fmt === 'DD-MM-YYYY') {
      [day, month, year] = parts.map(Number);
    } else if (fmt === 'MM/DD/YYYY' || fmt === 'MM-DD-YYYY') {
      [month, day, year] = parts.map(Number);
    } else {
      [year, month, day] = parts.map(Number);
    }
    if (isNaN(day!) || isNaN(month!) || isNaN(year!)) return null;
    if (day! < 1 || day! > 31 || month! < 1 || month! > 12) return null;
    const d = new Date(year!, month! - 1, day!);
    if (d.getDate() !== day! || d.getMonth() !== month! - 1 || d.getFullYear() !== year!) return null;
    return d;
  }

  getDateEpoch(date: Date) { return date.getTime(); }

  getDatePattern(): string {
    const fmt = this.dateFormate || 'DD/MM/YYYY';
    if (fmt === 'DD/MM/YYYY') return '^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/[0-9]{4}$';
    if (fmt === 'MM/DD/YYYY') return '^(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])/[0-9]{4}$';
    if (fmt === 'YYYY/MM/DD') return '^[0-9]{4}/(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])$';
    if (fmt === 'DD-MM-YYYY') return '^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4}$';
    if (fmt === 'MM-DD-YYYY') return '^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-[0-9]{4}$';
    if (fmt === 'YYYY-MM-DD') return '^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$';
    return '^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/[0-9]{4}$';
  }

  getPlaceholder(): string {
    return this.dateFormate || 'DD/MM/YYYY';
  }

  onKeyDown(event: KeyboardEvent): void {
    const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'];
    if (allowed.includes(event.key)) return;
    if (event.ctrlKey && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) return;
    if (!/[0-9]/.test(event.key)) { event.preventDefault(); return; }

    const input = event.target as HTMLInputElement;
    const fmt = this.dateFormate || 'DD/MM/YYYY';
    const delim = fmt.includes('/') ? '/' : '-';
    const digits = input.value.replace(/[^0-9]/g, '');
    if (digits.length >= 8) { event.preventDefault(); return; }
    const next = digits.length + 1;

    const addDelim = (pos1: number, pos2: number) => {
      if (next === pos1 || next === pos2) {
        event.preventDefault();
        setTimeout(() => {
          const v = input.value + event.key + delim;
          this.dateCtrl.setValue(v);
          input.setSelectionRange(v.length, v.length);
        }, 0);
      }
    };

    if (fmt.startsWith('YYYY')) addDelim(4, 6);
    else addDelim(2, 4);
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const fmt = this.dateFormate || 'DD/MM/YYYY';
    const delim = fmt.includes('/') ? '/' : '-';
    const clean = input.value.replace(new RegExp(`[^0-9${delim === '/' ? '/' : '-'}]`, 'g'), '');
    if (clean.replace(/[^0-9]/g, '').length > 8) return;
    if (clean !== input.value) {
      this.dateCtrl.setValue(clean, { emitEvent: false });
      setTimeout(() => input.setSelectionRange(clean.length, clean.length), 0);
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const paste = event.clipboardData?.getData('text') || '';
    const parsed = this.parseDate(paste);
    if (parsed) {
      this.dateCtrl.setValue(this.dateFormat(parsed));
    } else {
      const nums = paste.replace(/\D/g, '');
      if (nums.length >= 4) {
        const fmt = this.dateFormate || 'DD/MM/YYYY';
        const delim = fmt.includes('/') ? '/' : '-';
        let out = '';
        for (let i = 0; i < nums.length && i < 8; i++) {
          if (i === 2 || i === 4) out += delim;
          out += nums[i];
        }
        this.dateCtrl.setValue(out);
      }
    }
  }

  onFocus(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    setTimeout(() => input.setSelectionRange(input.value.length, input.value.length), 0);
  }

  setDateValue(date: Date) {
    this.writeValue(date);
    this.onChanged(date);
    this.dateChange.emit(date);
  }

  markAsTouched() {
    if (!this.touched) { this.onTouched(); this.touched = true; }
  }

  setDisabledState(isDisabled: boolean): void {
    this.disable = isDisabled;
    if (this.disabled || this.disable) this.dateCtrl.disable();
    else this.dateCtrl.enable();
  }

  openPicker(event: any): void {
    event.stopPropagation();
    event.preventDefault();
    if (this.disable) return;
    this.dialogOpened = true;
    const ref = this.dialog.open(DatePickerDialogComponent, {
      data: {
        label: this.isDisplayPickerLabel && this.label ? this.label : null,
        date: this.date,
        min: this.minDate,
        max: this.maxDate,
      },
      panelClass: ['lib-date-picker-dialog']
    });
    ref.afterClosed().subscribe((date: Date | null) => {
      this.dialogOpened = false;
      if (date) this.setDateValue(date);
    });
  }

  get checkValidation() {
    return this.dateCtrl.hasValidator(Validators.required);
  }
}
