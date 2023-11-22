
import { AfterViewInit, Component, OnDestroy, Output } from '@angular/core';
import { OnInit } from '@angular/core';
import { BatchDetails } from '../model/BatchDetails.model';
import { BatchDetailsService } from './service/batch-details.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-batch-details',
  templateUrl: './batch-details.component.html',
  styleUrls: ['./batch-details.component.css']
})
export class BatchDetailsComponent implements OnInit,AfterViewInit,OnDestroy{


  loggedInUserRole = localStorage.getItem('userRole');
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
          order: [[1,'asc']]
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

  isBatchDetailsText:boolean=false;
  displayText:boolean=false;
  isComponentLoading:boolean=false;

   /**
    * 
    * @param reportservice 
    */
   constructor (private batchService:BatchDetailsService, private router: Router){}

   /**
    * 
    */
   ngOnInit(): void {
          this.displayText=true;
          this.isComponentLoading=true;
          this.isBatchDetailsText=true;

    if(this.loggedInUserRole != 'ADMIN' && this.loggedInUserRole != 'SUPER_ADMIN'){
      this.router.navigateByUrl('/unauthorized');
    }
      
      this.batchService.getAllBatchProcessDetails().subscribe(
         res=>{
          this.batchDetails = res.body;
          this.batchRecordsCount = this.batchDetails.length;
          if(this.batchRecordsCount===0){
            setTimeout(()=>{
              this.displayText=false;
              this.isComponentLoading=false;
            },400)
          }else{
            setTimeout(()=>{
              this.isComponentLoading=false;
              this.isBatchDetailsText=false;
            },400)
          }
     });
     this.initializeJqueryDataTable();
   }
}

