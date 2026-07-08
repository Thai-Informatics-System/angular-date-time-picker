import { Component } from '@angular/core';
import { AngularDateTimePickerModule } from '../../projects/angular-date-time-picker/src/public-api';

@Component({
  selector: 'app-root',
  imports: [AngularDateTimePickerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {}
