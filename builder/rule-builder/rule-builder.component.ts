import { Component, signal, computed, effect } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { GroupComponent } from '../group/group.component';
import { IfThenComponent } from '../ifthen/ifthen.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rule-builder',
  templateUrl: './rule-builder.component.html',
  styleUrls: ['./rule-builder.component.scss'],
  standalone: true,
  imports: [GroupComponent, IfThenComponent, FormsModule, ReactiveFormsModule, CommonModule]
})
export class RuleBuilderComponent {
  fields = ['UPC10', 'TERMS', 'CPICID'];
  operators = ['=', '<>', '!=', '<', '>', '<='];

  format = signal<'SINGLE' | 'IF_THEN'>('SINGLE');

  form = this.fb.group({
    criteria: this.fb.group({
      script: this.fb.group({
        format: this.format(),
        rules: this.fb.array<FormGroup>([]) // 👈 strongly typed
      })
    })
  });

  formValue = signal<any>(null);

  constructor(private fb: FormBuilder) {
    effect(() => {
      const f = this.format();
      this.form.get('criteria.script.format')?.setValue(f, { emitEvent: false });
    });
  }

  ngOnInit() {
    //this.resetRules();
    const SINGLE_EXAMPLE = {
      criteria: {
        script: {
          format: 'SINGLE',
          rules: [
            {
              condition: 'AND',
              rules: [
                { field: 'UPC10', operator: '=', value: '7777' },
                { field: 'TERMS', operator: '<>', value: '6' },
                {
                  condition: 'OR',
                  rules: [
                    { field: 'UPC10', operator: '!=', value: '' },
                    { field: 'CPICID', operator: '=', value: '77' }
                  ]
                }
              ]
            }
          ]
        }
      }
    };

    const IF_THEN_EXAMPLE = {
      "criteria": {
        "script": {
          "format": "IF_THEN",
          "rules": [
            {
              "outputField": "pb_mic_amount",
              "scriptFormat": [
                {
                  "condition": {
                    "condition": "AND",
                    "rules": [
                      { "field": "UPC10", "operator": "=", "value": "7777" },
                      { "field": "TERMS", "operator": "<>", "value": "6" }
                    ]
                  },
                  "thenValue": "0.00",
                  "elseValue": "N/A"
                },
                {
                  "condition": {
                    "condition": "OR",
                    "rules": [
                      { "field": "UPC10", "operator": "!=", "value": "" },
                      { "field": "CPICID", "operator": "=", "value": "77" }
                    ]
                  },
                  "thenValue": "0.50",
                  "elseValue": "X"
                },
                {
                  "condition": {
                    "condition": "OR",
                    "rules": [
                      { "field": "UPC10", "operator": "!=", "value": "" },
                      { "field": "CPICID", "operator": "=", "value": "77" }
                    ]
                  },
                  "thenValue": "0.50",
                  "elseValue": "X"
                }
              ]
            }
          ]
        }
      }
    };

    this.loadCriteria(IF_THEN_EXAMPLE);
    this.form.valueChanges.subscribe(v => this.formValue.set(v));

    this.formValue.set(this.form.value);

    this.form.updateValueAndValidity();
    this.markAllControlsTouched(this.form);
  }

  // --- helpers ---
  get rulesArray(): FormArray<FormGroup> {
    return this.form.get('criteria.script.rules') as FormArray<FormGroup>;
  }

  get singleGroups(): FormGroup[] {
    return this.rulesArray.controls;
  }

  get ifThenWrappers(): FormGroup[] {
    return this.rulesArray.controls;
  }

  getScriptFormat(wrapper: FormGroup): FormGroup[] {
    const arr = wrapper.get('scriptFormat') as FormArray<FormGroup> | null;
    return arr ? arr.controls : [];
  }

  resetRules() {
    this.rulesArray.clear();
    if (this.format() === 'SINGLE') {
      this.addSingleGroup();
    } else {
      this.addIfThenRule();
    }
    this.form.updateValueAndValidity();
  }

  addSingleGroup() {
    this.rulesArray.push(this.newGroup());
  }

  addIfThenRule() {
    this.rulesArray.push(this.newIfThenWrapper());
  }

  // create a single rule (leaf) with validators
  newSimpleRule(): FormGroup {
    return this.fb.group({
      field: [this.fields[0], Validators.required],
      operator: [this.operators[0], Validators.required],
      value: ['', Validators.required]
    });
  }

  newGroup(): FormGroup {
    return this.fb.group({
      condition: ['AND', Validators.required],
      // rules is an array of FormGroup items
      rules: this.fb.array<FormGroup>([this.newSimpleRule()])
    });
  }

  newIfThen(): FormGroup {
    return this.fb.group({
      condition: this.newGroup(),                      // nested group already has validators
      thenValue: ['', Validators.required],            // required
      elseValue: ['', Validators.required]             // required
    });
  }


  newIfThenWrapper(): FormGroup {
    return this.fb.group({
      outputField: ['pb_mic_amount', Validators.required],
      scriptFormat: this.fb.array<FormGroup>([this.newIfThen()])
    });
  }


