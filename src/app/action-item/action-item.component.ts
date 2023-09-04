import { Component,OnInit, Output } from '@angular/core';
import { ActionItems } from 'src/app/model/actionitem.model';
import { ActionService } from './service/action.service';

@Component({
  selector: 'app-action-item',
  templateUrl: './action-item.component.html',
  styleUrls: ['./action-item.component.css']
})
export class ActionItemComponent  implements OnInit{

  @Output() title: string = 'Actions'
  id: number;
  //actionItem:ActionItems = new ActionItems();
  actions: Object;
  isfill: boolean = false;
  actionItems: ActionItems[];
  actionItems_new: ActionItems;
  updatedetails= {
    id:0 ,
    actionTitle: '',
    description: '',
    startDate: '',
    endDate: '',
    actionStatus: '',
    actionPriority: '',
    eventid:''

  }
  constructor(private service: ActionService) { }
  ngOnInit(): void {
    this.service.getAllActionItems().subscribe(response => {
      console.log(this.actionItems);
      this.actionItems = response.body;
    });
  };

  editData(id: number) {
    this.service.getActionItemById(id).subscribe(response => {
      this.actionItems_new = response.body;
      console.log(this.actionItems_new);
      this.updatedetails.id = this.actionItems_new.id;
      this.updatedetails.description = this.actionItems_new.description;
      this.updatedetails.eventid=this.actionItems_new.eventid;
      this.updatedetails.actionStatus=this.actionItems_new.actionStatus;
      console.log(this.actionItems_new.description);
      this.updatedetails.actionTitle = this.actionItems_new.actionTitle;
      this.updatedetails.actionPriority = this.actionItems_new.actionPriority;
      this.updatedetails.startDate = this.actionItems_new.startDate;
      this.updatedetails.endDate = this.actionItems_new.endDate;

    });
    console.log("data fetching");

  }
  data:object={};
  //Update the Details
  updateDetails(event:any) {

      this.id=this.updatedetails.id;
      console.log(this.updatedetails.actionPriority);
      console.log(this.id);
      console.log(this.updatedetails);
      this.service.updateActionItem(this.updatedetails).subscribe(response=>{
            this.data=response.body;
            
            console.log(this.data);
      });
    }
    addDetails= {
      id:0,
      actionTitle: '',
      description: '',
      startDate: '',
      endDate: '',
      actionStatus: '',
      actionPriority: '',
      eventid:''
  
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
  
      this.service.saveActionItem(this.addDetails).subscribe(response=>{
           this.response=response.body;
           this.actions_details= response.body;
           console.log(this.response);
      });
    }
    actionItem_id: number;
    enablecheckbox: boolean;
 
    checked(){

      let checkbox = document.getElementById('checkbox') as HTMLInputElement | null;
     
        if (checkbox.checked === true ) {
           
           console.log("selected checkbox");
        } else {
           console.log("not selected checkbox");
        }
    }
     
   
    temp_data :number
    str: string;
    //delete data
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

}
