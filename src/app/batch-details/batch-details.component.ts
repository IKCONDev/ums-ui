
import { Component, Output } from '@angular/core';
import { OnInit } from '@angular/core';
import { BatchDetails } from '../model/batchDetails.model';
import { BatchDetailsService } from './service/batch-details.service';
@Component({
  selector: 'app-batch-details',
  templateUrl: './batch-details.component.html',
  styleUrls: ['./batch-details.component.css']
})
export class BatchDetailsComponent implements OnInit{

  batchDetails:BatchDetails[];

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
          console.log(this.batchDetails);
             this.batchDetails.filter(batchDetail => {
             
           })
     });
   }
}

