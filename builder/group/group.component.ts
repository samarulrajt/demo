import { Component, Input } from '@angular/core';
import { FormArray, FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
    return (this.group.get('rules') as FormArray).controls as FormGroup[];
  }

  addRule() {
    (this.group.get('rules') as FormArray).push(this.builder.newSimpleRule());
  }

  addGroup() {
    (this.group.get('rules') as FormArray).push(this.builder.newGroup());
  }

  removeRule(i: number) {
    (this.group.get('rules') as FormArray).removeAt(i);
  }
}
