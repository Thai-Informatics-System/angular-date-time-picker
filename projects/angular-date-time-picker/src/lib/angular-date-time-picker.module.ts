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

import { AngularDatePickerComponent } from './angular-date-picker/angular-date-picker.component';
import { AngularDatePickerDialogComponent } from './angular-date-picker/angular-date-picker-dialog/angular-date-picker-dialog.component';
import { AngularTimePickerComponent } from './angular-time-picker/angular-time-picker.component';
import { AngularTimePickerDialogComponent } from './angular-time-picker/angular-time-picker-dialog/angular-time-picker-dialog.component';
import { AngularDateTimePickerComponent } from './angular-date-time-picker/angular-date-time-picker.component';
import { AngularDateTimePickerDialogComponent } from './angular-date-time-picker/angular-date-time-picker-dialog/angular-date-time-picker-dialog.component';

@NgModule({
  declarations: [
    AngularDatePickerComponent,
    AngularDatePickerDialogComponent,
    AngularTimePickerComponent,
    AngularTimePickerDialogComponent,
    AngularDateTimePickerComponent,
    AngularDateTimePickerDialogComponent,
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
    AngularDatePickerComponent,
    AngularTimePickerComponent,
    AngularDateTimePickerComponent,
  ]
})
export class AngularDateTimePickerModule { }
