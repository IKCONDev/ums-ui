import { Component, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-action-item-reports',
  templateUrl: './action-item-reports.component.html',
  styleUrls: ['./action-item-reports.component.css']
})
export class ActionItemsReportsComponent {
  reportType: string;
  @Output() title = 'Action Item Reports'


  constructor(private activatedRoute:ActivatedRoute){
    this.activatedRoute.queryParams.subscribe(param => {
      this.reportType = param['reportType'];
      console.log(this.reportType)
    }) 
  }
  
}
