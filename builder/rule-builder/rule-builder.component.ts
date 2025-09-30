import { Component, signal, computed, effect } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { GroupComponent } from '../group/group.component';
import { IfThenComponent } from '../ifthen/ifthen.component';
import { CommonModule } from '@angular/common';
import { CriteriaRoot, GroupRule, IfThenRule, IfThenWrapper, SimpleRule } from '../rule.model';

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
        rootCondition: ['AND', Validators.required],   // NEW
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
          rootCondition: "AND",
          rules: [
            {
              condition: 'AND',
              rules: [
                { field: 'UPC10', operator: '=', value: '7777' },
                { field: 'TERMS', operator: '<>', value: '6' },
              ]
            },
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
            },
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

    this.loadCriteria(IF_THEN_EXAMPLE as CriteriaRoot);
    this.form.valueChanges.subscribe(v => this.formValue.set(v));

    this.formValue.set(this.form.value);

    this.form.updateValueAndValidity();
    this.markAllControlsTouched(this.form);
  }

  // === Accessors ===
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

  get rootConditionControl() {
    return this.form.get('criteria.script.rootCondition');
  }

  get scriptGroup(): FormGroup {
    return this.form.get('criteria.script') as FormGroup;
  }

  // === Builders ===
  newSimpleRule(): FormGroup {
    return this.fb.group({
      field: [this.fields[0], Validators.required],
      operator: [this.operators[0], Validators.required],
      value: ['', Validators.required],
    });
  }

  newGroup(): FormGroup {
    return this.fb.group({
      condition: ['AND', Validators.required],
      rules: this.fb.array<FormGroup>([this.newSimpleRule()]),
    });
  }

  newIfThen(): FormGroup {
    return this.fb.group({
      condition: this.newGroup(),
      thenValue: ['', Validators.required],
      elseValue: ['', Validators.required],
    });
  }

  newIfThenWrapper(): FormGroup {
    return this.fb.group({
      outputField: ['pb_mic_amount', Validators.required],
      scriptFormat: this.fb.array<FormGroup>([this.newIfThen()]),
    });
  }

  // === Reset ===
  resetRules() {
    this.rulesArray.clear();
    if (this.format() === 'SINGLE') {
      this.rulesArray.push(this.newGroup());
    } else {
      this.rulesArray.push(this.newIfThenWrapper());
    }
    this.form.updateValueAndValidity();
  }

  // === SINGLE helpers ===
  addSingleRootGroup() {
    this.rulesArray.push(this.newGroup());
  }

  removeSingleRootGroup(index: number) {
    this.rulesArray.removeAt(index);
  }

  // Remove a child rule/group from a group by index
  removeChildFromGroup(group: FormGroup, index: number) {
    this.getRulesArray(group).removeAt(index);
  }

  addSingleRuleToGroup(group: FormGroup) {
    const arr = group.get('rules') as FormArray<FormGroup>;
    arr.push(this.newSimpleRule());
  }

  addSingleGroupToGroup(group: FormGroup) {
    const arr = group.get('rules') as FormArray<FormGroup>;
    arr.push(this.newGroup());
  }

  // === IF_THEN helpers ===
  addIfThenWrapper() {
    this.rulesArray.push(this.newIfThenWrapper());
  }

  removeIfThenWrapper(index: number) {
    this.rulesArray.removeAt(index);
  }

  addIfThenRuleToWrapper(wrapper: FormGroup) {
    const arr = wrapper.get('scriptFormat') as FormArray<FormGroup>;
    arr.push(this.newIfThen());
  }

  removeIfThenRuleFromWrapper(wrapper: FormGroup, index: number) {
    const arr = wrapper.get('scriptFormat') as FormArray<FormGroup>;
    arr.removeAt(index);
  }

  // Return rules FormArray for a given group
  getRulesArray(group: FormGroup): FormArray<FormGroup> {
    return group.get('rules') as FormArray<FormGroup>;
  }

  // Remove rule by index inside a group
  removeRuleFromGroup(group: FormGroup, index: number) {
    this.getRulesArray(group).removeAt(index);
  }

  // === Load JSON ===
  loadCriteria(data: CriteriaRoot) {
    this.rulesArray.clear();
    this.format.set(data.criteria.script.format);

    if (data.criteria.script.format === 'SINGLE') {
      (data.criteria.script.rules as GroupRule[]).forEach((grp) => {
        this.rulesArray.push(this.buildGroup(grp));
      });
    }

    if (data.criteria.script.format === 'IF_THEN') {
      (data.criteria.script.rules as IfThenWrapper[]).forEach((wrapper) => {
        this.rulesArray.push(this.buildIfThenWrapper(wrapper));
      });
    }

    this.form.updateValueAndValidity();
    this.formValue.set(this.form.value as CriteriaRoot);
  }

  buildSimpleRule(rule: SimpleRule): FormGroup {
    return this.fb.group({
      field: [rule.field, Validators.required],
      operator: [rule.operator, Validators.required],
      value: [rule.value, Validators.required],
    });
  }

  buildGroup(group: GroupRule): FormGroup {
    const fa = this.fb.array<FormGroup>([]);
    group.rules.forEach((r) => {
      if ('field' in r) {
        fa.push(this.buildSimpleRule(r as SimpleRule));
      } else {
        fa.push(this.buildGroup(r as GroupRule));
      }
    });

    return this.fb.group({
      condition: [group.condition, Validators.required],
      rules: fa,
    });
  }

  buildIfThen(rule: IfThenRule): FormGroup {
    return this.fb.group({
      condition: this.buildGroup(rule.condition),
      thenValue: [rule.thenValue, Validators.required],
      elseValue: [rule.elseValue, Validators.required],
    });
  }

  buildIfThenWrapper(wrapper: IfThenWrapper): FormGroup {
    const sfArray = this.fb.array<FormGroup>([]);
    wrapper.scriptFormat.forEach((sf) => {
      sfArray.push(this.buildIfThen(sf));
    });

    return this.fb.group({
      outputField: [wrapper.outputField, Validators.required],
      scriptFormat: sfArray,
    });
  }

  // === Stringify ===
  stringifySingle(group: any): string {
  if (!group) return '';

  // Simple rule
  if (group.field) {
    return `${group.field} ${group.operator} '${group.value}'`;
  }

  // Group rule
  if (group.rules && Array.isArray(group.rules)) {
    const parts = group.rules.map((r: any) => this.stringifySingle(r));

    // If only one child, no need for parentheses
    if (parts.length === 1) {
      return parts[0];
    }

    // Otherwise join with condition and wrap in parentheses
    return `(${parts.join(` ${group.condition} `)})`;
  }

  return '';
}


  stringifyIfThen(rules: IfThenRule[], outputField: string): string {
    let sql = '';
    rules.forEach((rule, idx) => {
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

  // === Computed Preview ===
  preview = computed(() => {
    const value = this.formValue();
    if (!value) return '';

    const script = value.criteria?.script;
    if (!script || !script.rules || script.rules.length === 0) return '';

    //
    if (script.format === 'SINGLE') {
      const groups = script.rules as GroupRule[];
      const joiner = script.rootCondition || 'AND';
      return groups.map((g) => this.stringifySingle(g)).join(` ${joiner} `);
    }

    if (script.format === 'IF_THEN') {
      const wrapper = script.rules[0] as IfThenWrapper;
      return this.stringifyIfThen(wrapper.scriptFormat, wrapper.outputField);
    }

    return '';
  });

  // === Validation Helper ===
  private markAllControlsTouched(control: AbstractControl | null): void {
    if (!control) return;

    if (control instanceof FormGroup) {
      Object.values(control.controls).forEach((child) =>
        this.markAllControlsTouched(child)
      );
      control.markAsTouched();
      control.updateValueAndValidity({ onlySelf: true });
    } else if (control instanceof FormArray) {
      control.controls.forEach((child) =>
        this.markAllControlsTouched(child)
      );
      control.markAsTouched();
      control.updateValueAndValidity({ onlySelf: true });
    } else {
      control.markAsTouched();
      control.updateValueAndValidity({ onlySelf: true });
    }
  }

  // === Submit ===
  submit() {
    this.markAllControlsTouched(this.form);

    if (this.form.invalid) {
      alert('Please fix validation errors.');
      return;
    }

    const payload = this.form.getRawValue();
    console.log('✅ Final JSON (typed):', payload);
    console.log('✅ Final Expression:', this.preview());
  }
}
