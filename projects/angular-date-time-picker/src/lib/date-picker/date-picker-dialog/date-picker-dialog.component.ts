import { Component, Inject, ViewChild } from '@angular/core';
import { MatCalendar } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'lib-date-picker-dialog',
  standalone: false,
  templateUrl: './date-picker-dialog.component.html',
  styleUrl: './date-picker-dialog.component.css'
})
export class DatePickerDialogComponent {
  @ViewChild(MatCalendar, { static: false }) calendar!: MatCalendar<Date>;
  selected: Date = new Date();
  minDate!: Date | null;
  maxDate!: Date | null;
  disabledSubmit = false;

  constructor(
    public dialogRef: MatDialogRef<DatePickerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    this.minDate = this.data?.min ?? null;
    this.maxDate = this.data?.max ?? null;
    this.selected = this.data?.date ?? new Date();

    if (this.minDate && this.startOfDay(this.minDate) > this.startOfDay(this.selected)) {
      this.disabledSubmit = true;
    } else if (this.maxDate && this.startOfDay(this.maxDate) < this.startOfDay(this.selected)) {
      this.disabledSubmit = true;
    }
  }

  ngAfterViewInit() {
    this.calendar._goToDateInView(this.selected, 'month');
  }

  updateFormDate(value: Date) {
    this.selected = value;
    this.disabledSubmit = false;

    if (this.minDate && this.startOfDay(this.minDate) > this.startOfDay(this.selected)) {
      this.disabledSubmit = true;
    } else if (this.maxDate && this.startOfDay(this.maxDate) < this.startOfDay(this.selected)) {
      this.disabledSubmit = true;
    }
  }

  private startOfDay(d: Date): number {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }

  onSubmit() {
    this.onClose(this.selected);
  }

  onClose(date: Date | null): void {
    this.dialogRef.close(date);
  }
}
