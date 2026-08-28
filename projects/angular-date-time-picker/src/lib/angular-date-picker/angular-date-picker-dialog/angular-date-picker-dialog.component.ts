import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'angular-date-picker-dialog',
  standalone: false,
  templateUrl: './angular-date-picker-dialog.component.html',
  styleUrl: './angular-date-picker-dialog.component.css'
})
export class AngularDatePickerDialogComponent {
  selected: Date = new Date();
  minDate!: Date | null;
  maxDate!: Date | null;
  disabledSubmit = false;

  constructor(
    public dialogRef: MatDialogRef<AngularDatePickerDialogComponent>,
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

  onDateDoubleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.mat-calendar-body-cell:not(.mat-calendar-body-disabled)')) return;
    if (this.disabledSubmit) return;
    this.onSubmit();
  }

  onSubmit() {
    this.onClose(this.selected);
  }

  onClose(date: Date | null): void {
    this.dialogRef.close(date);
  }
}
