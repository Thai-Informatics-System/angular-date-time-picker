import { Component, Inject, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, combineLatest, debounceTime, startWith, takeUntil } from 'rxjs';
interface DialogData {
  label?: string;
  min?: Date | number | null;
  max?: Date | number | null;
  date?: Date | number | null;
  timeFormat?: '12' | '24';
}

interface InputConfig {
  minHour: number;
  maxHour: number;
  minMinute: number;
  maxMinute: number;
  timeFormat: '12' | '24';
}

@Component({
  selector: 'lib-date-time-picker-dialog',
  standalone: false,
  templateUrl: './date-time-picker-dialog.component.html',
  styleUrl: './date-time-picker-dialog.component.css'
})
export class DateTimePickerDialogComponent implements OnDestroy {

  selectedCtrl = new FormControl();
  selected: Date = new Date();
  minDate!: Date | null;
  maxDate!: Date | null;
  hoursCtrl = new FormControl();
  minCtrl = new FormControl();
  amPmCtrl = new FormControl();
  disabledSubmit = false;

  data: DialogData = {};

  private _onDestroy = new Subject<void>();
  private _cachedTotalMinutes = 0;
  private _lastCalculatedTime = '';

  inputConfig: InputConfig = { minHour: 0, maxHour: 23, minMinute: 0, maxMinute: 59, timeFormat: '24' };

  btnConfig = { addHourDisable: false, minusHourDisable: false, addMinuteDisable: false, minusMinuteDisable: false };

  constructor(
    public dialogRef: MatDialogRef<DateTimePickerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: DialogData,
  ) {
    this.data = { ...dialogData };
    if (dialogData?.min instanceof Date) this.data.min = new Date((dialogData.min as Date).getTime());
    if (dialogData?.max instanceof Date) this.data.max = new Date((dialogData.max as Date).getTime());
    if (dialogData?.date instanceof Date) this.data.date = new Date((dialogData.date as Date).getTime());
  }

  get is12HourFormat(): boolean { return this.inputConfig.timeFormat === '12'; }

  private convertToDate(v: Date | number | null | undefined): Date | null {
    if (!v) return null;
    const d = typeof v === 'number' ? new Date(v) : v;
    return isNaN(d.getTime()) ? null : d;
  }

