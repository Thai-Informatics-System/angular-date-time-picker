import { Component, EventEmitter, Input, Output, SimpleChanges, forwardRef } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { DateTimePickerDialogComponent } from './date-time-picker-dialog/date-time-picker-dialog.component';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { ValidationMessages } from '../models/validation-messages.model';

@Component({
  selector: 'date-time-picker',
  standalone: false,
  templateUrl: './date-time-picker.component.html',
  styleUrl: './date-time-picker.component.css',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DateTimePickerComponent),
    multi: true
  }]
})
export class DateTimePickerComponent {
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
  @Input() timeFormat: '12' | '24' = '24';
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

  get minDate(): Date | null { return this.min ? this.toDate(this.min) : null; }
  get maxDate(): Date | null { return this.max ? this.toDate(this.max) : null; }

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

    this.dateCtrl.valueChanges.pipe(takeUntil(this._onDestroy), debounceTime(600)).subscribe((v: any) => {
      if (v && typeof v === 'string') {
        const parsed = this.parseDateTime(v);
        if (parsed && !isNaN(parsed.getTime())) {
          if (!this.date || this.date.getTime() !== parsed.getTime()) {
            let valid = parsed;
            if (this.minDate && this.minDate.getTime() > parsed.getTime()) valid = this.minDate;
            else if (this.maxDate && this.maxDate.getTime() < parsed.getTime()) valid = this.maxDate;
            setTimeout(() => {
              this.date = valid;
              if (valid !== parsed) this.dateCtrl.setValue(this.dateTimeFormat(valid), { emitEvent: false });
              this.onChanged(this.date);
              this.dateChange.emit(this.date);
            }, 20);
          }
        }
      } else if (!v || v === '') {
        this.date = null as any;
        this.onChanged(null as any);
        this.dateChange.emit(null as any);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['disabled']) { this.disabled = changes['disabled'].currentValue; this.setDisabledState(this.disabled); }
    if (changes['required']) {
      this.required = changes['required'].currentValue;
      if (this.required && !this.validationMessages?.length) {
        this.dateCtrl.setValidators(Validators.required); this.dateCtrl.updateValueAndValidity();
      } else if (!this.required && !this.validationMessages?.length) {
        this.dateCtrl.removeValidators(Validators.required); this.dateCtrl.updateValueAndValidity();
      }
    }
  }

  ngOnDestroy() { this._onDestroy.next(); this._onDestroy.complete(); }

  /* eslint-disable */
  onChanged = (date: Date) => {}
  onTouched = () => {}
  registerOnChange(fn: any) { this.onChanged = fn; }
  registerOnTouched(fn: any) { this.onTouched = fn; }

  writeValue(value: Date): void {
    if (value) {
      this.date = new Date(value);
      const str = this.dateTimeFormat(this.date);
      this.dateCtrl.setValue(str);
      this.tempDate = str;
    } else {
      this.dateCtrl.setValue(null);
    }
  }

  private dateTimeFormat(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().padStart(4, '0');
    const fmt = this.dateFormate || 'DD/MM/YYYY';
    let datePart = `${day}/${month}/${year}`;
    if (fmt === 'MM/DD/YYYY') datePart = `${month}/${day}/${year}`;
    else if (fmt === 'YYYY/MM/DD') datePart = `${year}/${month}/${day}`;
    else if (fmt === 'YYYY-MM-DD') datePart = `${year}-${month}-${day}`;
    else if (fmt === 'DD-MM-YYYY') datePart = `${day}-${month}-${year}`;
    else if (fmt === 'MM-DD-YYYY') datePart = `${month}-${day}-${year}`;

    if (this.timeFormat === '12') {
      const h24 = date.getHours();
      const period = h24 < 12 ? 'AM' : 'PM';
      const h12 = (h24 % 12 || 12).toString().padStart(2, '0');
      const mm = date.getMinutes().toString().padStart(2, '0');
      return `${datePart} ${h12}:${mm} ${period}`;
    }
    const hh = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    return `${datePart} ${hh}:${mm}`;
  }

  public parseDateTime(str: string): Date | null {
    if (!str) return null;

    if (this.timeFormat === '12') {
      // Expected: "DD/MM/YYYY HH:MM AM" or "DD/MM/YYYY HH:MM PM"
      const parts = str.trim().split(' ');
      if (parts.length !== 3) return null;
      const d = this.parseDate(parts[0]);
      if (!d) return null;
      const m = parts[1].match(/^(\d{1,2}):(\d{2})$/);
      if (!m) return null;
      const ampm = parts[2].toUpperCase();
      if (ampm !== 'AM' && ampm !== 'PM') return null;
      let h = parseInt(m[1], 10);
      const min = parseInt(m[2], 10);
      if (h < 1 || h > 12 || min < 0 || min > 59) return null;
      h = ampm === 'AM' ? (h === 12 ? 0 : h) : (h === 12 ? 12 : h + 12);
      d.setHours(h, min, 0, 0);
      return d;
    }

    const parts = str.split(' ');
    if (parts.length !== 2) return null;
    const d = this.parseDate(parts[0]);
    if (!d) return null;
    const m = parts[1].match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    const h = parseInt(m[1], 10), min = parseInt(m[2], 10);
    if (h < 0 || h > 23 || min < 0 || min > 59) return null;
    d.setHours(h, min, 0, 0);
    return d;
  }

  public parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    const fmt = this.dateFormate || 'DD/MM/YYYY';
    const delim = fmt.includes('/') ? '/' : '-';
    const parts = dateStr.split(delim);
    if (parts.length !== 3) return null;
    let day: number, month: number, year: number;
    if (fmt === 'DD/MM/YYYY' || fmt === 'DD-MM-YYYY') { [day, month, year] = parts.map(Number); }
    else if (fmt === 'MM/DD/YYYY' || fmt === 'MM-DD-YYYY') { [month, day, year] = parts.map(Number); }
    else { [year, month, day] = parts.map(Number); }
    if (isNaN(day!) || isNaN(month!) || isNaN(year!)) return null;
    if (day! < 1 || day! > 31 || month! < 1 || month! > 12) return null;
    const d = new Date(year!, month! - 1, day!);
    if (d.getDate() !== day! || d.getMonth() !== month! - 1 || d.getFullYear() !== year!) return null;
    return d;
  }

