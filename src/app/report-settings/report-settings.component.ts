import { Component, Output, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-report-settings',
  templateUrl: './report-settings.component.html',
  styleUrls: ['./report-settings.component.css']
})
export class ReportSettingsComponent implements OnInit {
  @Output() title: string = 'Reports'
  reportType: string ;

  constructor(private router: Router, private activatedRoute: ActivatedRoute){

  }

  ngOnInit(): void {
    
  }

  setMeetingReportType(reportType: string){
    this.reportType = reportType;
    this.router.navigate(['/meeting-report'],{queryParams:{reportType:reportType}})
  }

}
