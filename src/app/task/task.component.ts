import { Component, Output } from '@angular/core';
import { Task } from '../model/task.model';
import { TaskService } from './service/task.service';
import { Toast, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent {

  @Output() title: string = 'Tasks'
  task :Task[]
  task_Details: Task;
  taskCount : number =0;
  tabOpened : string;

  update_Task={
     taskId:0,
     taskTitle:'',
     taskDescription:'',
     taskPriority:'',
     startDate:'',
     dueDate:'',
     taskOwner:'',
     organizer:'',
     status:'',
     actionItemId:0,
     actionTitle:'',
     userId:''
     
  }
  constructor(private service :TaskService, private toastr: ToastrService){}
  ngOnInit(): void {

   /* this.service.getAlltaskDetails().subscribe(res=>{
       this.task =res.body;
       this.taskCount = res.body.length;
       console.log(this.task);
    });*/

    this.service.getTaskByUserId(localStorage.getItem('email')).subscribe(res=>{
      this.task =res.body;
      this.taskCount = res.body.length;
      console.log(this.task);
   });
   
    
  }
  addTask(){
    
  }
  editTask(id:number){
    this.service.getTask( id).subscribe(res=>{
      this.update_Task = res.body;
    });

  }
  data:Object;
  updateTaskDetails(event:any){
    console.log()
    this.service.updateTask(this.update_Task).subscribe(response =>{
      this.data = response.body;
    });
 
  }

  checkCheckBoxes(){
     var tasksToBeDeleted=[];
      var table = document.getElementById("myTable1")
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
                 tasksToBeDeleted.push(checkbox.value);
              }
          }
          
      }
      console.log(tasksToBeDeleted);
      this.deleteTasks(tasksToBeDeleted);
      
    }
    istaskDeleted : boolean= false;
    deleteTasks(taskIds: any[]){

      this.service.deleteAllTasksByTaskIds(taskIds).subscribe(res=>{
            this.istaskDeleted = res.body;
            console.log(this.istaskDeleted);
            if(this.istaskDeleted){
              console.log("tasks deleted");
              this.toastr.success("tasks Deleted");
              
           }
           else{
               console.log("tasks not deleted");
               this.toastr.error("action Items are not deleted try again");
           }
      })
     

    }

}
