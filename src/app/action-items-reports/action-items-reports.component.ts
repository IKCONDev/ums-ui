import { Component, Output } from '@angular/core';

@Component({
  selector: 'app-action-items-reports',
  templateUrl: './action-items-reports.component.html',
  styleUrls: ['./action-items-reports.component.css']
})
export class ActionItemsReportsComponent {
  reportType: string;
  @Output() title = 'Meeting Reports'
  
}
