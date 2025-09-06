// action-cell-renderer.component.ts
@Component({
  selector: 'app-action-cell',
  template: `
    <button type="button" class="btn" (click)="edit()" [disabled]="!hasAdminRole">Edit</button> |
    <button type="button" class="btn" (click)="clone()" [disabled]="!hasAdminRole">Clone</button>
  `
})
export class ActionCellRendererComponent implements ICellRendererAngularComp {
  public params: any;
  hasAdminRole = false; // inject your real role check here

  agInit(params: any): void {
    this.params = params;
    this.hasAdminRole = params.context.hasAdminRole;
  }

  edit() {
    this.params.context.componentParent.onEdit(this.params.data, 'edit', 'inclusion');
  }

  clone() {
    this.params.context.componentParent.onClone(this.params.data, 'clone', 'inclusion');
  }
}