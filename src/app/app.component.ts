import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { AngularDateTimePickerModule } from '../../projects/angular-date-time-picker/src/public-api';

@Component({
  selector: 'app-root',
  imports: [AngularDateTimePickerModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  timeFormat: any = '12';

  dateTimeFc = new FormControl(new Date());
  dateFc = new FormControl(new Date());
  timeFc = new FormControl(new Date().getHours() + ':' + new Date().getMinutes());

}
