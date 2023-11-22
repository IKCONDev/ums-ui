import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-meeting-reports',
  templateUrl: './meeting-reports.component.html',
  styleUrls: ['./meeting-reports.component.css']
})
export class MeetingReportsComponent implements OnInit {

  reportType: string;

  constructor(private router: Router, private activatedRoute: ActivatedRoute){
    this.activatedRoute.queryParams.subscribe(param => {
      this.reportType = param['reportType'];
      console.log(this.reportType)
    })
  }

  ngOnInit(): void {
    
  }

}
