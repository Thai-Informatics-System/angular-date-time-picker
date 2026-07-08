import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateTimePickerComponent } from './date-time-picker/date-time-picker.component';
import { DatePickerComponent } from './date-picker/date-picker.component';
import { TimePickerComponent } from './time-picker/time-picker.component';

@NgModule({
  declarations: [
    DateTimePickerComponent,
    DatePickerComponent,
    TimePickerComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    DateTimePickerComponent,
    DatePickerComponent,
    TimePickerComponent,
  ]
})
export class AngularDateTimePickerModule { }
