import { Component, Input } from '@angular/core';
import { FormArray, FormGroup, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RuleBuilderComponent } from '../rule-builder/rule-builder.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls:['./group.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule]
})
export class GroupComponent {
  @Input() group!: FormGroup;

  constructor(private fb: FormBuilder, public builder: RuleBuilderComponent) { }

  get rules(): FormGroup[] {
    return (this.group.get('rules') as FormArray<FormGroup>).controls;
  }

  addRule() {
    const arr = this.group.get('rules') as FormArray<FormGroup>;
    arr.push(
      this.fb.group({
        field: [this.builder.fields[0], Validators.required],
        operator: [this.builder.operators[0], Validators.required],
        value: ['', Validators.required],
      })
    );
  }

  addGroup() {
    const arr = this.group.get('rules') as FormArray<FormGroup>;
    arr.push(
      this.fb.group({
        condition: ['AND', Validators.required],
        rules: this.fb.array([]),
      })
    );
  }

  removeRule(index: number) {
    const arr = this.group.get('rules') as FormArray<FormGroup>;
    arr.removeAt(index);
  }
}