  getDateTimePattern(): string {
    const fmt = this.dateFormate || 'DD/MM/YYYY';
    const patterns: Record<string, string> = {
      'DD/MM/YYYY': '(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/[0-9]{4}',
      'MM/DD/YYYY': '(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])/[0-9]{4}',
      'YYYY/MM/DD': '[0-9]{4}/(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])',
      'DD-MM-YYYY': '(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4}',
      'MM-DD-YYYY': '(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-[0-9]{4}',
      'YYYY-MM-DD': '[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])',
    };
    const datePat = patterns[fmt] || patterns['DD/MM/YYYY'];
    const timePat = this.timeFormat === '12'
      ? '(0[1-9]|1[0-2]):([0-5][0-9]) (AM|PM)'
      : '(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])';
    return `^${datePat} ${timePat}$`;
  }

  getPlaceholder(): string {
    const fmt = this.dateFormate || 'DD/MM/YYYY';
    return this.timeFormat === '12' ? `${fmt} HH:MM AM/PM` : `${fmt} HH:MM`;
  }

  onKeyDown(event: KeyboardEvent): void {
    const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'];
    if (allowed.includes(event.key)) return;
    if (event.ctrlKey && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) return;

    const input = event.target as HTMLInputElement;
    const fmt = this.dateFormate || 'DD/MM/YYYY';
    const delim = fmt.includes('/') ? '/' : '-';
    const digits = input.value.replace(/[^0-9]/g, '');
    const isNum = /[0-9]/.test(event.key);

    // In 12h mode: once 12 digits are entered, handle A/P → AM/PM
    if (this.timeFormat === '12' && digits.length >= 12) {
      const key = event.key.toUpperCase();
      if (key === 'A' || key === 'P') {
        event.preventDefault();
        const base = input.value.replace(/\s*(AM|PM)$/i, '');
        const v = `${base} ${key === 'A' ? 'AM' : 'PM'}`;
        this.dateCtrl.setValue(v);
        setTimeout(() => input.setSelectionRange(v.length, v.length), 0);
        return;
      }
      if (!isNum) { event.preventDefault(); return; }
    }

    if (!isNum && event.key !== ':' && event.key !== ' ') { event.preventDefault(); return; }
    if (!isNum) return;

    if (digits.length >= 12) { event.preventDefault(); return; }
    const next = digits.length + 1;

    const addSuffix = (pos: number, suffix: string) => {
      if (next === pos) {
        event.preventDefault();
        setTimeout(() => {
          const v = input.value + event.key + suffix;
          this.dateCtrl.setValue(v);
          input.setSelectionRange(v.length, v.length);
        }, 0);
      }
    };

    if (fmt.startsWith('YYYY')) { addSuffix(4, delim); addSuffix(6, delim); addSuffix(8, ' '); addSuffix(10, ':'); }
    else { addSuffix(2, delim); addSuffix(4, delim); addSuffix(8, ' '); addSuffix(10, ':'); }
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const fmt = this.dateFormate || 'DD/MM/YYYY';
    const delim = fmt.includes('/') ? '/' : '-';
    // In 12h mode also allow A, M, P letters (for AM/PM suffix)
    const extraChars = this.timeFormat === '12' ? 'AaMmPp' : '';
    const clean = input.value.replace(new RegExp(`[^0-9${delim === '/' ? '/' : '-'} :${extraChars}]`, 'g'), '');
    if (clean.replace(/[^0-9]/g, '').length > 12) return;
    if (clean !== input.value) {
      this.dateCtrl.setValue(clean, { emitEvent: false });
      setTimeout(() => input.setSelectionRange(clean.length, clean.length), 0);
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const paste = event.clipboardData?.getData('text') || '';
    const parsed = this.parseDateTime(paste);
    if (parsed) this.dateCtrl.setValue(this.dateTimeFormat(parsed));
  }

  onFocus(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    setTimeout(() => input.setSelectionRange(input.value.length, input.value.length), 0);
  }

  setDateValue(date: Date) { this.writeValue(date); this.onChanged(date); this.dateChange.emit(date); }
  markAsTouched() { if (!this.touched) { this.onTouched(); this.touched = true; } }

  setDisabledState(isDisabled: boolean): void {
    this.disable = isDisabled;
    if (this.disabled || this.disable) this.dateCtrl.disable();
    else this.dateCtrl.enable();
  }

  openPicker(event: any): void {
    event.stopPropagation();
    event.preventDefault();
    if (this.disable) return;
    // Sync parse in case debounce hasn't fired yet
    const typedDate = this.parseDateTime(this.dateCtrl.value || '');
    if (typedDate) this.date = typedDate;
    this.dialogOpened = true;
    const ref = this.dialog.open(DateTimePickerDialogComponent, {
      data: {
        label: this.isDisplayPickerLabel && this.label ? this.label : null,
        date: this.date,
        min: this.minDate,
        max: this.maxDate,
        timeFormat: this.timeFormat,
      },
      panelClass: ['lib-date-time-picker-dialog']
    });
    ref.afterClosed().subscribe((date: Date | null) => {
      this.dialogOpened = false;
      if (date) this.setDateValue(date);
    });
  }

  get checkValidation() { return this.dateCtrl.hasValidator(Validators.required); }
}
