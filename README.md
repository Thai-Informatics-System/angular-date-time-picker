# angular-date-time-picker

Angular Material date, time, and combined date-time picker components by **Thai Informatics System**. Each renders as a `mat-form-field` that opens a dialog-based picker, works with reactive forms, and takes configurable validation messages.

[![npm version](https://img.shields.io/npm/v/@servicemind.tis/angular-date-time-picker)](https://www.npmjs.com/package/@servicemind.tis/angular-date-time-picker)
[![npm downloads](https://img.shields.io/npm/dm/@servicemind.tis/angular-date-time-picker)](https://www.npmjs.com/package/@servicemind.tis/angular-date-time-picker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Components

| Selector | Component | Emits / closes with |
|---|---|---|
| `<angular-date-picker>` | `AngularDatePickerComponent` | `dateChange: Date` |
| `<angular-time-picker>` | `AngularTimePickerComponent` | `timeChange: string` |
| `<angular-date-time-picker>` | `AngularDateTimePickerComponent` | `dateChange: Date` |
| — | `AngularDatePickerDialogComponent` | `Date \| null` |
| — | `AngularTimePickerDialogComponent` | `string \| null` (`HH:mm` 24h) |
| — | `AngularDateTimePickerDialogComponent` | `Date \| null` |

---

## Installation

```bash
npm install @servicemind.tis/angular-date-time-picker
```

### Peer dependencies

```bash
npm install @angular/material @angular/cdk
```

---

## Usage

```ts
import { AngularDateTimePickerModule } from '@servicemind.tis/angular-date-time-picker';

@NgModule({ imports: [AngularDateTimePickerModule] })
export class MyFeatureModule {}
```

```html
<angular-date-picker
  label="Start date"
  [formControl]="startDate"
  dateFormate="DD/MM/YYYY"
  [required]="true"
  (dateChange)="onStartDateChange($event)">
</angular-date-picker>

<angular-time-picker
  label="Start time"
  [formControl]="startTime"
  timeFormat="12">
</angular-time-picker>

<angular-date-time-picker
  label="Appointment"
  [formControl]="appointment"
  timeFormat="24"
  [min]="today">
</angular-date-time-picker>
```

---

## Inputs

Common to all three components:

| Input | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Field label |
| `placeholder` | `string` | `''` | Placeholder text |
| `classes` | `string` | `''` | Extra classes on the form field |
| `appearance` | `MatFormFieldAppearance` | `'outline'` | Material appearance |
| `hint` | `string` | — | Hint text below the field |
| `validationMessages` | `ValidationMessages[]` | `[]` | Error messages by validator type |
| `required` | `boolean` | — | Marks the field required |
| `disabled` | `boolean` | — | Disables the field |
| `isDisplayPickerLabel` | `boolean` | `false` | Show the label inside the picker dialog |

Date and date-time only:

| Input | Type | Default |
|---|---|---|
| `isLabelOutside` | `boolean` | `false` |
| `dateFormate` | `string` | `'DD/MM/YYYY'` |
| `min` / `max` | `Date \| number` | — |

Time and date-time only:

| Input | Type | Default |
|---|---|---|
| `timeFormat` | `'12' \| '24'` | `'24'` |

Time picker `min` / `max` are `string` values.

---

## Validation messages

```ts
import { ValidationMessages } from '@servicemind.tis/angular-date-time-picker';

messages: ValidationMessages[] = [
  { type: 'required', message: 'Start date is required' },
  { type: 'matDatepickerMin', message: 'Date cannot be in the past' },
];
```

```html
<angular-date-picker [validationMessages]="messages" [formControl]="startDate"></angular-date-picker>
```

---

## Using the dialogs directly

The form-field pickers above wrap these dialogs. Open them yourself with `MatDialog` when you want a picker without the input — from a button, a table cell, or a custom field.

Import `AngularDateTimePickerModule` (the dialogs are declared there) and inject `MatDialog`.

Confirm with **Set**, or double-click a calendar day on the date / date-time dialogs. **Cancel** closes with `null`.

### Date picker dialog

```ts
import { MatDialog } from '@angular/material/dialog';
import { AngularDatePickerDialogComponent } from '@servicemind.tis/angular-date-time-picker';

constructor(private dialog: MatDialog) {}

openDatePicker() {
  this.dialog.open(AngularDatePickerDialogComponent, {
    data: {
      label: 'Start date',  // optional dialog title
      date: new Date(),     // initial selection
      min: this.minDate,    // Date | null
      max: this.maxDate,    // Date | null
    },
    panelClass: ['lib-date-picker-dialog'],
  }).afterClosed().subscribe((date: Date | null) => {
    if (date) this.startDate = date;
  });
}
```

| `data` | Type | Description |
|---|---|---|
| `label` | `string \| null` | Optional title |
| `date` | `Date \| null` | Initial selected date |
| `min` / `max` | `Date \| null` | Allowed range |

Closes with a `Date` on confirm, or `null` on cancel.

### Time picker dialog

```ts
import { AngularTimePickerDialogComponent } from '@servicemind.tis/angular-date-time-picker';

openTimePicker() {
  this.dialog.open(AngularTimePickerDialogComponent, {
    data: {
      label: 'Start time',
      time: '09:30',        // initial time, 24h "HH:mm"
      min: '08:00',
      max: '18:00',
      timeFormat: '12',     // '12' | '24'
    },
    panelClass: ['lib-time-picker-dialog'],
  }).afterClosed().subscribe((time: string | null) => {
    if (time) this.startTime = time; // always "HH:mm" 24h, e.g. "09:30"
  });
}
```

| `data` | Type | Description |
|---|---|---|
| `label` | `string \| null` | Optional title |
| `time` | `string \| null` | Initial time as `HH:mm` (24h) |
| `min` / `max` | `string \| null` | Allowed range as `HH:mm` |
| `timeFormat` | `'12' \| '24'` | Display format (default `'24'`) |

Closes with `"HH:mm"` (24h) on confirm, or `null` on cancel.

### Date-time picker dialog

```ts
import { AngularDateTimePickerDialogComponent } from '@servicemind.tis/angular-date-time-picker';

openDateTimePicker() {
  this.dialog.open(AngularDateTimePickerDialogComponent, {
    data: {
      label: 'Appointment',
      date: new Date(),
      min: this.minDate,
      max: this.maxDate,
      timeFormat: '12',
    },
    panelClass: ['lib-date-time-picker-dialog'],
  }).afterClosed().subscribe((date: Date | null) => {
    if (date) this.appointment = date;
  });
}
```

| `data` | Type | Description |
|---|---|---|
| `label` | `string` | Optional title |
| `date` | `Date \| number \| null` | Initial date-time |
| `min` / `max` | `Date \| number \| null` | Allowed range |
| `timeFormat` | `'12' \| '24'` | Time display format (default `'24'`) |

Closes with a `Date` (date + time) on confirm, or `null` on cancel.

---

## Theming

Set these CSS variables on `:root` or `body` in a **global** stylesheet (e.g. `styles.scss`). A component `.scss` file will not reach the picker dialog — it is attached to `body` by `MatDialog`.

All have fallbacks — unset tokens keep the library defaults.

Shared names match `@servicemind.tis/angular-smart-data-table`, so one `:root` block themes both libraries.

```css
:root {
  --angular-primary: #3838a2;
  --angular-on-primary: #ffffff;
  --angular-danger: #bb333b;
  --angular-heading-color: #212121;
  --angular-text-body: rgba(0, 0, 0, 0.87);
  --angular-surface: #ffffff;
  --angular-divider: rgba(0, 0, 0, 0.12);
  --angular-picker-dialog-width: 296px;
  --angular-picker-input-border: rgba(0, 0, 0, 0.5);
  --angular-picker-input-radius: 3px;
  --angular-picker-icon: #555;
  --angular-picker-icon-disabled: #aaa;
}
```

| Variable | Default | Used for |
|---|---|---|
| `--angular-primary` | `#3838a2` | Selected day, AM/PM, Set |
| `--angular-on-primary` | `#ffffff` | Text on selected day and AM/PM hover |
| `--angular-danger` | `#bb333b` | Required asterisk, Cancel |
| `--angular-heading-color` | `#212121` | Outside field label |
| `--angular-text-body` | `rgba(0, 0, 0, 0.87)` | Dialog and time-input text |
| `--angular-surface` | `#ffffff` | Time-input background |
| `--angular-divider` | `rgba(0, 0, 0, 0.12)` | Dialog section borders |
| `--angular-picker-dialog-width` | `296px` | Dialog width |
| `--angular-picker-input-border` | `rgba(0, 0, 0, 0.5)` | Hour/minute input border |
| `--angular-picker-input-radius` | `3px` | Hour/minute and AM/PM radius |
| `--angular-picker-icon` | `#555` | Field suffix icon |
| `--angular-picker-icon-disabled` | `#aaa` | Disabled suffix icon |

If `--angular-primary` is unset, the picker falls back to `--mat-sys-primary`, then `#3838a2`.

---

## License

MIT © Thai Informatics System Co., Ltd.
