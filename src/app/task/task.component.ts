import { Component, Input, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Task } from '../model/task.model';
import { TaskService } from './service/task.service';
import { Toast, ToastrService } from 'ngx-toastr';
import { event } from 'jquery';
import { MeetingService } from '../meetings/service/meetings.service';
import { NgForm } from '@angular/forms';
import { HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent {

  @Output() title: string = 'Tasks'
  task: Task[]
  task_Details: Task;
  taskCount: number = 0;
  tabOpened: string;
  organizedTasks: Task[];
  assignedTasks: Task[];
  assignedTasksCount = 0;


  isTaskTitleValid = false;
  isTaskDescriptionValid = false;
  isTaskPriorityValid = false;
  isTaskOwnerValid = false;
  isTaskStartDateValid = false;
  isTaskDueDateValid = false;
  isTaskStatusValid = false;

  isSaveButtonDisabled = true;


  update_Task = {
    taskId: 0,
    taskTitle: '',
    taskDescription: '',
    taskPriority: '',
    startDate: '',
    dueDate: '',
    taskOwner: '',
    organizer: '',
    status: '',
    actionItemId: 0,
    actionTitle: '',
    userId: ''

  }
  /**
   * 
   * @param service 
   * @param meetingService 
   * @param toastr 
   */
  constructor(private service: TaskService, private meetingService: MeetingService, private toastr: ToastrService) { }

  /**
   * 
   */
  ngOnInit(): void {

    /* this.service.getAlltaskDetails().subscribe(res=>{
        this.task =res.body;
        this.taskCount = res.body.length;
        console.log(this.task);
     });*/

    this.tabOpened = localStorage.getItem('taskTabOpened')
    console.log(this.tabOpened)
    this.getTasks(this.tabOpened);
    this.pastDateTime();
  }

  /**
   * 
   * @param tabOpened 
   */
  getTasks(tabOpened: string) {
    console.log(tabOpened)
    localStorage.setItem('taskTabOpened', tabOpened);
    this.tabOpened = localStorage.getItem('taskTabOpened')
    console.log(localStorage.getItem('taskTabOpened'))

    if (this.tabOpened === 'AssignedTask') {
      document.getElementById("AssignedTask").style.borderBottom = '2px solid white';
      document.getElementById("AssignedTask").style.width = 'fit-content';
      document.getElementById("AssignedTask").style.paddingBottom = '2px';
      document.getElementById("OrganizedTask").style.borderBottom = 'none';
      document.getElementById("delete_button").style.display="none";
      this.service.getAssignedTasksOfUser((localStorage.getItem('email'))).subscribe

        (response => {
          console.log(response.body)
          //extract the meetings from response object
          this.assignedTasks = response.body;
          this.assignedTasksCount = response.body.length
          localStorage.setItem('assignedTasksCount', this.assignedTasksCount.toString());
        });
    }
    else {
      document.getElementById("OrganizedTask").style.borderBottom = '2px solid white';
      document.getElementById("OrganizedTask").style.width = 'fit-content';
      document.getElementById("OrganizedTask").style.paddingBottom = '2px';
      document.getElementById("AssignedTask").style.borderBottom = 'none';
      document.getElementById("delete_button").style.display="block";

      this.service.getTaskByUserId(localStorage.getItem('email')).subscribe(res => {
        this.task = res.body;
        this.taskCount = res.body.length;
        console.log(this.task);
      });
    }

  }

  //validate Task Title
  taskTitleErrrorInfo = "";

  /**
   * 
   * @returns 
   */
  validateTaskTitle() {
    //var taskTitle = event.target.value;
    if (this.update_Task.taskTitle == "") {
      this.taskTitleErrrorInfo = 'Enter the Task Title';
      this.isTaskTitleValid = false;

    }
    else if (this.update_Task.taskTitle.length < 5) {
      this.taskTitleErrrorInfo = 'task title should be more than 5 characters';
      this.isTaskTitleValid = false;
    }
    else {
      this.taskTitleErrrorInfo = '';
      this.isTaskTitleValid = true;
    }
    return this.isTaskTitleValid;

  }
  //Validating Task Description
  taskDescriptionErrorInfo = "";

  /**
   * 
   * @returns 
   */
  validateTaskDescription() {
    // var taskDescription=event.target.value;
    if (this.update_Task.taskDescription === '') {
      this.taskDescriptionErrorInfo = 'Enter task description';
      this.isTaskDescriptionValid = false;
    }
    else if (this.update_Task.taskDescription.length <= 10) {
      this.taskDescriptionErrorInfo = 'task description should be more than 10 characters';
      this.isTaskDescriptionValid = false;
    }
    else {
      this.taskDescriptionErrorInfo = '';
      this.isTaskDescriptionValid = true;

    }
    return this.isTaskDescriptionValid;
  }

  //validating Task Priority
  taskPriorityErrorInfo = "";

  /**
   * 
   * @returns 
   */
  validateTaskPriority() {
    //var taskPriority = event.target.value;
    if (this.update_Task.taskPriority === '') {
      this.taskPriorityErrorInfo = 'task priority should not be empty';
      this.isTaskPriorityValid = false;
    }
    else if (this.update_Task.taskPriority == 'select') {
      this.taskPriorityErrorInfo = 'task priority is required';
      this.isTaskPriorityValid = false;
    }
    else {
      this.taskPriorityErrorInfo = '';
      this.isTaskPriorityValid = true;
    }
    return this.isTaskPriorityValid;
  }


  taskStatusErrorInfo = '';

  /**
   * 
   * @returns 
   */
  validateTaskStatus() {
    // var taskStatus = event.target.value;
    if (this.update_Task.status === 'Select') {
      this.taskStatusErrorInfo = 'Status is required';
      this.isTaskStatusValid = false;

    }
    else {
      this.taskStatusErrorInfo = '';
      this.isTaskStatusValid = true;
    }
    return this.isTaskStatusValid;
  }

  taskOwnerErrorInfo = "";

  /**
   * 
   * @returns 
   */
  validateTaskOwner() {
    // var taskOwner = event.target.value;

    if (this.update_Task.taskOwner == '' || this.update_Task.taskOwner === null) {

      this.taskOwnerErrorInfo = 'task Owner is required';
      this.isTaskOwnerValid = false;
    }
    else if (this.update_Task.taskOwner == '') {
      this.taskOwnerErrorInfo = 'task Owner is required';
      this.isTaskOwnerValid = false;

    }
    else {
      this.taskOwnerErrorInfo = '';
      this.isTaskOwnerValid = true;
    }
    return this.isTaskOwnerValid;

  }

  taskStartDateErrorInfo = "";

  /**
   * 
   * @returns 
   */
  validateTaskStartDate() {
    //var taskStartDate=event.target.value;


    if (this.update_Task.startDate === '') {
      this.taskStartDateErrorInfo = 'select the start date';
      this.isTaskStartDateValid = false;
    }
    else if (new Date(this.update_Task.startDate.toString()) < new Date(Date.now())) {
      this.taskStartDateErrorInfo = 'Start date cannot be previous date.'
      this.isTaskStartDateValid = false;
    }
    else {
      this.taskStartDateErrorInfo = '';
      this.isTaskStartDateValid = true;
    }
    return this.isTaskStartDateValid;
  }

  taskDueDateErrorInfo = "";

  /**
   * 
   * @returns 
   */
  validateTaskDueDate() {
    // var taskDueDate=event.target.value;
    if (this.update_Task.dueDate === '') {
      this.taskDueDateErrorInfo = 'select the due date';
      this.isTaskDueDateValid = false;
    }
    else if (new Date(this.update_Task.dueDate.toString()) < new Date(this.update_Task.startDate.toString())) {
      this.taskDueDateErrorInfo = 'Date should`nt lessthan startdate';
      this.isTaskDueDateValid = false;
    }
    else {
      this.taskDueDateErrorInfo = '';
      this.isTaskDueDateValid = true;
    }
    return this.isTaskDueDateValid;
  }


  /**
   * 
   */
  addTask() {
    //TODO: optional
  }

  /**
   * 
   * @param id 
   */
  editTask(id: number) {
    this.isSaveButtonDisabled = false;
    this.service.getTask(id).subscribe(res => {
      this.update_Task = res.body;
    });
    this.isSaveButtonDisabled = true;

  }

  data: Object;
  response: Object;

  /**
   * 
   * @param form 
   */
  updateTaskDetails(form: NgForm) {
    let isTitleValid = true;
    let isDescriptionValid = true;
    let isPriorityValid = true;
    let isStartDateValid = true;
    let isDueDateValid = true;
    let isStatusValid = true;
    if (this.isTaskTitleValid === false) {
      var valid = this.validateTaskTitle();
      isTitleValid = valid;

    }
    if (this.isTaskDescriptionValid === false) {
      var valid = this.validateTaskDescription();
      isDescriptionValid = valid;
    }
    if (this.isTaskPriorityValid === false) {
      var valid = this.validateTaskPriority();
      isPriorityValid = valid;
    }
    if (this.isTaskStartDateValid === false) {
      var valid = this.validateTaskStartDate();
      isStartDateValid = valid;
    }
    if (this.isTaskDueDateValid === false) {
      var valid = this.validateTaskDueDate();
      isDueDateValid = valid;
    }
    if (this.isTaskStatusValid === false) {
      var valid = this.validateTaskStatus();
      isStatusValid = valid;
    }
    if (isTitleValid === true && isDescriptionValid === true && isPriorityValid === true && isStatusValid === true &&
      isDueDateValid === true && isStatusValid === true) {
      this.service.updateTask(this.update_Task).subscribe(response => {
        this.response = response.body;
        //this.data = response.body;
        if (response.status === HttpStatusCode.Ok) {
          this.toastr.success('task updated Successfully');
          document.getElementById('closeUpdateModal').click();
          setTimeout(()=>{
            window.location.reload();
          },1000)
        }
      });
    }
  }

  /**
   * 
   * @param form 
   */
  clearErrorMessages(form: NgForm) {
    this.taskTitleErrrorInfo = "";
    this.taskDescriptionErrorInfo = "";
    this.taskPriorityErrorInfo = "";
    this.taskStatusErrorInfo = "";
    this.taskStartDateErrorInfo = "";
    this.taskOwnerErrorInfo = "";
    this.taskDueDateErrorInfo = "";

  }

  /**
   * 
   */
  checkCheckBoxes() {
    var tasksToBeDeleted = [];
    var table = document.getElementById("myTable1")
    console.log(table)
    //for(var i=0; i<tables.length; i++){
    var rows = table.getElementsByTagName("tr");
    var value: number[];
    // Loop through each row
    for (var i = 0; i < rows.length; i++) {

      var row = rows[i];
      console.log("the value is" + rows[i]);

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

  //Delete the tasks
  istaskDeleted: boolean = false;

  /**
   * 
   * @param taskIds 
   * @returns 
   */
  deleteTasks(taskIds: any[]) {
    if (taskIds.length < 1) {
      this.toastr.error('No tasks selected to delete')
      return;
    }
    this.service.deleteAllTasksByTaskIds(taskIds).subscribe(res => {
      this.istaskDeleted = res.body;
      console.log(this.istaskDeleted);
      if (this.istaskDeleted) {
        console.log("tasks deleted");
        window.location.reload();
        this.toastr.success("tasks Deleted");
      }
      else {
        console.log("tasks not deleted");
        this.toastr.error("action Items are not deleted try again");
      }
    });
  }
  checkAllCheckBoxes(event: any) {
    var checkbox = event.target.value;
    console.log("the value is:" + checkbox);
    if (checkbox === 'on') {
      console.log("checked");
      var table = document.getElementById('myTable1');
      var rows = table.getElementsByTagName('tr')
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var ischeckbox = row.querySelector("input[type='checkbox']") as HTMLInputElement;
        ischeckbox.click();

      }

    }
  }

  //Get EmailIds of Active Users
  userEmailIdList: string[];

  /**
   * 
   */
  getActiveUsersEmailIdList() {
    this.meetingService.getActiveUserEmailIdList().subscribe(response => {
      this.userEmailIdList = response.body;
      console.log(this.userEmailIdList);


    });
  }

  min: any = "";

  /**
   * 
   */
  pastDateTime() {
    var tdate: any = new Date();
    var date: any = tdate.getDate();
    if (date < 10) {
      date = "0" + date;
    }
    var month: any = tdate.getMonth() + 1;
    if (month < 10) {
      month = "0" + month;
    }
    var year: any = tdate.getFullYear();
    var hours: any = tdate.getHours();
    var minutes: any = tdate.getMinutes();
    this.min = year + "-" + month + "-" + date + "T" + hours + ":" + minutes;
    console.log(this.min);
  }


}
