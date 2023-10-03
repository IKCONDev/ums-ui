import { Component, Output } from '@angular/core';
import { OnInit } from '@angular/core';
import { ReportService } from './service/reports.service';
import { BatchDetails } from '../model/batchDetails.model';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {

  batchDetails:BatchDetails[];

   @Output() title: string='Reports'

   constructor (private reportservice:ReportService){}
   ngOnInit(): void {
      this.reportservice.getAllBatchProcessDetails().subscribe(
         res=>{
          this.batchDetails = res.body;
          console.log(this.batchDetails);
           this.batchDetails.filter(batchDetail => {
             
           })
     });
   }
}
