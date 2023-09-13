import { Component } from '@angular/core';
import { Task } from '../model/task.model';
import { TaskService } from './service/task.service';
import { Toast, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent {

  task :Task[]
  task_Details: Task;
  taskCount : number =0;

  update_Task={
     id:0,
     taskTitle:'',
     taskDescription:'',
     taskPriority:'',
     startDate:'',
     dueDate:'',
     assignee:'',
     organizer:'',
     status:'',
     actionItemId:0,
     actionTitle:''
     
  }
  constructor(private service :TaskService, private toastr: ToastrService){}
  ngOnInit(): void {

    this.service.getAlltaskDetails().subscribe(res=>{
       this.task =res.body;
       this.taskCount = res.body.length;
       console.log(this.task);
    });
    
  }
  addTask(){
    
  }
  editTask(id:number){
    this.service.getSingleTaskDetails( id).subscribe(res=>{
      this.update_Task = res.body;
    });

  }
  data:Object;
  updateTaskDetails(event:any){
     
    console.log()
    this.service.updateTaskDetails(this.update_Task).subscribe(response =>{

      this.data = response.body;

    });
 
  }

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
    istaskDeleted : boolean= false;
    deleteActionItems(task: any[]){

      this.service.deleteSelectedTasks(task).subscribe(res=>{
            this.istaskDeleted = res.body;
            console.log(this.istaskDeleted);
            if(this.istaskDeleted){
              console.log("actions deleted");
              this.toastr.success("action Items Deleted");
              
           }
           else{
               console.log("actions not deleted");
               this.toastr.error("action Items are not deleted try again");
           }
      })
     

    }

}
