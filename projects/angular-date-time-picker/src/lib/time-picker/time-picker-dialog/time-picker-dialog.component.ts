import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, debounceTime, takeUntil } from 'rxjs';

@Component({
  selector: 'lib-time-picker-dialog',
  standalone: false,
  templateUrl: './time-picker-dialog.component.html',
  styleUrl: './time-picker-dialog.component.css'
})
export class TimePickerDialogComponent {
  hoursCtrl = new FormControl();
  minCtrl = new FormControl();
  amPmCtrl = new FormControl();

  minTimeArr = ['00', '00'];
  maxTimeArr = ['23', '59'];

  private _onDestroy = new Subject<void>();

  time = { hh: '00', mm: '00' };

  inputConfig = { minHour: 0, maxHour: 23, minMinute: 0, maxMinute: 59 };

  btnConfig = {
    addHourDisable: false,
    minusHourDisable: false,
    addMinuteDisable: false,
    minusMinuteDisable: false,
  };

  constructor(
    public dialogRef: MatDialogRef<TimePickerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  get is12HourFormat(): boolean { return (this.data?.timeFormat ?? '24') === '12'; }

  ngOnInit() {
    const minTime: string | null = this.data?.min ?? null;
    const maxTime: string | null = this.data?.max ?? null;

    if (minTime) this.minTimeArr = minTime.split(':');
    if (maxTime) this.maxTimeArr = maxTime.split(':');

    const timeStr: string | null = this.data?.time ?? null;
    if (timeStr) {
      const parts = timeStr.split(':');
      if (parts[0]) this.time.hh = parts[0];
      if (parts[1]) this.time.mm = parts[1];
    }

    this.hoursCtrl.valueChanges.pipe(takeUntil(this._onDestroy), debounceTime(400)).subscribe(hh => {
      if (!hh) return;
      if (isNaN(hh)) { this.setTime(); return; }
      let n = Number(hh);
      if (n > this.inputConfig.maxHour) n = this.inputConfig.maxHour;
      if (n < this.inputConfig.minHour) n = this.inputConfig.minHour;
      if (this.is12HourFormat) {
        let display: any = n <= 0 ? 12 : n <= 12 ? n : n % 12;
        if (display < 10) display = `0${display}`;
        this.hoursCtrl.setValue(display, { emitEvent: false });
        this.amPmCtrl.setValue(n < 12 ? 'AM' : 'PM');
      } else {
        const display: any = n < 10 ? `0${n}` : `${n}`;
        this.hoursCtrl.setValue(display, { emitEvent: false });
      }
      this.time.hh = n < 10 ? `0${n}` : `${n}`;
      this.updateDateTime();
    });

    this.minCtrl.valueChanges.pipe(takeUntil(this._onDestroy), debounceTime(400)).subscribe(mm => {
      if (!mm) return;
      if (isNaN(mm)) { this.setTime(); return; }
      let n = Number(mm);
      if (n > this.inputConfig.maxMinute) n = this.inputConfig.maxMinute;
      if (n < this.inputConfig.minMinute) n = this.inputConfig.minMinute;
      this.minCtrl.setValue(n < 10 ? `0${n}` : `${n}`, { emitEvent: false });
      this.time.mm = n < 10 ? `0${n}` : `${n}`;
      this.updateDateTime();
    });

    this.setTime();
  }

  addHour() {
    if (Number(this.time.hh) < 23) {
      let hh: any = Number(this.time.hh) + 1;
      if (hh < 10) hh = `0${hh}`;
      this.time.hh = hh;
      this.setTime();
    }
  }

  minusHour() {
    if (Number(this.time.hh) > 0) {
      let hh: any = Number(this.time.hh) - 1;
      if (hh < 10) hh = `0${hh}`;
      this.time.hh = hh;
      this.setTime();
    }
  }

  addMinute() {
    if (Number(this.time.mm) < 59) {
      let mm: any = Number(this.time.mm) + 1;
      if (mm < 10) mm = `0${mm}`;
      this.time.mm = mm;
      this.setTime();
    }
  }

  minusMinute() {
    if (Number(this.time.mm) > 0) {
      let mm: any = Number(this.time.mm) - 1;
      if (mm < 10) mm = `0${mm}`;
      this.time.mm = mm;
      this.setTime();
    }
  }

  setTime() {
    let hh = Number(this.time.hh);
    if (hh < Number(this.minTimeArr[0])) hh = Number(this.minTimeArr[0]);
    if (hh > Number(this.maxTimeArr[0])) hh = Number(this.maxTimeArr[0]);

    let mm: any = Number(this.time.mm);
    if (mm < Number(this.minTimeArr[1])) mm = Number(this.minTimeArr[1]);
    if (mm > Number(this.maxTimeArr[1])) mm = Number(this.maxTimeArr[1]);
    if (mm < 10) mm = `0${mm}`;

    if (this.is12HourFormat) {
      let display12: any = hh === 0 ? 12 : hh <= 12 ? hh : hh % 12;
      if (display12 < 10) display12 = `0${display12}`;
      this.hoursCtrl.setValue(display12, { emitEvent: false });
      this.amPmCtrl.setValue(hh < 12 ? 'AM' : 'PM');
    } else {
      this.hoursCtrl.setValue(hh < 10 ? `0${hh}` : `${hh}`, { emitEvent: false });
    }

    this.minCtrl.setValue(mm, { emitEvent: false });
    this.time.hh = hh < 10 ? `0${hh}` : `${hh}`;
    this.time.mm = mm;
    this.setBtnEnableDisable();
  }

  updateDateTime() {
    const min = Number(this.minCtrl.value);
    let hh: any;
    if (this.is12HourFormat) {
      const hour12 = Number(this.hoursCtrl.value);
      const ampm = this.amPmCtrl.value;
      hh = ampm === 'AM' ? (hour12 === 12 ? 0 : hour12) : (hour12 === 12 ? 12 : hour12 + 12);
    } else {
      hh = Number(this.hoursCtrl.value);
    }
    let mm: any = min;
    if (hh < 10) hh = `0${hh}`;
    if (mm < 10) mm = `0${mm}`;
    this.time = { hh, mm };
    this.setBtnEnableDisable();
  }

  toggleAmPm() {
    this.amPmCtrl.setValue(this.amPmCtrl.value === 'PM' ? 'AM' : 'PM');
    setTimeout(() => this.updateDateTime(), 100);
  }

  setBtnEnableDisable() {
    this.btnConfig = { addHourDisable: false, minusHourDisable: false, addMinuteDisable: false, minusMinuteDisable: false };
    const h = Number(this.time.hh), m = Number(this.time.mm);
    const minH = Number(this.minTimeArr[0]), minM = Number(this.minTimeArr[1]);
    const maxH = Number(this.maxTimeArr[0]), maxM = Number(this.maxTimeArr[1]);
    this.btnConfig.minusHourDisable = minH >= h;
    if (minH === h) this.btnConfig.minusMinuteDisable = minM >= m;
    this.btnConfig.addHourDisable = maxH <= h;
    if (maxH === h) this.btnConfig.addMinuteDisable = maxM <= m;
  }

  get disabledSubmit(): boolean {
    const min = Number(this.minCtrl.value);
    let hh: number;
    if (this.is12HourFormat) {
      const hour12 = Number(this.hoursCtrl.value);
      const ampm = this.amPmCtrl.value;
      hh = ampm === 'AM' ? (hour12 === 12 ? 0 : hour12) : (hour12 === 12 ? 12 : hour12 + 12);
    } else {
      hh = Number(this.hoursCtrl.value);
    }
    return hh < Number(this.minTimeArr[0]) || hh > Number(this.maxTimeArr[0]) ||
      min < Number(this.minTimeArr[1]) || min > Number(this.maxTimeArr[1]);
  }

  onSubmit() {
    this.updateDateTime();
    setTimeout(() => this.onClose(`${this.time.hh}:${this.time.mm}`), 50);
  }

  onClose(time: string | null): void {
    this.dialogRef.close(time);
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
}
