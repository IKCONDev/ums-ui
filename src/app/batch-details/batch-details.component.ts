
import { Component, Output } from '@angular/core';
import { OnInit } from '@angular/core';
import { BatchDetails } from '../model/BatchDetails.model';
import { BatchDetailsService } from './service/batch-details.service';
@Component({
  selector: 'app-batch-details',
  templateUrl: './batch-details.component.html',
  styleUrls: ['./batch-details.component.css']
})
export class BatchDetailsComponent implements OnInit{

  batchDetails:BatchDetails[];
  batchRecordsCount: number = 0;
   @Output() title:string='Batch Details';

   /**
    * 
    * @param reportservice 
    */
   constructor (private batchService:BatchDetailsService){}

   /**
    * 
    */
   ngOnInit(): void {
      this.batchService.getAllBatchProcessDetails().subscribe(
         res=>{
          this.batchDetails = res.body;
          this.batchRecordsCount = this.batchDetails.length;
     });
   }
}

