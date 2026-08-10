# angular-date-time-picker

Angular Material date, time, and combined date-time picker components by **Thai Informatics System**. Each renders as a `mat-form-field` that opens a dialog-based picker, works with reactive forms, and takes configurable validation messages.

[![npm version](https://img.shields.io/npm/v/@servicemind.tis/angular-date-time-picker)](https://www.npmjs.com/package/@servicemind.tis/angular-date-time-picker)
[![npm downloads](https://img.shields.io/npm/dm/@servicemind.tis/angular-date-time-picker)](https://www.npmjs.com/package/@servicemind.tis/angular-date-time-picker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Components

| Selector | Component | Emits |
|---|---|---|
| `<angular-date-picker>` | `AngularDatePickerComponent` | `dateChange: Date` |
| `<angular-time-picker>` | `AngularTimePickerComponent` | `timeChange: string` |
| `<angular-date-time-picker>` | `AngularDateTimePickerComponent` | `dateChange: Date` |

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

## License

MIT © Thai Informatics System Co., Ltd.
