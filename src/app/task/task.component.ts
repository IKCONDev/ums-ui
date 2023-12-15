import { AfterViewInit, Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Task } from '../model/Task.model';
import { TaskService } from './service/task.service';
import { Toast, ToastrService } from 'ngx-toastr';
import { error, event } from 'jquery';
import { MeetingService } from '../meetings/service/meetings.service';
import { NgForm } from '@angular/forms';
import { HttpStatusCode } from '@angular/common/http';
import { Router } from '@angular/router';
import { EmployeeService } from '../employee/service/employee.service';
import { Employee } from '../model/Employee.model';
import { HeaderService } from '../header/service/header.service';
import { Users } from '../model/Users.model';
import { NotificationService } from '../notifications/service/notification.service';
import { TaskCategory } from '../model/TaskCategory.model';
import { MenuItem } from '../model/MenuItem.model';
import { lastValueFrom } from 'rxjs';
import { AppMenuItemService } from '../app-menu-item/service/app-menu-item.service';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit, OnDestroy, AfterViewInit {

  @Output() title: string = 'Tasks'
  task: Task[]
  task_Details: Task;
  taskCount: number = 0;
  tabOpened: string;
  organizedTasks: Task[];
  assignedTasks: Task[];
  assignedTasksCount = 0;
  reporteeList: Employee[];
  reporteeCount: number = 0;

  loggedInUser = localStorage.getItem('email');
  loggedInUserRole = localStorage.getItem('userRole');
  selectedReporteeOrganized: string = localStorage.getItem('selectedReporteeOrganized');
  selectedReporteeAssigned: string = localStorage.getItem('selectedReporteeAssigned');
  selectedUserDepartmentIdOrganized: number = 0;
  selectedUserDetailsOrganized: Users;

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
    plannedStartDate: '',
    plannedEndDate: '',
    taskOwner: '',
    organizer: '',
    status: '',
    actionItemId: 0,
    actionTitle: '',
    emailId: '',
    departmentId: 0,
    taskCategoryId: 0,
    taskCategory: {
      taskCategoryId: 0,
      taskCategoryTitle: '',
      taskCategoryDescription: '',
      taskCategoryStatus: ''
    },
  }

  //filter organized task properties
  filter_Taskname = localStorage.getItem('taskNameFilter');
  filter_Priority = localStorage.getItem('taskPriorityFilter');
  filter_StartDate = localStorage.getItem('taskStartDateFilter');
  filter_EndDate = localStorage.getItem('taskEndDateFilter');
  filter_Email_Organizer = localStorage.getItem('taskOrganizerFilter');

  //filter assigned task properties
  assignedTaskTitleFilter = localStorage.getItem('assignedTaskTitleFilter');
  assignedTaskPriorityFilter = localStorage.getItem('assignedTaskPriorityFilter');
  assignedTaskStartDateFilter = localStorage.getItem('assignedTaskStartDateFilter');
  assignedTaskEndDateFilter = localStorage.getItem('assignedTaskEndDateFilter');
  // assignedTaskOrganizerFilter = this.selectedReporteeAssigned


  private table: any;

  InitailizeJqueryDataTable() {
    setTimeout(() => {
      $(document).ready(() => {
        this.table = $('#table').DataTable({
          paging: true,
          searching: true,
          pageLength: 10,
          orderFixed: [[1, 'asc']],
          lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]], // Set the options for the "Show entries" dropdown
          // Add other options here as needed
        });
      });
    }, 400);

    setTimeout(() => {
      $(document).ready(() => {
        this.table = $('#assignedtaskTable').DataTable({
          paging: true,
          searching: true,
          pageLength: 10,
          order: [[0, 'asc']],
          lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]], // Set the options for the "Show entries" dropdown
          // Add other options here as needed
        });
      });
    }, 400);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      $(document).ready(() => {
        this.table = $('#table').DataTable({
          paging: true,
          searching: true, // Enable search feature
          pageLength: 10,
          order: [[1, 'asc']],
          lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
          // Add other options here as needed
        });

      });

      $(document).ready(() => {
        this.table = $('#assignedtaskTable').DataTable({
          paging: true,
          searching: true, // Enable search feature
          pageLength: 10,
          order: [[0, 'asc']],
          lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
          
          // Add other options here as needed
        });
      });
    }, 400)
  }

  ngOnDestroy(): void {
    if (this.table) {
      this.table.destroy();
    }
  }
  isComponentLoading: boolean = false;
  displayText: boolean = false;
  isOrganizedDataText: boolean = false;
  isAssignedDataText: boolean = false;
  /**
   * 
   * @param service 
   * @param meetingService 
   * @param toastr 
   */
  constructor(private service: TaskService, private meetingService: MeetingService,
    private toastr: ToastrService, private router: Router, private employeeService: EmployeeService,
    private headerService: HeaderService, private notificationService: NotificationService,
    private menuItemService: AppMenuItemService) {

  }


  @Output() notificationCount: number
  userRoleMenuItemsPermissionMap: Map<string, string>;
  viewPermission: boolean ;
  createPermission: boolean = false;;
  updatePermission: boolean = false;
  deletePermission: boolean = false;
  noPermissions: boolean;

  updateButtonColor: string;
  deleteButtonColor: string;
  /**
   * 
   */
  async ngOnInit(): Promise<void> {

    if (localStorage.getItem('jwtToken') === null) {
      this.router.navigateByUrl('/session-timeout');
    }

    if (localStorage.getItem('userRoleMenuItemPermissionMap') != null) {
      this.userRoleMenuItemsPermissionMap = new Map(Object.entries(JSON.parse(localStorage.getItem('userRoleMenuItemPermissionMap'))));
      //get menu item  details of home page
      var currentMenuItem = await this.getCurrentMenuItemDetails();
      console.log(currentMenuItem)
      if (this.userRoleMenuItemsPermissionMap.has(currentMenuItem.menuItemId.toString().trim())) {
        //this.noPermissions = false;
        //provide permission to access this component for the logged in user if view permission exists
        console.log('exe')
        //get permissions of this component for the user
        var menuItemPermissions = this.userRoleMenuItemsPermissionMap.get(this.currentMenuItem.menuItemId.toString().trim());
        if (menuItemPermissions.includes('View')) {
          //this.isComponentLoading = false;
          this.viewPermission = true;
          //disable kwyboard movement on startdate
          const taskStartDate = document.getElementById('taskStartDate');
          taskStartDate.addEventListener("keydown", function (e) {
            e.preventDefault();
          })

          /* this.service.getAlltaskDetails().subscribe(res=>{
              this.task =res.body;
              this.taskCount = res.body.length;
              console.log(this.task);
           });*/

          if (this.selectedReporteeOrganized === '') {
            this.selectedReporteeOrganized = localStorage.getItem('email');
          }
          if (this.selectedReporteeAssigned === '') {
            this.selectedReporteeAssigned = localStorage.getItem('email');
          }

          //get user details of selected organized user
          this.headerService.fetchUserProfile(this.selectedReporteeOrganized).subscribe({
            next: response => {
              this.selectedUserDetailsOrganized = response.body;
              this.selectedUserDepartmentIdOrganized = response.body.employee.departmentId;
              console.log(this.selectedUserDepartmentIdOrganized)
            }
          });

          this.selectedUserDepartmentIdOrganized = parseInt(localStorage.getItem('selectedUserDepartmentId'));
          console.log(this.selectedUserDepartmentIdOrganized)
          console.log(this.selectedReporteeOrganized)

          //get user details of selected assigned user
          this.headerService.fetchUserProfile(this.selectedReporteeAssigned).subscribe({
            next: response => {
              this.selectedUserDetailsOrganized = response.body;
              this.selectedUserDepartmentIdOrganized = response.body.employee.departmentId;
              console.log(this.selectedUserDepartmentIdOrganized)
            }
          });

          this.selectedUserDepartmentIdOrganized = parseInt(localStorage.getItem('selectedUserDepartmentId'));
          console.log(this.selectedUserDepartmentIdOrganized)
          console.log(this.selectedReporteeOrganized)

          //set default tab to Organized Task when application is opened
          //localStorage.setItem('taskTabOpened', 'OrganizedTask');
          this.tabOpened = localStorage.getItem('taskTabOpened')
          console.log(this.tabOpened)
          this.getTasks(this.tabOpened);

          //get reportees data of logged in user
          if (this.loggedInUserRole === 'ADMIN' || this.loggedInUserRole === 'SUPER_ADMIN') {
            this.getAllEmployees();
          } else {
            this.getEmployeeReportees();
          }

          this.getTaskcategories();

          //set default as loggedin user for whom tasks should be retrived when login
          //  localStorage.setItem('selectedReportee', localStorage.getItem('email'));
          //console.log(this.selectedReportee)
        } else {
          //this.isComponentLoading = false;
          this.viewPermission = false;
        }
        if (menuItemPermissions.includes('Create')) {
          this.createPermission = true;
        }
        if (menuItemPermissions.includes('Update')) {
          this.updatePermission = true;
          this.updateButtonColor = '#5590AA';
        } else {
          this.updateButtonColor = 'lightgray'
        }
        if (menuItemPermissions.includes('Delete')) {
          this.deletePermission = true;
        } else {
          this.deleteButtonColor = 'lightgray'
        }
      }else{
        //this.noPermissions = true;
        this.router.navigateByUrl('/unauthorized');
      }
    }

    //get noti count
    this.notificationService.getTopTenNotificationsByUserId(this.loggedInUser).subscribe({
      next: response => {
        localStorage.setItem('notificationCount', response.body.length.toString());
        this.notificationCount = parseInt(localStorage.getItem('notificationCount'));
      }
    })

    //disable past date times
    this.min = this.pastDateTime();


  }

  /**
   * 
   * @param tabOpened 
   */
  getTasks(tabOpened: string) {
    this.isComponentLoading = true;
    this.displayText = true;
    this.isAssignedDataText = true;
    this.isOrganizedDataText = true;

    //check logged in user role
    //if (this.loggedInUserRole != 'ADMIN') {
    console.log(tabOpened)
    localStorage.setItem('taskTabOpened', tabOpened);
    this.tabOpened = localStorage.getItem('taskTabOpened')
    console.log(localStorage.getItem('taskTabOpened'))

    if (this.tabOpened === 'AssignedTask') {
      if (this.selectedReporteeAssigned != '') {
        this.service.getAssignedTasksOfUser(this.selectedReporteeAssigned,
          this.assignedTaskTitleFilter,
          this.assignedTaskPriorityFilter,
          // this.assignedTaskOrganizerFilter,
          this.assignedTaskStartDateFilter,
          this.assignedTaskEndDateFilter).subscribe({
            next: (response) => {
              document.getElementById("AssignedTask").style.borderBottom = '2px solid white';
              document.getElementById("AssignedTask").style.width = 'fit-content';
              document.getElementById("AssignedTask").style.paddingBottom = '2px';
              document.getElementById("OrganizedTask").style.borderBottom = 'none';
              console.log(response.body)
              //extract the meetings from response object
              this.assignedTasks = response.body;
              this.assignedTasksCount = response.body.length
              if (this.assignedTasksCount === 0) {
                this.isComponentLoading = false;
                this.displayText = false;
              } else {
                  this.isComponentLoading = false;
                  this.isAssignedDataText = false;
              }
              localStorage.setItem('assignedTasksCount', this.assignedTasksCount.toString());
            }, error: (error) => {
              if (error.status === HttpStatusCode.Unauthorized) {
                this.router.navigateByUrl('/session-timeout');
              }
            }
          });
      } else {
        this.service.getAssignedTasksOfUser(this.loggedInUser,
          this.assignedTaskTitleFilter,
          this.assignedTaskPriorityFilter,
          //this.assignedTaskOrganizerFilter,
          this.assignedTaskStartDateFilter,
          this.assignedTaskEndDateFilter).subscribe({
            next: (response) => {
              console.log(response.body)
              //extract the meetings from response object
              this.assignedTasks = response.body;
              this.assignedTasksCount = response.body.length
              localStorage.setItem('assignedTasksCount', this.assignedTasksCount.toString());
            }, error: (error) => {
              if (error.status === HttpStatusCode.Unauthorized) {
                this.router.navigateByUrl('/session-timeout');
              }
            }
          });
      }
    }
    else {
      console.log(this.selectedReporteeOrganized)
      //get taskList default without any filters
      if (this.selectedReporteeOrganized != '' && this.selectedReporteeOrganized != null) {
        console.log('executed selected repportee')
        this.service.getTaskByUserId(this.selectedReporteeOrganized,
          this.filter_Taskname,
          this.filter_Priority,
          this.filter_Email_Organizer,
          this.filter_StartDate,
          this.filter_EndDate).subscribe({
            next: (res) => {
              document.getElementById("OrganizedTask").style.borderBottom = '2px solid white';
              document.getElementById("OrganizedTask").style.width = 'fit-content';
              document.getElementById("OrganizedTask").style.paddingBottom = '2px';
              document.getElementById("AssignedTask").style.borderBottom = 'none';
              this.task = res.body;
              this.taskCount = res.body.length;
              if (this.taskCount === 0) {
                this.isComponentLoading = false;
                this.displayText = false;
              } else {
                  this.isComponentLoading = false;
                  this.isOrganizedDataText = false;
              }
              console.log(this.task);
            }, error: (error) => {
              if (error.status === HttpStatusCode.Unauthorized) {
                this.router.navigateByUrl('/session-timeout');
              }
            }

          });
        //this.InitailizeJqueryDataTable();
      } else {
        console.log('executed default repportee')
        this.service.getTaskByUserId(localStorage.getItem('email'),
          this.filter_Taskname,
          this.filter_Priority,
          this.filter_Email_Organizer,
          this.filter_StartDate,
          this.filter_EndDate).subscribe({
            next: (res) => {
              this.task = res.body;
              this.taskCount = res.body.length;
              console.log(this.task);
            }, error: (error) => {
              if (error.status === HttpStatusCode.Unauthorized) {
                this.router.navigateByUrl('/session-timeout');
              }
            }
          });
        //this.InitailizeJqueryDataTable();
      }

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
    const regex = /^\S.*[a-zA-Z\s]*$/;
    if (this.update_Task.taskTitle == "" || this.update_Task.taskTitle.trim() === "" || regex.exec(this.update_Task.taskTitle) === null) {
      this.taskTitleErrrorInfo = 'Title is required.';
      this.isTaskTitleValid = false;

    }
    else if (this.update_Task.taskTitle.length < 5) {
      this.taskTitleErrrorInfo = 'Title should have minimum of 5 characters.';
      this.isTaskTitleValid = false;
    }
    else if (this.update_Task.taskTitle.length > 50) {
      this.taskTitleErrrorInfo = 'Title should not exceed more than 50 characters.';
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
    const regex = /^\S.*[a-zA-Z\s]*$/;
    if (this.update_Task.taskDescription === '' || this.update_Task.taskDescription.trim() === "" || regex.exec(this.update_Task.taskDescription) === null) {
      this.taskDescriptionErrorInfo = 'Description is required.';
      this.isTaskDescriptionValid = false;
    }
    else if (this.update_Task.taskDescription.length < 10) {
      this.taskDescriptionErrorInfo = 'Description should have a minimum of 10 characters.';
      this.isTaskDescriptionValid = false;
    }
    else if (this.update_Task.taskDescription.length > 250) {
      this.taskDescriptionErrorInfo = 'Description should not exceed more than 250 characters.';
      this.isTaskDescriptionValid = false;
    }
    else {
      this.taskDescriptionErrorInfo = '';
      this.isTaskDescriptionValid = true;

    }
    return this.isTaskDescriptionValid;
  }

  taskCategoryErrorInfo = '';
  isTaskCategoryValid = false;
  validateTaskCategory() {
    if (this.update_Task.taskCategoryId === 0) {
      this.taskCategoryErrorInfo = 'Select a task category.';
      this.isTaskCategoryValid = false;
    } else {
      this.taskCategoryErrorInfo = '';
      this.isTaskCategoryValid = true;
    }
    return this.isTaskCategoryValid;
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
      this.taskPriorityErrorInfo = 'Task priority should not be empty.';
      this.isTaskPriorityValid = false;
    }
    else if (this.update_Task.taskPriority == 'select') {
      this.taskPriorityErrorInfo = 'Task priority is required.';
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
    if (this.update_Task.status === null || this.update_Task.status === '') {
      this.taskStatusErrorInfo = 'Status is required.';
      this.isTaskStatusValid = false;

    }
    else if (this.update_Task.status === 'Select') {
      this.taskStatusErrorInfo = 'Status is required.';
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

      this.taskOwnerErrorInfo = 'Task Owner is required.';
      this.isTaskOwnerValid = false;
    }
    else if (this.update_Task.taskOwner == '') {
      this.taskOwnerErrorInfo = 'Task Owner is required.';
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
    if (this.update_Task.startDate === null) {
      this.taskStartDateErrorInfo = 'Select the start date.';
      this.isTaskStartDateValid = false;
    }
    else if (new Date(this.update_Task.startDate).toString() < Date.now().toString()) {
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
      this.taskDueDateErrorInfo = 'Select the due date.';
      this.isTaskDueDateValid = false;
    }
    if (new Date(this.update_Task.dueDate.toString()) < new Date(this.update_Task.startDate.toString())) {
      this.taskDueDateErrorInfo = 'Due date should`nt be less than startdate.';
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
    console.log("entered the update task details");
    var currentDate = new Date();
    var year = currentDate.getFullYear();
    var month = currentDate.getMonth() + 1;
    var day = currentDate.getDate();
    var formattedStartDate = year + '-' + (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day;
    console.log(formattedStartDate)
    if (this.update_Task.status === 'Completed') {
      if (this.update_Task.startDate === null || this.update_Task.startDate === "") {
        this.update_Task.startDate = formattedStartDate;
      }
      this.update_Task.dueDate = formattedStartDate;
    }
    if (this.update_Task.status === 'Inprogress') {
      this.update_Task.startDate = formattedStartDate;
    }
    console.log(this.update_Task.startDate)
    console.log(this.update_Task.dueDate)
    let isTitleValid = true;
    let isDescriptionValid = true;
    let isPriorityValid = true;
    // let isStartDateValid = true;
    // let isDueDateValid = true;
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
    // if (!this.isTaskStartDateValid) {
    //   var valid = this.validateTaskStartDate();
    //   isStartDateValid = valid;
    // }
    // if (!this.isTaskDueDateValid) {
    //   var valid = this.validateTaskDueDate();
    //   isDueDateValid = valid;
    // }
    if (!this.isTaskStatusValid) {
      var valid = this.validateTaskStatus();
      isStatusValid = valid;
    }
    if (isTitleValid === true && isDescriptionValid === true && isPriorityValid === true && isStatusValid === true) {
      if (this.update_Task.dueDate < this.update_Task.plannedEndDate && this.update_Task.status === 'Completed' && this.update_Task.dueDate != null) {
        var isConfirmed = window.confirm('This task is being completed before the planned end date, Are you sure you want to proceed ?');
        if (isConfirmed) {
          console.log(this.update_Task.taskCategoryId);
          console.log(this.update_Task.taskCategory.taskCategoryId)
          //this.update_Task.taskCategory.taskCategoryId = this.update_Task.taskCategoryId;
          this.service.updateTask(this.update_Task).subscribe({
            next: (response) => {
              this.response = response.body;
              //this.data = response.body;
              if (response.status === HttpStatusCode.Ok) {
                this.toastr.success('Task updated successfully.');
                document.getElementById('closeUpdateModal').click();
                document.getElementById('closeAssignedUpdateModal').click();
                setTimeout(() => {
                  window.location.reload();
                }, 1000)
              }
            }, error: (error) => {
              if (error.status === HttpStatusCode.Unauthorized) {
                this.router.navigateByUrl('/session-timeout');
              }
            }
          });
        }
      } else {
        console.log(this.update_Task.startDate)
        // this.update_Task.taskCategory.taskCategoryId = this.update_Task.taskCategoryId;
        this.service.updateTask(this.update_Task).subscribe({
          next: (response) => {
            this.response = response.body;
            //this.data = response.body;
            if (response.status === HttpStatusCode.Ok) {
              this.toastr.success('Task updated successfully.');
              document.getElementById('closeUpdateModal').click();
              document.getElementById('closeAssignedUpdateModal').click();
              setTimeout(() => {
                window.location.reload();
              }, 1000)
            }
          }, error: (error) => {
            if (error.status === HttpStatusCode.Unauthorized) {
              this.router.navigateByUrl('/session-timeout');
            }
          }
        });
      }

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
    var table = document.getElementById("table")
    console.log(table)
    //for(var i=0; i<tables.length; i++){
    var rows = table.getElementsByClassName("trbody");
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

  /**
   * 
   */
  checkSubCheckBoxes() {
    if ($('#mainCheckBox').is(':checked')) {
      $('.subCheckBox').prop('checked', true);

    } else {
      $('.subCheckBox').prop('checked', false);
    }
  }

  //Delete the tasks
  istaskDeleted: boolean = false;

  /**
   * 
   * @param taskIds 
   * @returns 
   */
  tasksTobeDeleted = [];
  deleteTasks(taskIds: any[]) {
    //initialize to empty array on clikck from second time
    var isconfirmed = window.confirm("Are you sure, you really want to delete these records ?")
    if (isconfirmed) {

      this.tasksTobeDeleted = [];
      var subCheckBoxes = document.getElementsByClassName('subCheckBox') as HTMLCollectionOf<HTMLInputElement>;
      for (var i = 0; i < subCheckBoxes.length; i++) {
        if (subCheckBoxes[i].checked) {
          this.tasksTobeDeleted.push(subCheckBoxes[i].value);
          console.log(this.tasksTobeDeleted);
        }
      }
      if (taskIds.length < 1) {
        this.toastr.error('No tasks selected to delete.')
        return;
      }
      this.service.deleteAllTasksByTaskIds(this.tasksTobeDeleted).subscribe({
        next: (res) => {
          this.istaskDeleted = res.body;
          console.log(this.istaskDeleted);
          if (this.istaskDeleted) {
            if (taskIds.length > 1) {
              this.toastr.success("Tasks deleted.");
            } else {
              this.toastr.success('Task ' + taskIds + ' is deleted.');
            }
            setTimeout(() => {
              window.location.reload();
            }, 1000)
          }
          else {
            console.log("tasks not deleted");
            this.toastr.error("Tasks not deleted. Please try again !");
          }
        }, error: (error) => {
          if (error.status === HttpStatusCode.Unauthorized) {
            this.router.navigateByUrl('/session-timeout');
          }
        }
      });

    }
    else {
      this.toastr.warning("No tasks deleted.");

    }


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
    this.meetingService.getActiveUserEmailIdList().subscribe({
      next: (response) => {
        this.userEmailIdList = response.body;
        console.log(this.userEmailIdList);
      }, error: (error) => {
        if (error.status === HttpStatusCode.Unauthorized) {
          this.router.navigateByUrl('/session-timeout');
        }
      }
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
    var min = year + "-" + month + "-" + date + "T" + hours + ":" + minutes;
    this.min = min;
    return min;

  }

  /**
   * 
   */
  toggleMainCheckBox(index: number) {
    if (!$('#subCheckBox' + index).is(':checked')) {
      $('#mainCheckBox').prop('checked', false);
    }
    const anyUnchecked = $('.subCheckBox:not(:checked)').length > 0;
    $('#mainCheckBox').prop('checked', !anyUnchecked);

  }

  deleteTaskById(id: number) {
    var isconfirmed = window.confirm("Are you sure, you want to really delete the record ?");
    if (isconfirmed) {

      this.service.deleteTaskById(id).subscribe({
        next: (response) => {
          if (response.status == HttpStatusCode.Ok) {
            this.toastr.success("Task Deleted successfully.");
            setTimeout(() => {
              window.location.reload();
            }, 1000)
          }
          else {
            this.toastr.error("Error Occured While deleting Task.")
          }
        }
      })

    }
    else {
      this.toastr.warning("Task " + id + " is not Deleted.");

    }


  }

  //filters code
  /**
   * close filter modal on click
   */
  CloseFilterTaskModal() {
    document.getElementById('closeModal').click();
  }

  /**
   * reset filter
   */
  resetFilterModal() {
    localStorage.setItem('taskNameFilter', '');
    localStorage.setItem('taskPriorityFilter', '');
    localStorage.setItem('taskStartDateFilter', '');
    localStorage.setItem('taskEndDateFilter', '');
    localStorage.setItem('taskOrganizerFilter', '');

    this.CloseFilterTaskModal();
    window.location.reload();
  }

  resetAssignedFilterModal() {
    localStorage.setItem('assignedTaskTitleFilter', '');
    localStorage.setItem('assignedTaskPriorityFilter', '');
    localStorage.setItem('assignedTaskStartDateFilter', '');
    localStorage.setItem('assignedTaskEndDateFilter', '');
    localStorage.setItem('assignedTaskOrganizerFilter', '');

    this.CloseFilterTaskModal();
    window.location.reload();
  }

  /**
   * 
   * @param taskName 
   * @param taskPriority 
   * @param taskStartDate 
   * @param taskEndDate 
   * @param taskOrganizer 
   */
  filterOrganizedTaskList(taskName: string, taskOrganizer: string, taskPriority: string, taskStartDate: string, taskEndDate: string) {

    console.log(this.filter_Taskname + "popop")
    console.log(this.filter_Priority + "popop")
    console.log(this.filter_Email_Organizer + "popop")
    console.log(this.filter_StartDate + "popop")
    console.log(this.filter_EndDate + "popop")

    //close filter modal
    localStorage.setItem('taskNameFilter', taskName);
    localStorage.setItem('taskPriorityFilter', taskPriority);
    localStorage.setItem('taskStartDateFilter', taskStartDate);
    localStorage.setItem('taskEndDateFilter', taskEndDate);
    localStorage.setItem('taskOrganizerFilter', taskOrganizer);

    console.log(localStorage.getItem('taskNameFilter'));
    console.log(localStorage.getItem('taskPriorityFilter'));
    console.log(localStorage.getItem('taskStartDateFilter'));
    console.log(localStorage.getItem('taskEndDateFilter'));
    console.log(localStorage.getItem('taskOrganizerFilter'));

    this.isComponentLoading = true;
    this.isOrganizedDataText = true;

    this.filter_Taskname = '';
    this.filter_Priority = '';
    this.filter_StartDate = '';
    this.filter_EndDate = '';
    this.filter_Email_Organizer = '';

    if (localStorage.getItem('taskNameFilter') != '') {
      this.filter_Taskname = localStorage.getItem('taskNameFilter');
    }
    if (localStorage.getItem('taskPriorityFilter') != '') {
      this.filter_Priority = localStorage.getItem('taskPriorityFilter');
    }
    if (localStorage.getItem('taskStartDateFilter')) {
      this.filter_StartDate = localStorage.getItem('taskStartDateFilter');
    }
    if (localStorage.getItem('taskEndDateFilter')) {
      this.filter_EndDate = localStorage.getItem('taskEndDateFilter');
    }
    if (localStorage.getItem('taskOrganizerFilter')) {
      this.filter_Email_Organizer = localStorage.getItem('taskOrganizerFilter');
    }

    console.log(this.filter_Taskname + "--------")
    this.service.getTaskByUserId(localStorage.getItem('email'), this.filter_Taskname,
      this.filter_Priority,
      this.filter_Email_Organizer,
      this.filter_StartDate,
      this.filter_EndDate).subscribe({
        next: response => {
          this.isComponentLoading = false;
          this.isOrganizedDataText = false;
          console.log(response)
        }, error: error => {
          console.log(error)
        }
      })

    this.CloseFilterTaskModal();
    window.location.reload();
  }

  /**
   * 
   * @param taskName 
   * @param taskPriority 
   * @param taskStartDate 
   * @param taskEndDate 
   * @param taskOrganizer 
   */
  filterAssignedTaskList(taskName: string, taskPriority: string, taskStartDate: string, taskEndDate: string) {

    console.log(taskName)
    console.log(this.assignedTaskTitleFilter + "popop")
    console.log(this.assignedTaskPriorityFilter + "popop")
    //console.log(this.assignedTaskOrganizerFilter + "popop")
    console.log(this.assignedTaskStartDateFilter + "popop")
    console.log(this.assignedTaskEndDateFilter + "popop")

    //close filter modal
    localStorage.setItem('assignedTaskTitleFilter', taskName);
    localStorage.setItem('assignedTaskPriorityFilter', taskPriority);
    localStorage.setItem('assignedTaskStartDateFilter', taskStartDate);
    localStorage.setItem('assignedTaskEndDateFilter', taskEndDate);
    //localStorage.setItem('assignedTaskOrganizerFilter', taskOrganizer);

    console.log(localStorage.getItem('assignedTaskTitleFilter'));
    console.log(localStorage.getItem('assignedTaskPriorityFilter'));
    console.log(localStorage.getItem('assignedTaskStartDateFilter'));
    console.log(localStorage.getItem('assignedTaskEndDateFilter'));
    console.log(localStorage.getItem('assignedTaskOrganizerFilter'));

    this.isComponentLoading = true;
    this.isAssignedDataText = true;

    this.assignedTaskTitleFilter = '';
    this.assignedTaskPriorityFilter = '';
    // this.assignedTaskOrganizerFilter = '';
    this.assignedTaskStartDateFilter = '';
    this.assignedTaskEndDateFilter = '';

    if (localStorage.getItem('assignedTaskTitleFilter') != '') {
      this.assignedTaskTitleFilter = localStorage.getItem('assignedTaskTitleFilter');
    }
    if (localStorage.getItem('assignedTaskPriorityFilter') != '') {
      this.assignedTaskPriorityFilter = localStorage.getItem('assignedTaskPriorityFilter');
    }
    if (localStorage.getItem('assignedTaskStartDateFilter')) {
      this.assignedTaskStartDateFilter = localStorage.getItem('assignedTaskStartDateFilter');
    }
    if (localStorage.getItem('assignedTaskEndDateFilter')) {
      this.assignedTaskEndDateFilter = localStorage.getItem('assignedTaskEndDateFilter');
    }
    // if (localStorage.getItem('assignedTaskOrganizerFilter')) {
    //   this.assignedTaskOrganizerFilter = localStorage.getItem('assignedTaskOrganizerFilter');
    // }

    console.log(this.assignedTaskTitleFilter + "--------")
    this.service.getAssignedTasksOfUser(localStorage.getItem('email'), this.assignedTaskTitleFilter,
      this.assignedTaskPriorityFilter,
      //this.assignedTaskOrganizerFilter,
      this.assignedTaskStartDateFilter,
      this.assignedTaskEndDateFilter).subscribe({
        next: response => {
          this.isComponentLoading = false;
          this.isAssignedDataText = false;
          console.log(response)
        }, error: error => {
          console.log(error)
        }
      })

    this.CloseFilterTaskModal();
    window.location.reload();
  }

  /**
   * get the reportees data of employee
   */
  getEmployeeReportees() {
    this.employeeService.getReporteesDataOfEmployee(localStorage.getItem('email')).subscribe({
      next: response => {
        if (response.status === HttpStatusCode.Ok) {
          this.reporteeList = response.body;
          this.reporteeCount = response.body.length;
        }
      },
      error: error => {
        if (error.status === HttpStatusCode.Unauthorized) {
          this.router.navigateByUrl('/session-timeout');
        } else {
          this.toastr.error('Error while fetching reportees data')
        }
      }
    })
  }

  /**
   * if Role is Admin then get all employees
   */
  getAllEmployees() {
    this.employeeService.getUserStatusEmployees(true).subscribe({
      next: response => {
        this.reporteeList = response.body;
        this.reporteeCount = response.body.length;
      }
    })
  }

  /**
   * 
   */
  storeReporteeDataOfOrganizedTask() {
    localStorage.setItem('selectedReporteeOrganized', this.selectedReporteeOrganized);
    console.log(this.selectedReporteeOrganized);
    this.selectedReporteeOrganized = localStorage.getItem('selectedReporteeOrganized')
    if (this.selectedReporteeOrganized === 'null') {
      localStorage.setItem('selectedReporteeOrganized', this.loggedInUser)
      this.selectedReporteeOrganized = localStorage.getItem('selectedReporteeOrganized');
    }
    console.log(this.selectedReporteeOrganized)
    window.location.reload();
  }

  /**
  * 
  */


  /**
  * store selected reportee in localstorage
  */
  storeReporteeDataOfAssignedTask() {
    localStorage.setItem('selectedReporteeAssigned', this.selectedReporteeAssigned);
    console.log(this.selectedReporteeAssigned);
    this.selectedReporteeAssigned = localStorage.getItem('selectedReporteeAssigned')
    if (this.selectedReporteeAssigned === 'null') {
      localStorage.setItem('selectedReporteeAssigned', this.loggedInUser)
      this.selectedReporteeAssigned = localStorage.getItem('selectedReporteeAssigned');
    }
    console.log(this.selectedReporteeAssigned)
    window.location.reload();
  }

  taskCategoryList: TaskCategory[];
  getTaskcategories() {
    this.service.findTaskCategories().subscribe({
      next: response => {
        this.taskCategoryList = response.body;
        console.log(response.body)
      }
    })
  }

  currentMenuItem: MenuItem;
  async getCurrentMenuItemDetails(): Promise<MenuItem> {
    const response = await lastValueFrom(this.menuItemService.findMenuItemByName('Tasks')).then(response => {
      if (response.status === HttpStatusCode.Ok) {
        this.currentMenuItem = response.body;
        console.log(this.currentMenuItem)
      } else if (response.status === HttpStatusCode.Unauthorized) {
        console.log('eit')
        this.router.navigateByUrl('/session-timeout');
      }
    }, reason => {
      if (reason.status === HttpStatusCode.Unauthorized) {
        this.router.navigateByUrl('/session-timeout')
      }
    }
    )

    console.log(this.currentMenuItem);
    return this.currentMenuItem;
  }

  getPOPUPMessage(){
    var popup = document.getElementById("myPopup");
    popup.classList.toggle("show");
    console.log("is method executing")
  }

  getPOPUPMessage2(){
    var popup = document.getElementById("myPopup2");
    popup.classList.toggle("show");
  }

  getPOPUPMessage3(){
    var popup = document.getElementById("myPopup3");
    popup.classList.toggle("show");
  }

  getPOPUPMessage4(){
    var popup = document.getElementById("myPopup4");
    popup.classList.toggle("show");
  }


}
