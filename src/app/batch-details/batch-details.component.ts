
import { AfterViewInit, Component, OnDestroy, Output } from '@angular/core';
import { OnInit } from '@angular/core';
import { BatchDetails } from '../model/BatchDetails.model';
import { BatchDetailsService } from './service/batch-details.service';
@Component({
  selector: 'app-batch-details',
  templateUrl: './batch-details.component.html',
  styleUrls: ['./batch-details.component.css']
})
export class BatchDetailsComponent implements OnInit,AfterViewInit,OnDestroy{


  
  batchDetails:BatchDetails[];
  batchRecordsCount: number = 0;
   @Output() title:string='Batch Details';
  private table: any;

  ngAfterViewInit(): void {
    setTimeout(() => {
      $(document).ready(() => {
        this.table = $('#table').DataTable({
          paging: true,
          searching: true, // Enable search feature
          pageLength: 7,
          // Add other options here as needed
        });
      });
    },100)
  }

  initializeJqueryDataTable(){
    setTimeout(() => {
      $(document).ready(() => {
        this.table = $('#table').DataTable({
          paging: true,
          searching: true, // Enable search feature
          pageLength: 7,
          // Add other options here as needed
        });
      });
    },100)
  }

  ngOnDestroy(): void {
    if (this.table) {
      this.table.destroy();
    }
  }

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