  addIfThenRuleToWrapper(wrapper: FormGroup) {
    const arr = wrapper.get('scriptFormat') as FormArray<FormGroup>;
    arr.push(this.newIfThen());
  }

  removeIfThenRuleFromWrapper(wrapper: FormGroup, index: number) {
    const arr = wrapper.get('scriptFormat') as FormArray<FormGroup>;
    arr.removeAt(index);
  }

  // --- JSON loader ---
  loadCriteria(data: any) {
    this.rulesArray.clear();
    this.format.set(data.criteria.script.format);

    if (data.criteria.script.format === 'SINGLE') {
      data.criteria.script.rules.forEach((grp: any) => {
        this.rulesArray.push(this.buildGroup(grp));
      });
    }

    if (data.criteria.script.format === 'IF_THEN') {
      data.criteria.script.rules.forEach((wrapper: any) => {
        this.rulesArray.push(this.buildIfThenWrapper(wrapper));
      });
    }

    this.formValue.set(this.form.value);
  }

  buildSimpleRule(rule: any): FormGroup {
  return this.fb.group({
    field: [rule?.field ?? this.fields[0], Validators.required],
    operator: [rule?.operator ?? this.operators[0], Validators.required],
    value: [rule?.value ?? '', Validators.required]
  });
}

buildGroup(group: any): FormGroup {
  const fa = this.fb.array<FormGroup>([]);
  if (group && Array.isArray(group.rules)) {
    group.rules.forEach((r: any) => {
      if (r && 'field' in r) {
        fa.push(this.buildSimpleRule(r));
      } else if (r && 'condition' in r) {
        fa.push(this.buildGroup(r));
      }
    });
  }
  return this.fb.group({
    condition: [group?.condition ?? 'AND', Validators.required],
    rules: fa
  });
}

buildIfThen(rule: any): FormGroup {
  return this.fb.group({
    condition: this.buildGroup(rule?.condition ?? { condition: 'AND', rules: [ { field: this.fields[0], operator: this.operators[0], value: '' } ] }),
    thenValue: [rule?.thenValue ?? '', Validators.required],
    elseValue: [rule?.elseValue ?? '', Validators.required]
  });
}

buildIfThenWrapper(wrapper: any): FormGroup {
  const sfArray = this.fb.array<FormGroup>([]);
  if (wrapper && Array.isArray(wrapper.scriptFormat)) {
    wrapper.scriptFormat.forEach((sf: any) => {
      sfArray.push(this.buildIfThen(sf));
    });
  }
  return this.fb.group({
    outputField: [wrapper?.outputField ?? 'pb_mic_amount', Validators.required],
    scriptFormat: sfArray
  });
}

  // --- String Builders ---
  stringifySingle(group: any): string {
    if (!group || !group.rules) return '';
    const parts = group.rules.map((r: any) =>
      r.field
        ? `${r.field} ${r.operator} '${r.value}'`
        : `(${this.stringifySingle(r)})`
    );
    return parts.join(` ${group.condition} `);
  }

  stringifyIfThen(scriptFormat: any[], outputField: string): string {
    if (!scriptFormat) return '';
    let sql = '';
    scriptFormat.forEach((rule, idx) => {
      const condStr = this.stringifySingle(rule.condition);
      if (idx === 0) {
        sql += `IF (${condStr}) THEN '${rule.thenValue}' ELSE '${rule.elseValue}'\n`;
      } else {
        sql += `ELSEIF (${condStr}) THEN '${rule.thenValue}' ELSE '${rule.elseValue}'\n`;
      }
    });
    sql += `END IF AS ${outputField}`;
    return sql;
  }

  // --- Computed Preview ---
  preview = computed(() => {
    const script = this.formValue()?.criteria?.script;
    if (!script || !script.rules || script.rules.length === 0) return '';

    if (script.format === 'SINGLE') {
      const grp = script.rules?.[0];
      return this.stringifySingle(grp);
    }

    if (script.format === 'IF_THEN') {
      const wrapper = script.rules?.[0];
      return this.stringifyIfThen(wrapper.scriptFormat, wrapper.outputField);
    }

    return '';
  });

  private markAllControlsTouched(control: AbstractControl | null): void {
  if (!control) return;

  if (control instanceof FormGroup) {
    Object.values(control.controls).forEach(child => {
      this.markAllControlsTouched(child);
    });
    control.markAsTouched();
    control.updateValueAndValidity({ onlySelf: true });
  } else if (control instanceof FormArray) {
    control.controls.forEach(child => {
      this.markAllControlsTouched(child);
    });
    control.markAsTouched();
    control.updateValueAndValidity({ onlySelf: true });
  } else {
    // FormControl
    control.markAsTouched();
    control.updateValueAndValidity({ onlySelf: true });
  }
}

  submit() {
    // mark everything touched so nested validation messages show
    this.markAllControlsTouched(this.form);

    if (this.form.invalid) {
      // optional: open a toast / show inline summary
      console.warn('Form invalid, fix errors before submit', this.form);
      return;
    }
    console.log('Final JSON:', this.form.value);
    console.log('Final Expression:', this.preview());
  }
}
