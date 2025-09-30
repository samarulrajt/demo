import { Component, Input } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GroupComponent } from '../group/group.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ifthen',
  templateUrl: './ifthen.component.html',
  standalone: true,
  styleUrls: ['./ifthen.component.scss'],
  imports: [GroupComponent, FormsModule, ReactiveFormsModule, CommonModule]
})
export class IfThenComponent {
  @Input() rule!: FormGroup;

  get conditionGroup(): FormGroup {
    return this.rule.get('condition') as FormGroup;
  }
}
