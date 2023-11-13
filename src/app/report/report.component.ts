import { Component, Output } from '@angular/core';
import { OnInit } from '@angular/core';
import { ReportService } from './service/reports.service';
import { BatchDetails } from '../model/BatchDetails.model';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {

  batchDetails:BatchDetails[];

   @Output() title:string='Reports'

   /**
    * 
    * @param reportservice 
    */
   constructor (private reportservice:ReportService){}

   /**
    * 
    */
   ngOnInit(): void {
      this.reportservice.getAllBatchProcessDetails().subscribe(
         res=>{
          this.batchDetails = res.body;
          console.log(this.batchDetails);
             this.batchDetails.filter(batchDetail => {
             
           })
     });
     //get task List report
     this.getTaskListReport();
     setTimeout(()=> {
      this.createTaskListChart(this.taskListCount);
     },100)
   }

   taskListCount = 0;
   getTaskListReport(){
    this.reportservice.getAllTasksReport().subscribe({
      next: response => {
        console.log(response.body)
        this.taskListCount = response.body.length;
      }
    })
   }

  taskListChart=null;
  createTaskListChart(taskListCount: number){
     this.taskListChart = new Chart("taskListChart", {
      type: 'bar',
      data: {// values on X-Axis
        xLabels: ['Total tasks'],
	       datasets: [
          {
            label: "Total Task",
            data: [this.taskListCount],
            backgroundColor: 'rgba(255, 99, 132, 0.8)', // Red
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 3,
          },
        ]
        
      },
      options: {
        aspectRatio: 1.7,
        scales: {
          x: {
            display: true,
            grid: {
              display: false,
            },
          },
          y: {
            display: true,
            grid: {
              display: true,
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align:'center',
            labels: {
              usePointStyle: true,
              font: {
                size: 12,
              },
              padding: 16,
              pointStyle:'rectRounded',
          
            },
          },
          title: {
            display: true,
            text: 'Total task list of all users',
            font: {
              size: 14,
            },
          },
        },
      }
    });
  }


}
