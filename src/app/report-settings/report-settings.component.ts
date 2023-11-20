import { Component, Output, OnInit} from '@angular/core';

@Component({
  selector: 'app-report-settings',
  templateUrl: './report-settings.component.html',
  styleUrls: ['./report-settings.component.css']
})
export class ReportSettingsComponent implements OnInit {
  @Output() title: string = 'Reports'
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

}
