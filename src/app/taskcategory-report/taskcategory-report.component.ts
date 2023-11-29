import { Component, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-taskcategory-report',
  templateUrl: './taskcategory-report.component.html',
  styleUrls: ['./taskcategory-report.component.css']
})
export class TaskcategoryReportComponent implements OnInit {

  @Output()  title = 'Task Category'
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

}
