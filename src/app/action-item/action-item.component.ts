import { Component,OnInit, Output } from '@angular/core';
import { ActionItems } from 'src/app/model/actionitem.model';
import { ActionService } from './service/action.service';
import { Task } from '../model/task.model';
import { TaskService } from '../task/service/task.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-action-item',
  templateUrl: './action-item.component.html',
  styleUrls: ['./action-item.component.css']
})
export class ActionItemComponent  implements OnInit{

  @Output() title: string = 'Actions'
  actionItemCount : number =0;
  id: number;
  //actionItem:ActionItems = new ActionItems();
  task_array :Task[];
  actions: Object;
  isfill: boolean = false;
  actionItems: ActionItems[];
  actionItems_new: ActionItems;
  email: string;
  updatedetails = {
    actionItemId: 0,
    meetingId: 0,
    emailId:'',
    actionItemOwner:'',
    actionItemTitle: '',
    actionItemDescription: '',
    actionPriority: '',
    actionStatus: '',
    startDate: '',
    endDate: ''

  }
  constructor(private service: ActionService, private taskService:TaskService,private toastr: ToastrService) { 
 
    $(function () {
      $('table').on('click', 'a.showmore', function (e) {
        e.preventDefault();
        //select thec closest tr of where the showmore link is present, and thats where th action items should be displayed
        var targetrow = $(this).closest('tr').next('.detail');
        targetrow.show().find('div').slideToggle('slow', function () {
          if (!$(this).is(':visible')) {
            targetrow.hide();
          }
        });
      });
    });

  }
  ngOnInit(): void {
    console.log("logged in userId is: "+localStorage.getItem('email'));
   /* this.service.getAllActionItems().subscribe(response => {
      console.log(this.actionItems);
      this.actionItems = response.body;
      this.actionItemCount = response.body.length;
      
    });*/
    this.service.getUserActionItemsByUserId(localStorage.getItem('email')).subscribe(res=>{
      this.actionItems = res.body;
      console.log(res.body);
      this.actionItemCount = res.body.length;
    });
  };

  editData(id: number) {
    this.service.getActionItemById(id).subscribe(response => {
      this.actionItems_new = response.body;
      console.log(this.actionItems_new);
      this.updatedetails.actionItemId = this.actionItems_new.actionItemId;
      this.updatedetails.actionItemDescription = this.actionItems_new.actionItemDescription;
      this.updatedetails.meetingId=this.actionItems_new.meetingId;
      this.updatedetails.actionStatus=this.actionItems_new.actionStatus;
      console.log(this.actionItems_new.actionItemDescription);
      this.updatedetails.actionItemTitle = this.actionItems_new.actionItemTitle;
      this.updatedetails.actionPriority = this.actionItems_new.actionPriority;
      this.updatedetails.startDate = this.actionItems_new.startDate;
      this.updatedetails.endDate = this.actionItems_new.endDate;

    });
    console.log("data fetching");

  }
  data:object={};
  //Update the Details
  updateDetails(event:any) {
      this.id=this.updatedetails.actionItemId;
      console.log(this.updatedetails.actionPriority);
      console.log(this.id);
      console.log(this.updatedetails);
      this.service.updateActionItem(this.updatedetails).subscribe(response=>{
            this.data=response.body;
            
            console.log(this.data);
      });
    }
    addDetails = {
      actionItemId: 0,
      meetingId: 0,
      emailId:'',
      actionItemOwner:'',
      actionItemTitle: '',
      actionItemDescription: '',
      actionPriority: '',
      actionStatus: 'NotConverted',
      startDate: '',
      endDate: ''
    }
    ViewTaskDetails(){
      console.log("fetching task details");
      this.service.getAlltasks().subscribe(response=>{
        this.task_array =response.body;
        console.log(this.task_array);
      });
      console.log("request success");

    }

    //Add Action Item method
    addActionItems(){
    
      this.addDetails;
      
    }
    response:Object;
    actions_details :Object
    //save Action Item method
    saveDetails(event:any){

      console.log(this.addDetails);
      this.addDetails.emailId = localStorage.getItem('email');
      this.service.saveActionItem(this.addDetails).subscribe(response=>{
           this.response=response.body;
           this.actions_details= response.body;
           console.log(this.response);
      });
    }
    actionItem_id: number;
   
    checkCheckBoxes(){
    var actionItemsToBeDeleted=[];
      var table = document.getElementById("myTable")
      console.log(table)
      //for(var i=0; i<tables.length; i++){
      var rows = table.getElementsByTagName("tr");
      var value: number[];
      // Loop through each row
      for (var i = 0; i < rows.length; i++) {
          
           var row = rows[i];
           console.log("the value is"+rows[i]);
  
           var checkbox = row.querySelector("input[type='checkbox']") as HTMLInputElement;
           console.log(checkbox)
           // Check if the checkbox exists in the row
          if (checkbox) {
            
             console.log("value of checkbox is " + checkbox.value);
            
            
          // Check the 'checked' property to get the state (true or false)
              if (checkbox.checked) {
                console.log("the checkbox is selected");
                 actionItemsToBeDeleted.push(checkbox.value);
              }
          }
          
      }
      console.log(actionItemsToBeDeleted);
    
      this.deleteActionItems(actionItemsToBeDeleted);
      
    }
    isActionsDeleted : boolean= false;
    deleteActionItems(actionItemList: any[]){

      this.service.deleteSelectedActionItemsByIds(actionItemList).subscribe(res=>{
            this.isActionsDeleted = res.body;
            console.log(this.isActionsDeleted);
            if(this.isActionsDeleted){
              console.log("actions deleted");
              this.toastr.success("action Items Deleted");
              
           }
           else{
               console.log("actions not deleted");
               this.toastr.error("action Items are not deleted try again");
           }
      })
     

    }

    temp_data :number
    str: string;
    //delete single action Item data
    deleteData(id:number):any{
       this.actionItem_id=id;
       console.log("the id is:"+id);
       this.service.deleteActionItem(this.actionItem_id).subscribe(res =>{
         this.temp_data = res.body;
         console.log("the returned value is:",this.temp_data);
         if(this.temp_data===1){
          console.log("record deleted deleted");
         }
         else{
           console.log("record not deleted");
         }
        
      });
      return this.actionItem_id;
       
       
    }
   
    toggleSubmitAndDelete(actionItemid:number, id: number){

      var table = document.getElementById("myTable" + actionItemid);
      var rows = table.getElementsByTagName("tr");
      var value: number[];
      // Loop through each row
     for (var i = 0; i < rows.length; i++) {
       var row = rows[i];
       var checkbox = row.querySelector("input[type='checkbox']") as HTMLInputElement;

     }
  }

}
