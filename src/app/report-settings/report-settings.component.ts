import { Component, Output, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskCategory } from '../model/TaskCategory.model';
import { TaskCategoryService } from '../task-category/service/task-category.service';

@Component({
  selector: 'app-report-settings',
  templateUrl: './report-settings.component.html',
  styleUrls: ['./report-settings.component.css']
})
export class ReportSettingsComponent implements OnInit {
  @Output() title: string = 'Reports'
  reportType: string ;
  taskCategoriesList: TaskCategory [];

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private tastCategory: TaskCategoryService){

  }

  ngOnInit(): void {
    this.getAllTaskCategories();
  }

  setMeetingReportType(reportType: string){
    this.reportType = reportType;
    this.router.navigate(['/meeting-report'],{queryParams:{reportType:reportType}})
  }

  setTaskReportType(reportType: string){
    this.reportType = reportType;
    this.router.navigate(['/task-reports'],{queryParams:{reportType:reportType}})
  }

  setActionItemReportType(reportType: string){
    console.log(reportType)
    this.reportType = reportType;
    this.router.navigate(['/actionitem-reports'],{queryParams:{reportType:reportType}})
  }

  getAllTaskCategories(){
    this.tastCategory.getAllTaskCategories().subscribe(
      Response=>{ 
        this.taskCategoriesList = Response.body;
      }
    )

   // this.reportType = reportType;
    //this.router.navigate(['/action-items-reports'])
  }

}
