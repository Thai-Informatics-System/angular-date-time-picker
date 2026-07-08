import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { DatePickerComponent } from './date-picker/date-picker.component';
import { DatePickerDialogComponent } from './date-picker/date-picker-dialog/date-picker-dialog.component';
import { TimePickerComponent } from './time-picker/time-picker.component';
import { TimePickerDialogComponent } from './time-picker/time-picker-dialog/time-picker-dialog.component';
import { DateTimePickerComponent } from './date-time-picker/date-time-picker.component';
import { DateTimePickerDialogComponent } from './date-time-picker/date-time-picker-dialog/date-time-picker-dialog.component';

@NgModule({
  declarations: [
    DatePickerComponent,
    DatePickerDialogComponent,
    TimePickerComponent,
    TimePickerDialogComponent,
    DateTimePickerComponent,
    DateTimePickerDialogComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  exports: [
    DatePickerComponent,
    TimePickerComponent,
    DateTimePickerComponent,
  ]
})
export class AngularDateTimePickerModule { }
