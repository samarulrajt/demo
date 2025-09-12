import { Component } from '@angular/core';
import { ITooltipAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-custom-tooltip',
  template: `
    <div class="custom-tooltip">
      {{ params.value }}
    </div>
  `,
  styles: [`
    .custom-tooltip {
      background-color: #333;
      color: #fff;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
    }
  `]
})
export class CustomTooltipComponent implements ITooltipAngularComp {
  public params: any;

  agInit(params: any): void {
    this.params = params;
  }
}