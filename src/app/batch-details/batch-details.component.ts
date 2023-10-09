
import { Component, Output } from '@angular/core';
import { OnInit } from '@angular/core';
import { ReportService } from './service/reports.service';
import { BatchDetails } from '../model/batchDetails.model';
@Component({
  selector: 'app-batch-details',
  templateUrl: './batch-details.component.html',
  styleUrls: ['./batch-details.component.css']
})
export class BatchDetailsComponent implements OnInit{

  batchDetails:BatchDetails[];

   @Output() title:string='Batch Details'

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
   }
}