  ngOnInit(): void {
    this.minDate = this.convertToDate(this.data?.min);
    this.maxDate = this.convertToDate(this.data?.max);
    this.selected = this.convertToDate(this.data?.date) || new Date();
    this.selectedCtrl.setValue(this.selected);

    this.inputConfig = { minHour: 0, maxHour: 23, minMinute: 0, maxMinute: 59, timeFormat: this.data?.timeFormat || '24' };

    if (this.is12HourFormat) {
      this.amPmCtrl.setValue(this.selected.getHours() < 12 ? 'AM' : 'PM');
    }

    this.updateTimeConstraints();
    this.validateCurrentTime();
    this.setTime();
    this.updateSubmitValidation();

    combineLatest([
      this.hoursCtrl.valueChanges.pipe(startWith(this.hoursCtrl.value)),
      this.minCtrl.valueChanges.pipe(startWith(this.minCtrl.value)),
      this.amPmCtrl.valueChanges.pipe(startWith(this.amPmCtrl.value)),
    ]).pipe(takeUntil(this._onDestroy), debounceTime(200))
      .subscribe(() => {
        this.updateSelectedTime();
        this.setBtnEnableDisable();
        this.updateSubmitValidation();
      });

    this.setTime();
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  updateFormDate(value: Date) {
    this.selected = value;
    this.updateTimeConstraints();
    this.validateCurrentTime();
    this.updateDateTime(value);
  }

  updateTimeConstraints(): void {
    this.inputConfig = { ...this.inputConfig, minHour: 0, maxHour: 23, minMinute: 0, maxMinute: 59 };
    if (!this.selected) return;
    const selStr = this.dateStr(this.selected);
    if (this.minDate && this.dateStr(this.minDate) === selStr) {
      this.inputConfig.minHour = this.minDate.getHours();
      this.inputConfig.minMinute = this.minDate.getMinutes();
    }
    if (this.maxDate && this.dateStr(this.maxDate) === selStr) {
      this.inputConfig.maxHour = this.maxDate.getHours();
      this.inputConfig.maxMinute = this.maxDate.getMinutes();
    }
  }

  validateCurrentTime(): void {
    const cur = this.selected.getHours() * 60 + this.selected.getMinutes();
    const min = this.inputConfig.minHour * 60 + this.inputConfig.minMinute;
    const max = this.inputConfig.maxHour * 60 + this.inputConfig.maxMinute;
    if (cur < min) { this.selected.setHours(this.inputConfig.minHour, this.inputConfig.minMinute, 0, 0); this.setTime(); this.updateDateTime(); }
    else if (cur > max) { this.selected.setHours(this.inputConfig.maxHour, this.inputConfig.maxMinute, 0, 0); this.setTime(); this.updateDateTime(); }
  }

  updateSelectedTime(): void {
    const h12 = Number(this.hoursCtrl.value) || 0;
    const mm = Number(this.minCtrl.value) || 0;
    let hh = this.is12HourFormat ? this.to24h(h12, this.amPmCtrl.value || 'AM') : h12;
    hh = Math.max(0, Math.min(23, hh));
    this.selected.setHours(hh, Math.max(0, Math.min(59, mm)), 0, 0);
    this.selectedCtrl.setValue(this.selected);
    this._lastCalculatedTime = '';
  }

  updateSubmitValidation(): void {
    this.disabledSubmit = false;
    if (!this.selected) { this.disabledSubmit = true; return; }
    const selStr = this.dateStr(this.selected);
    if (this.minDate) {
      if (selStr < this.dateStr(this.minDate)) { this.disabledSubmit = true; return; }
      if (selStr === this.dateStr(this.minDate)) {
        const cur = this.getCurrentTotalMinutes();
        if (cur < this.inputConfig.minHour * 60 + this.inputConfig.minMinute) { this.disabledSubmit = true; return; }
      }
    }
    if (this.maxDate) {
      if (selStr > this.dateStr(this.maxDate)) { this.disabledSubmit = true; return; }
      if (selStr === this.dateStr(this.maxDate)) {
        const cur = this.getCurrentTotalMinutes();
        if (cur > this.inputConfig.maxHour * 60 + this.inputConfig.maxMinute) { this.disabledSubmit = true; return; }
      }
    }
  }

  private getCurrentTotalMinutes(): number {
    const key = `${this.selected.getHours()}-${this.selected.getMinutes()}`;
    if (this._lastCalculatedTime !== key) {
      this._cachedTotalMinutes = this.selected.getHours() * 60 + this.selected.getMinutes();
      this._lastCalculatedTime = key;
    }
    return this._cachedTotalMinutes;
  }

  addHour() {
    const cur = this.selected.getHours() * 60 + this.selected.getMinutes();
    const next = cur + 60;
    const max = this.inputConfig.maxHour * 60 + this.inputConfig.maxMinute;
    const newH = Math.floor(Math.min(next, max) / 60);
    const newM = Math.min(next, max) % 60;
    this.selected.setHours(newH, newM);
    this.updateTimeConstraints();
    this.setTime();
    this.setBtnEnableDisable();
  }

  minusHour() {
    const cur = this.selected.getHours() * 60 + this.selected.getMinutes();
    const next = Math.max(cur - 60, this.inputConfig.minHour * 60 + this.inputConfig.minMinute);
    this.selected.setHours(Math.floor(next / 60), next % 60);
    this.updateTimeConstraints();
    this.setTime();
    this.setBtnEnableDisable();
  }

  addMinute() {
    const cur = this.selected.getHours() * 60 + this.selected.getMinutes();
    const next = cur + 1;
    const max = this.inputConfig.maxHour * 60 + this.inputConfig.maxMinute;
    if (next <= max && Math.floor(next / 60) <= 23) {
      this.selected.setHours(Math.floor(next / 60), next % 60);
      this.updateTimeConstraints();
      this.setTime();
    }
    this.setBtnEnableDisable();
  }

  minusMinute() {
    const cur = this.selected.getHours() * 60 + this.selected.getMinutes();
    const next = cur - 1;
    const min = this.inputConfig.minHour * 60 + this.inputConfig.minMinute;
    if (next >= min && next >= 0) {
      this.selected.setHours(Math.floor(next / 60), next % 60);
      this.updateTimeConstraints();
      this.setTime();
    }
    this.setBtnEnableDisable();
  }

  setTime(): void {
    let hh = this.selected.getHours();
    let mm = this.selected.getMinutes();
    let displayH: any = this.is12HourFormat ? (hh === 0 ? 12 : hh > 12 ? hh - 12 : hh) : hh;
    this.hoursCtrl.setValue(displayH.toString().padStart(2, '0'), { emitEvent: false });
    this.minCtrl.setValue(mm.toString().padStart(2, '0'), { emitEvent: false });
    if (this.is12HourFormat) this.amPmCtrl.setValue(hh < 12 ? 'AM' : 'PM', { emitEvent: false });
  }

  updateDateTime(selected: Date | null = null): void {
    if (!selected) selected = this.selected;
    const h12 = Number(this.hoursCtrl.value) || 0;
    const mm = Number(this.minCtrl.value) || 0;
    let hh = this.is12HourFormat ? this.to24h(h12, this.amPmCtrl.value || 'AM') : h12;
    hh = Math.max(0, Math.min(23, hh));
    const y = selected.getFullYear().toString().padStart(4, '0');
    const mo = (selected.getMonth() + 1).toString().padStart(2, '0');
    const d = selected.getDate().toString().padStart(2, '0');
    const iso = `${y}-${mo}-${d}T${hh.toString().padStart(2, '0')}:${Math.max(0, Math.min(59, mm)).toString().padStart(2, '0')}:00`;
    this.selected = new Date(iso);
    this.selectedCtrl.setValue(this.selected);
    this._lastCalculatedTime = '';
    this.setBtnEnableDisable();
  }

  setBtnEnableDisable(): void {
    this.btnConfig = { addHourDisable: false, minusHourDisable: false, addMinuteDisable: false, minusMinuteDisable: false };
    if (!this.selected) return;
    const cur = this.getCurrentTotalMinutes();
    const h = this.selected.getHours(), m = this.selected.getMinutes();
    if (this.minDate && this.isSameDate(this.minDate, this.selected)) {
      const min = this.inputConfig.minHour * 60 + this.inputConfig.minMinute;
      this.btnConfig.minusHourDisable = cur - 60 < min;
      this.btnConfig.minusMinuteDisable = cur - 1 < min;
    }
    if (this.maxDate && this.isSameDate(this.maxDate, this.selected)) {
      const max = this.inputConfig.maxHour * 60 + this.inputConfig.maxMinute;
      this.btnConfig.addHourDisable = cur + 60 > max;
      this.btnConfig.addMinuteDisable = cur + 1 > max;
    }
    if (h === 23 && m === 59) { this.btnConfig.addHourDisable = true; this.btnConfig.addMinuteDisable = true; }
    if (h === 0 && m === 0) { this.btnConfig.minusHourDisable = true; this.btnConfig.minusMinuteDisable = true; }
  }

  toggleAmPm() {
    if (!this.is12HourFormat) return;
    this.amPmCtrl.setValue(this.amPmCtrl.value === 'PM' ? 'AM' : 'PM');
  }

  isSameDate(d1: Date, d2: Date): boolean { return this.dateStr(d1) === this.dateStr(d2); }

  dateStr(d: Date): string {
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  }

  private to24h(h12: number, ampm: string): number {
    if (ampm === 'AM') return h12 === 12 ? 0 : h12;
    return h12 === 12 ? 12 : h12 + 12;
  }

  onSubmit() {
    this.updateDateTime();
    this.updateSubmitValidation();
    if (this.disabledSubmit) { alert('Please select a valid date and time within the allowed range.'); return; }
    setTimeout(() => this.onClose(this.selected), 50);
  }

  onClose(date: Date | null): void { this.dialogRef.close(date); }
}
