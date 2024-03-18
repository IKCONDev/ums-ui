import { Component, OnInit, Output } from '@angular/core';
import { ActionItems } from 'src/app/model/Actionitem.model';
import { ActionService } from './service/action.service';
import { Task } from '../model/Task.model';
import { TaskService } from '../task/service/task.service';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { MeetingService } from '../meetings/service/meetings.service';
import { HttpStatusCode } from '@angular/common/http';
import { Router } from '@angular/router';
import { Employee } from '../model/Employee.model';
import { EmployeeService } from '../employee/service/employee.service';
import { Users } from '../model/Users.model';
import { HeaderService } from '../header/service/header.service';
import { NotificationService } from '../notifications/service/notification.service';
import { TaskCategory } from '../model/TaskCategory.model';
import { MenuItem } from '../model/MenuItem.model';
import { lastValueFrom } from 'rxjs';
import { AppMenuItemService } from '../app-menu-item/service/app-menu-item.service';

@Component({
  selector: 'app-action-item',
  templateUrl: './action-item.component.html',
  styleUrls: ['./action-item.component.css']
})
export class ActionItemComponent implements OnInit {

  @Output() title: string = 'Action Items';
  actionItemCount: number = 0;
  id: number;
  actions: Object;
  isfill: boolean = false;
  actionItems_new: ActionItems;
  email: string;
  data: object = {};
  response: Object;
  actions_details: Object
  actionItem_id: number;
  temp_data: number
  str: string;
  isActionsDeleted: boolean = false;
  task_array: Task[];
  actionItems: ActionItems[];
  userEmailIdList: string[];
  currentActionItemId: number;
  reporteeList: Employee[];
  reporteeCount: number = 0;
  selectedReporteeOrganizedActionItem: string = localStorage.getItem('selectedReporteeOrganizedActionItem');
  loggedInUserRole = localStorage.getItem('userRole');
  loggedInUser = localStorage.getItem('email');
  selectedUserdepartmentId: number = 0;
  selectedUserDetails: Users;
  taskCategoryList: TaskCategory[];

  //update action item object
  updatedetails = {
    actionItemId: 0,
    meetingId: 0,
    emailId: '',
    departmentId: 0,
    actionItemOwner: [],
    actionItemTitle: '',
    actionItemDescription: '',
    actionPriority: '',
    actionStatus: '',
    startDate: '',
    endDate: '',
    createdBy: '',
    createdByEmailId:'',
    createdDateTime: '',
    modifiedBy: '',
    modifiedByEmailId: '',
    modifiedDateTime: ''
  }

  //add action item object
  addDetails = {
    actionItemId: 0,
    meetingId: 0,
    emailId: '',
    departmentId: 0,
    actionItemOwner: [],
    actionItemTitle: '',
    actionItemDescription: '',
    actionPriority: '',
    actionStatus: 'Not Converted',
    startDate: '',
    endDate: '',
    createdBy: '',
    createdByEmailId:'',
    createdDateTime: '',
    modifiedBy: '',
    modifiedByEmailId: '',
    modifiedDateTime: ''
  }

  actionItemNameFilter = localStorage.getItem('actionItemNameFilter');
  actionItemOwnerFilter = localStorage.getItem('actionItemOwnerFilter');
  actionItemStartDateFilter = localStorage.getItem('actionItemStartDateFilter');
  actionItemEndDateFilter = localStorage.getItem('actionItemEndDateFilter');


  //add object error validation properties
  actionItemTitleErrorInfo: string = '';
  actionItemOwnerErrorInfo: string = '';
  actionItemEndDateErrorInfo: string = '';
  actionItemDescriptionErrorInfo: string = ''
  actionItemPriorityErrorInfo: string = ''
  actionItemStartDateErrorInfo: string = ''
  isActionItemTitleValid = false;
  isActionItemDescriptionValid = false;
  isActionItemPriorityValid = false;
  isActionItemOwnerValid = false;
  isActionItemStartDateValid = false;
  isActionItemEndDateValid = false;

  //update object error alidation properties
  updateActionItemTitleErrorInfo: string = '';
  updateActionItemDescErrorInfo: string = '';
  updateActionItemPriorityErrorInfo: string = '';
  updateActionItemOwnerErrorInfo: string = '';
  updateActionItemStartDateErrorInfo: string = '';
  updateActionItemEndDateErrorInfo: string = '';
  isUpdateActionItemTitleValid = false;
  isUpdateActionItemDescValid = false;
  isUpdateActionItemPriorityValid = false;
  isUpdateActionItemOwnerValid = false;
  isUpdateActionItemStartDateValid = false;
  isUpdateActionItemEndDateValid = false;

  isComponentLoading: boolean = false;
  displayText: boolean = false;
  isActionItemDataText: boolean = false;
  disableSaveButton=false;
  isCriteria:boolean=false;
  /**
   * 
   * @param service 
   * @param taskService 
   * @param toastr 
   * @param meetingsService 
   */
  constructor(private service: ActionService, private taskService: TaskService, private toastr: ToastrService,
    private meetingsService: MeetingService, private router: Router, private employeeService: EmployeeService,
    private headerService: HeaderService, private notificationService: NotificationService,
    private menuItemService: AppMenuItemService) {

    

  }

  showTasks(actionItemId: number){
    document.getElementById('table'+actionItemId).style.display = 'block';
  }

  /**
   * 
   */
  userRoleMenuItemsPermissionMap: Map<string, string>
  @Output() notificationCount: number = 0;

  viewPermission:boolean ;
  createPermission: boolean = false;
  updatePermission: boolean = false;
  deletePermission: boolean = false;
  noPermissions: boolean;
  
  buttoncolor: string;

  private table: any;

  /**
   * 
   */
  // InitailizeJqueryDataTable() {
  //   if(this.table!=null){
  //     this.table.destroy();
  //   }
  //   setTimeout(() => {
  //     $(document).ready(() => {
  //       this.table = $('#myTable').DataTable({
  //         paging: true,
  //         searching: true, // Enable search feature
  //         pageLength: 10,
  //         ordering: true,
  //         stateSave:true,
  //         order: [[0, 'asc']],
  //         lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
  //         // Add other options here as needed
  //       });
  //     });
  //   }, 400)
  // }

  async ngOnInit(): Promise<void> {

    if (localStorage.getItem('jwtToken') === null) {
      this.router.navigateByUrl('/session-timeout');
    }

    if (localStorage.getItem('userRoleMenuItemPermissionMap') != null) {
      this.userRoleMenuItemsPermissionMap = new Map(Object.entries(JSON.parse(localStorage.getItem('userRoleMenuItemPermissionMap'))));
      //get menu item  details of home page
      var currentMenuItem = await this.getCurrentMenuItemDetails();
      if (this.userRoleMenuItemsPermissionMap.has(currentMenuItem.menuItemId.toString().trim())) {
       // this.noPermissions = false;
        //provide permission to access this component for the logged in user if view permission exists
        //get permissions of this component for the user
        var menuItemPermissions = this.userRoleMenuItemsPermissionMap.get(this.currentMenuItem.menuItemId.toString().trim());
        if (menuItemPermissions.includes('View')) {
          //this.isComponentLoading=true;
          this.viewPermission = true;
          this.getActiveUMSUsersEmailIdList();
          //get action items of user
          this.getActionItemsOfUser();
          this.initializeSlider();
          if (this.selectedReporteeOrganizedActionItem === '') {
            this.selectedReporteeOrganizedActionItem = localStorage.getItem('email');
          }

          this.headerService.fetchUserProfile(this.selectedReporteeOrganizedActionItem).subscribe({
            next: response => {
              this.selectedUserDetails = response.body;
              this.selectedUserdepartmentId = response.body.employee.departmentId;
            }
          })

          //get reportees data of logged in user
          if (this.loggedInUserRole === 'ADMIN' || this.loggedInUserRole === 'SUPER_ADMIN') {
            this.getAllEmployees();
          } else {
            this.getEmployeeReportees();
          }

          //get taskCategories
          this.getTaskcategories();

          //disable past dates  
          this.pastDateTime();
          //this.InitailizeJqueryDataTable();
        } else{
          //this.isComponentLoading=false;
          this.viewPermission = false;
        }
        if (menuItemPermissions.includes('Create')) {
          this.createPermission = true;
          this.buttoncolor = '#007bff';
        }else{
          this.createPermission = false;
          this.buttoncolor = 'lightgray'
        }
        if (menuItemPermissions.includes('Update')) {
          this.updatePermission = true;
        }else{
          this.updatePermission = false;
        }
        if (menuItemPermissions.includes('Delete')) {
          this.deletePermission = true;
        }else{
          this.deletePermission = false;
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


  }


  initializeSlider(){
    //show action items slider control code
    $(function () {
      var previousRow;
      //  var targetrow=null;
      $('table').on('click', 'a.showmore', function () {
        // e.preventDefault();
        //select thec closest tr of where the showmore link is present, and thats where th action items should be displayed
        var targetrow = $(this).closest('tr').next('.detail');
        if (previousRow && previousRow[0] !== targetrow[0]) {
          previousRow.hide(500).find('div').slideUp('slow');
        }
        else if (previousRow && previousRow[0] === targetrow[0]) {
          targetrow.hide(500).find('div').slideUp('slow');
          previousRow = null;
          return;
        }
        targetrow.show(1000).find('div').slideDown('slow');
        previousRow = targetrow;
      });
    });

  }

  /**
   * Get action items of logged in user
   */

  reloadPageCount:number;
  numberCountPerPage:number=0;
  getActionItemsOfUser() {
    this.isComponentLoading = true;
    this.displayText = true;
    this.isActionItemDataText = true;
    if (this.selectedReporteeOrganizedActionItem != '') {
      this.service.getUserActionItemsByUserId(this.selectedReporteeOrganizedActionItem).subscribe({
        next: (response) => {
          this.actionItems = response.body;
          this.actionItemCount = response.body.length;
          if (this.actionItemCount === 0) {
            this.isComponentLoading = false;
            this.displayText = false;
          } else {
            if(this.numberCountPerPage===0){
              if(localStorage.getItem('actionItemTableSize')!=null){
                this.onTableDataChange(1);
                this.setItemsPerPage(parseInt(localStorage.getItem('actionItemTableSize')));
                this.numberCountPerPage=1;
                this.reloadPageCount=2
              }
            else{
              this.onTableDataChange(1);
                this.setItemsPerPage(10);
                this.numberCountPerPage=1;
                this.reloadPageCount=0;
            }
          }
              this.isComponentLoading = false;
              this.isActionItemDataText = false;
          }
        }, error: (error) => {
          if (error.status === HttpStatusCode.Unauthorized) {
            this.router.navigateByUrl('/session-timeout')
          }
        }
      });
    } else {
      this.service.getUserActionItemsByUserId(this.loggedInUser).subscribe({
        next: (response) => {
          this.actionItems = response.body;
          this.actionItemCount = response.body.length;
          if (this.actionItemCount === 0) {
            this.isComponentLoading = false;
            this.displayText = false;
          } else {
            if(this.numberCountPerPage===0){
              if(localStorage.getItem('actionItemTableSize')!=null){
                this.onTableDataChange(1);
                this.setItemsPerPage(parseInt(localStorage.getItem('actionItemTableSize')));
                this.numberCountPerPage=1;
                this.reloadPageCount=2
              }
            else{
              this.onTableDataChange(1);
                this.setItemsPerPage(10);
                this.numberCountPerPage=1;
                this.reloadPageCount=0;
            }
          }
              this.isComponentLoading = false;
              this.isActionItemDataText = false;
          }
        }, error: (error) => {
          if (error.status === HttpStatusCode.Unauthorized) {
            this.router.navigateByUrl('/session-timeout')
          }
        }
      });
    }
  }

  /**
   * currently this feature is disabled
   * @param id 
   */
  editData(id: number) {
    this.service.getActionItemById(id).subscribe(response => {
      this.actionItems_new = response.body;
      this.updatedetails.actionItemId = this.actionItems_new.actionItemId;
      this.updatedetails.actionItemDescription = this.actionItems_new.actionItemDescription;
      this.updatedetails.meetingId = this.actionItems_new.meetingId;
      this.updatedetails.actionStatus = this.actionItems_new.actionStatus;
      this.updatedetails.actionItemTitle = this.actionItems_new.actionItemTitle;
      this.updatedetails.actionPriority = this.actionItems_new.actionPriority;
      this.updatedetails.startDate = this.actionItems_new.startDate;
      this.updatedetails.endDate = this.actionItems_new.endDate;

    });
  }


  /**
   * currently this feature is disabled
   * @param event 
   */
  updateDetails(event: any) {
    this.id = this.updatedetails.actionItemId;
    this.service.updateActionItem(this.updatedetails).subscribe(response => {
      this.data = response.body;
    });
  }

  /**
   * 
   */
  ViewTaskDetails(actionItemId: number) {
    this.currentActionItemId = actionItemId;
    this.service.getAlltasks().subscribe({
      next: (response) => {
        this.task_array = response.body;
      }, error: (error) => {
        if (error.status === HttpStatusCode.Unauthorized) {
          this.router.navigateByUrl('/session-timeout')
        }
      }
    });
  }

  /**
   * 
   */
  addActionItems() {
    //TODO:
    this.addDetails;

  }


  /**
   * currently this feature is disabled
   * @param form 
   */
  saveActionItem(form: NgForm) {
    let isTitlevalid = true;
    let isDescriptionValid = true;
    let isPriorityValid = true;
    let isOwnervalid = true;
    let isEndDateValid = true;
    let isStartDateValid = true;
    if (this.isActionItemTitleValid === false) {
      var valid = this.validateActionTitle();
      isTitlevalid = valid;
    }
    if (this.isActionItemDescriptionValid === false) {
      var valid = this.validateActionDescription();
      isDescriptionValid = valid;
    }
    if (!this.isActionItemPriorityValid) {
      var valid = this.validateActionPriority();
      isPriorityValid = valid;
    }
    if (!this.isActionItemOwnerValid) {
      var valid = this.validateActionItemOwner();
      isOwnervalid = valid;
    }
    if (!this.isActionItemStartDateValid) {
      var valid = this.validateActionStartDate();
      isStartDateValid = valid;
    }
    if (!this.isActionItemEndDateValid) {
      var valid = this.validateActionEndDate();
      isEndDateValid = valid;
    }
    if (isTitlevalid === true && isDescriptionValid === true
      && isPriorityValid === true && isOwnervalid == true && isStartDateValid === true
      && isEndDateValid === true) {
      this.addDetails.emailId = localStorage.getItem('email');
      this.service.saveActionItem(this.addDetails).subscribe(response => {
        this.response = response.body;
        this.actions_details = response.body;
      });
    }
  }

  /**
   * currently this feature is disabled
   */
  checkCheckBoxes() {
    var actionItemsToBeDeleted = [];
    var table = document.getElementById("myTable")
    //for(var i=0; i<tables.length; i++){
    var rows = table.getElementsByTagName("tr");
    var value: number[];
    // Loop through each row
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var checkbox = row.querySelector("input[type='checkbox']") as HTMLInputElement;
      // Check if the checkbox exists in the row
      if (checkbox) {
        // Check the 'checked' property to get the state (true or false)
        if (checkbox.checked) {
          actionItemsToBeDeleted.push(checkbox.value);
        }
      }

    }
    this.deleteActionItems(actionItemsToBeDeleted);
  }

  /**
   * currently this feature is disabled
   * @param actionItemList 
   */
  deleteActionItems(actionItemList: any[]) {

    this.service.deleteSelectedActionItemsByIds(actionItemList).subscribe(res => {
      this.isActionsDeleted = res.body;
      if (this.isActionsDeleted) {
        this.toastr.success("Action Items deleted");
        window.location.reload();
      }
      else {
        this.toastr.error("Action Items are not deleted. Please try again !");
      }
    });
  }



  /**
   * currently this feature is disabled
   * @param id 
   * @returns 
   */
  deleteData(id: number): any {
    this.actionItem_id = id;
    this.service.deleteActionItem(this.actionItem_id).subscribe(res => {
      this.temp_data = res.body;
      if (this.temp_data === 1) {
        window.location.reload();
      }
      else {
        //console.log("record not deleted");
      }

    });
    return this.actionItem_id;

  }

  /**
   * currently this feature is disabled
   * @param actionItemid 
   * @param id 
   */
  toggleSubmitAndDelete(actionItemid: number, id: number) {

    var table = document.getElementById("myTable" + actionItemid);
    var rows = table.getElementsByTagName("tr");
    var value: number[];
    // Loop through each row
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var checkbox = row.querySelector("input[type='checkbox']") as HTMLInputElement;

    }
  }

  /**
   * currently this feature is disabled
   * @returns 
   */
  validateActionTitle(): boolean {
    // var actionItemTitle = event.target.value;
    if (this.addDetails.actionItemTitle === '') {
      this.actionItemTitleErrorInfo = "Action Item title is required.";
      this.isActionItemTitleValid = false;
    } else if (this.addDetails.actionItemTitle.length < 5) {
      this.actionItemTitleErrorInfo = 'Title should have a minimum of 5 characters.';
      this.isActionItemTitleValid = false;
    } else if (this.addDetails.actionItemTitle.length > 50) {
      this.actionItemTitleErrorInfo = 'Title should not exceed more than 50 characters.';
      this.isActionItemTitleValid = false;
    } else {
      this.actionItemTitleErrorInfo = '';
      this.isActionItemTitleValid = true;
    }
    return this.isActionItemTitleValid;
  }

  /**
   * currently this feature is disabled
   * @param event 
   */
  validateActionDescription(): boolean {
    //var actionItemDescription = event.target.value;
    if (this.addDetails.actionItemDescription === '') {
      this.actionItemDescriptionErrorInfo = "Description is required.";
      this.isActionItemDescriptionValid = false;
    } else if (this.addDetails.actionItemDescription.length < 10) {
      this.actionItemDescriptionErrorInfo = 'Description should have a minimum of 10 characters.';
      this.isActionItemDescriptionValid = false;
    } else if (this.addDetails.actionItemDescription.length > 250) {
      this.actionItemDescriptionErrorInfo = 'Description  should not exceed more than 250 characters.';
      this.isActionItemDescriptionValid = false;
    } else {
      this.actionItemDescriptionErrorInfo = '';
      this.isActionItemDescriptionValid = true;
    }
    return this.isActionItemDescriptionValid;
  }


  /**
   * currently this feature is disabled
   * @param event 
   */
  validateActionPriority() {
    //var actionItemPriority = event.target.value;
    if (this.addDetails.actionPriority === '') {
      this.actionItemPriorityErrorInfo = "Priority is required.";
      this.isActionItemPriorityValid = false;
    } else if (this.addDetails.actionPriority === 'select') {
      this.actionItemPriorityErrorInfo = "Priority is required.";
      this.isActionItemPriorityValid = false;
    } else {
      this.actionItemPriorityErrorInfo = '';
      this.isActionItemPriorityValid = true;
    }
    return this.isActionItemPriorityValid;
  }

  /**
   * currently this feature is disabled
   * @param form 
   */
  clearErrorMessages(form: NgForm) {
    // this.actionItemTitleErrorInfo = '';
    // this.actionItemDescriptionErrorInfo = '';
    // this.actionItemPriorityErrorInfo = '';
    // this.actionItemStartDateErrorInfo = '';
    // this.actionItemEndDateErrorInfo = '';
    form.form.reset();

    this.add_Task.taskTitle = '';
    this.add_Task.taskDescription = '';
    this.add_Task.taskOwner = '';
    this.add_Task.startDate = '';
    this.add_Task.dueDate = '';
    this.add_Task.taskCategoryId=0;

    this.isTaskTitleValid = false;
    this.isTaskDescriptionValid = false;
    this.isTaskOwnerValid = false;
    this.isTaskStartDateValid = false;
    this.isTaskDueDateValid = false;
    this.isTaskCategoryValid=false;
    this.isCriteria=false;

    this.taskTitleErrrorInfo = '';
    this.taskDescriptionErrorInfo = '';
    this.taskOwnerErrorInfo = '';
    this.taskStartDateErrorInfo = '';
    this.taskDueDateErrorInfo = '';
    this.taskCategoryErrorInfo='';
  }

  /**
   * currently this feature is disabled
   * @param event 
   */
  validateActionStartDate() {
    //var actionItemStartDate = event.target.value;
    if (this.addDetails.startDate === '') {
      this.actionItemStartDateErrorInfo = 'Start Date cannot be blank.'
      this.isActionItemStartDateValid = false;
    } else if (new Date(this.addDetails.startDate.toString()) < new Date(Date.now())) {
      this.actionItemStartDateErrorInfo = 'Start date cannot be a previous date.'
      this.isActionItemStartDateValid = false;
    } else {
      this.actionItemStartDateErrorInfo = '';
      this.isActionItemStartDateValid = true;
    }
    return this.isActionItemStartDateValid;
  }


  /**
   * currently this feature is disabled
   * @returns 
   */
  validateActionItemOwner() {
    //var actionItemOwner = event.target.value;
    if (this.addDetails.actionItemOwner === null) {
      this.actionItemOwnerErrorInfo = 'Owner is required.';
      this.isActionItemOwnerValid = false;
    } else {
      this.actionItemOwnerErrorInfo = '';
      this.isActionItemOwnerValid = true;
    }
    return this.isActionItemOwnerValid;
  }


  /**
   * currently this feature is disabled
   * @param event 
   */
  validateActionEndDate() {
    // var actionItemEndDate = event.target.value;
    if (this.addDetails.endDate === '') {
      this.actionItemEndDateErrorInfo = 'End Date cannot be blank.'
      this.isActionItemEndDateValid = false;
    } else if (new Date(this.addDetails.endDate) < new Date(this.addDetails.startDate.toString())) {
      this.actionItemEndDateErrorInfo = 'End date cannot be less than start date.'
      this.isActionItemEndDateValid = false;
    } else {
      this.actionItemEndDateErrorInfo = '';
      this.isActionItemEndDateValid = true;
    }
    return this.isActionItemEndDateValid;
  }



  /**
   * currently this feature is disabled
   * @returns 
   */
  validateUpdateActionTitle() {
    if (this.updatedetails.actionItemTitle === '') {
      this.updateActionItemTitleErrorInfo = 'Title is required.';
      this.isUpdateActionItemTitleValid = false;
    } else if (this.updatedetails.actionItemTitle.length < 5) {
      this.updateActionItemTitleErrorInfo = 'Title should be minimum of 5 characters.';
      this.isUpdateActionItemTitleValid = false;
    } else if (this.updatedetails.actionItemTitle.length > 50) {
      this.updateActionItemTitleErrorInfo = 'Title  should not exceed more than 50 characters.';
      this.isUpdateActionItemTitleValid = false;
    } else {
      this.updateActionItemTitleErrorInfo = '';
      this.isUpdateActionItemTitleValid = true;
    }
    return this.isUpdateActionItemTitleValid;
  }

  /**
   * currently this feature is disabled
   * @returns 
   */
  validateUpdateActionDescription() {
    if (this.updatedetails.actionItemDescription === '') {
      this.updateActionItemDescErrorInfo = 'Description is required.';
      this.isUpdateActionItemDescValid = false;
    } else if (this.updatedetails.actionItemDescription.length < 5) {
      this.updateActionItemDescErrorInfo = 'Description should be minimum of 10 characters.';
      this.isUpdateActionItemDescValid = false;
    } else if (this.updatedetails.actionItemDescription.length > 250) {
      this.updateActionItemDescErrorInfo = 'Description  should not exceed more than 250 characters.';
      this.isUpdateActionItemDescValid = false;
    } else {
      this.updateActionItemDescErrorInfo = '';
      this.isUpdateActionItemDescValid = true;
    }
    return this.isUpdateActionItemDescValid;
  }

  /**
   * currently this feature is disabled
   * @returns 
   */
  validateUpdateActionPriority() {
    //var actionItemPriority = event.target.value;
    if (this.updatedetails.actionPriority === '') {
      this.updateActionItemPriorityErrorInfo = "Priority is required.";
      this.isUpdateActionItemPriorityValid = false;
    } else if (this.updatedetails.actionPriority === 'select') {
      this.updateActionItemPriorityErrorInfo = "Priority is required.";
      this.isUpdateActionItemPriorityValid = false;
    } else {
      this.updateActionItemPriorityErrorInfo = '';
      this.isUpdateActionItemPriorityValid = true;
    }
    return this.isUpdateActionItemPriorityValid;
  }

  /**
   * currently this feature is disabled
   * @returns 
   */
  validateUpdateActionItemOwner() {
    //var actionItemOwner = event.target.value;
    if (this.updatedetails.actionItemOwner === null) {
      this.updateActionItemOwnerErrorInfo = 'Owner is required.';
      this.isUpdateActionItemOwnerValid = false;
    } else {
      this.updateActionItemOwnerErrorInfo = '';
      this.isUpdateActionItemOwnerValid = true;
    }
    return this.isUpdateActionItemOwnerValid;
  }

  /**
   * currently this feature is disabled
   * @returns 
   */
  validateUpdateActionStartDate() {
    //var actionItemStartDate = event.target.value;
    if (this.updatedetails.startDate === '') {
      this.updateActionItemStartDateErrorInfo = 'Start Date cannot be blank.'
      this.isUpdateActionItemStartDateValid = false;
    } else if (new Date(this.updatedetails.startDate.toString()) < new Date(Date.now())) {
      this.updateActionItemStartDateErrorInfo = 'Start date cannot be a previous date.'
      this.isUpdateActionItemStartDateValid = false;
    } else {
      this.updateActionItemStartDateErrorInfo = '';
      this.isUpdateActionItemStartDateValid = true;
    }
    return this.isUpdateActionItemStartDateValid;
  }

  /**
   * currently this feature is disabled
   * @returns 
   */
  validateUpdateActionEndDate() {
    // var actionItemEndDate = event.target.value;
    if (this.updatedetails.endDate === '') {
      this.updateActionItemEndDateErrorInfo = 'End Date cannot be blank.'
      this.isUpdateActionItemEndDateValid = false;
    } else if (new Date(this.updatedetails.endDate) < new Date(this.addDetails.startDate.toString())) {
      this.updateActionItemEndDateErrorInfo = 'End date cannot be less than start date.'
      this.isUpdateActionItemEndDateValid = false;
    } else {
      this.updateActionItemEndDateErrorInfo = '';
      this.isUpdateActionItemEndDateValid = true;
    }
    return this.isUpdateActionItemEndDateValid;
  }

  /**
 * currently this feature is disabled
 * @param meeting 
 */
  updateActionItem(form: NgForm) {
    let isTitlevalid = true;
    let isDescriptionValid = true;
    let isPriorityValid = true;
    let isOwnervalid = true;
    let isEndDateValid = true;
    let isStartDateValid = true;
    if (this.isUpdateActionItemTitleValid === false) {
      var valid = this.validateUpdateActionTitle();
      isTitlevalid = valid;
    }
    if (this.isUpdateActionItemDescValid === false) {
      var valid = this.validateUpdateActionDescription();
      isDescriptionValid = valid;
    }
    if (!this.isUpdateActionItemPriorityValid) {
      var valid = this.validateUpdateActionPriority();
      isPriorityValid = valid;
    }
    if (!this.isUpdateActionItemOwnerValid) {
      var valid = this.validateUpdateActionItemOwner();
      isOwnervalid = valid;
    }
    if (!this.isUpdateActionItemStartDateValid) {
      var valid = this.validateUpdateActionStartDate();
      isStartDateValid = valid;
    }
    if (!this.isUpdateActionItemEndDateValid) {
      var valid = this.validateUpdateActionEndDate();
      isEndDateValid = valid;
    }
    if (isTitlevalid === true && isDescriptionValid === true
      && isPriorityValid === true && isOwnervalid == true && isStartDateValid === true
      && isEndDateValid === true) {
      this.id = this.updatedetails.actionItemId; 
      this.service.updateActionItem(this.updatedetails).subscribe(response => {
        this.data = response.body;
      });
      this.toastr.success('Action item updated successfully');
      //need to change this later
      //window.location.reload();
    }
  }

  /**
   * currently this feature is disabled
   */
  getActiveUMSUsersEmailIdList() {
    //perform an AJAX call to get list of users
    var isActive: boolean = true;
    // $.ajax({url:"http://localhost:8012/users/getEmail-list/", success: function(result){
    //   this.userEmailIdList = result;
    // }});
    this.meetingsService.getActiveUserEmailIdList().subscribe(
      (response) => {
        this.userEmailIdList = response.body;
      }
    )
  }

  currentActionItemPriority: string = localStorage.getItem('currentActionItemPriority');
  currentActionItemPlannedStartDate: string = localStorage.getItem('currentActionItemPlannedStartDate');
  currentActionItemPlannedEndDate: string = localStorage.getItem('currentActionItemPlannedEndDate');

  //Tasks
  add_Task = {
    taskId: 0,
    taskTitle: '',
    taskDescription: '',
    taskPriority: localStorage.getItem('currentActionItemPriority'),
    startDate: '',
    plannedStartDate: localStorage.getItem('currentActionItemPlannedStartDate'),
    plannedEndDate: localStorage.getItem('currentActionItemPlannedEndDate'),
    dueDate: '',
    taskOwner: '',
    organizer: '',
    status: 'Yet to start',
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
    createdBy: '',
    modifiedBy: '',
    createdByEmailId: '',
    modifiedByEmailId:''
  }

  isTaskTitleValid = false;
  taskTitleErrrorInfo = '';
  validateTaskTitle() {
    //var taskTitle = event.target.value;
    const regex = /^(?!\s)[\s\S]*$/;
    if (this.add_Task.taskTitle.trim() === "" || regex.test(this.add_Task.taskTitle) === false) {
      if (this.add_Task.taskTitle.startsWith(" ")) {
        this.taskTitleErrrorInfo = 'Title cannot start with a space.';
      } else {
        this.taskTitleErrrorInfo = 'Title is required.';
      }
      this.isTaskTitleValid = false;
    } else if (this.add_Task.taskTitle.length < 5) {
      this.taskTitleErrrorInfo = 'Title should have minimum of 5 characters.';
      this.isTaskTitleValid = false;
    } else if (this.add_Task.taskTitle.length > 50) {
      this.taskTitleErrrorInfo = 'Title should not exceed more than 50 characters.';
      this.isTaskTitleValid = false;
    } else {
      this.taskTitleErrrorInfo = '';
      this.isTaskTitleValid = true;
    }
    return this.isTaskTitleValid;

  }
  taskDescriptionErrorInfo = '';
  isTaskDescriptionValid = false;
  validateTaskDescription() {
    // var taskDescription=event.target.value;

    // This one is restricting space in begining and also restricting the other line when you add numbers or special characters
    // const regex = /^\S.*[a-zA-Z\s]*$/; 
    
    const regex = /^(?!\s)[\s\S]*$/;
    if (this.add_Task.taskDescription === '' || regex.test(this.add_Task.taskDescription) === false) {
      if(this.add_Task.taskDescription.startsWith(" ")){
        this.taskDescriptionErrorInfo = 'Description cannot start with a space';
      }else{
        this.taskDescriptionErrorInfo = 'Description is required.';
      }
      this.isTaskDescriptionValid = false;
    }
    else if (this.add_Task.taskDescription.length < 10) {
      this.taskDescriptionErrorInfo = 'Description should have minimum of 10 characters.';
      this.isTaskDescriptionValid = false;
    }
    else if (this.add_Task.taskDescription.length > 250) {
      this.taskDescriptionErrorInfo = 'Description should not exceed more than 250 characters.';
      this.isTaskDescriptionValid = false;
    }
    else {
      this.taskDescriptionErrorInfo = '';
      this.isTaskDescriptionValid = true;

    }
    return this.isTaskDescriptionValid;
  }
  // taskPriorityErrorInfo = '';
  // isTaskPriorityValid = false;
  // validateTaskPriority() {
  //   //var taskPriority = event.target.value;
  //   if (this.add_Task.taskPriority === '') {
  //     this.taskPriorityErrorInfo = 'task priority should not be empty';
  //     this.isTaskPriorityValid = false;
  //   }
  //   else if (this.add_Task.taskPriority == 'select') {
  //     this.taskPriorityErrorInfo = 'task priority is required';
  //     this.isTaskPriorityValid = false;
  //   }
  //   else {
  //     this.taskPriorityErrorInfo = '';
  //     this.isTaskPriorityValid = true;
  //   }
  //   return this.isTaskPriorityValid;
  // }
  taskStatusErrorInfo = '';
  isTaskStatusValid = false;
  validateTaskStatus() {
    // var taskStatus = event.target.value;
    if (this.add_Task.status === '') {
      this.taskStatusErrorInfo = 'Status is required.';
      this.isTaskStatusValid = false;

    }
    else if (this.add_Task.status === 'Select') {
      this.taskStatusErrorInfo = 'Status is required.';
      this.isTaskStatusValid = false;
    }
    else {
      this.taskStatusErrorInfo = '';
      this.isTaskStatusValid = true;
    }
    return this.isTaskStatusValid;
  }

  taskCategoryErrorInfo = '';
  isTaskCategoryValid = false;
  validateTaskCategory() {
    if (this.add_Task.taskCategoryId === 0 || this.add_Task.taskCategoryId===null) {
      this.taskCategoryErrorInfo = 'Select a task category.';
      this.isTaskCategoryValid = false;
    } else {
      this.taskCategoryErrorInfo = '';
      this.isTaskCategoryValid = true;
    }
    return this.isTaskCategoryValid;
  }

  taskStartDateErrorInfo = '';
  isTaskStartDateValid = false;
  validateTaskStartDate() {
    //var taskStartDate=event.target.value;
    if (this.add_Task.startDate === '') {
      this.taskStartDateErrorInfo = 'Select the start date.';
      this.isTaskStartDateValid = false;
    }
    /*else if (new Date(this.update_Task.startDate.toString()) < new Date(Date.now())) {
      this.taskStartDateErrorInfo = 'Start date cannot be previous date.'
      this.isTaskStartDateValid = false;
    }*/
    else {
      this.taskStartDateErrorInfo = '';
      this.isTaskStartDateValid = true;
    }
    return this.isTaskStartDateValid;
  }
  taskOwnerErrorInfo = '';
  isTaskOwnerValid = false;
  validateTaskOwner() {
    // var taskOwner = event.target.value;

    if (this.add_Task.taskOwner == '' || this.add_Task.taskOwner === null) {

      this.taskOwnerErrorInfo = 'Task Owner is required.';
      this.isTaskOwnerValid = false;
    }
    else if (this.add_Task.taskOwner == '') {
      this.taskOwnerErrorInfo = 'Task Owner is required.';
      this.isTaskOwnerValid = false;

    }
    else {
      this.taskOwnerErrorInfo = '';
      this.isTaskOwnerValid = true;
    }
    return this.isTaskOwnerValid;

  }
  taskDueDateErrorInfo = '';
  isTaskDueDateValid = false;
  validateTaskDueDate() {
    // var taskDueDate=event.target.value;
    if (this.add_Task.dueDate === '') {
      this.taskDueDateErrorInfo = 'Select the due date.';
      this.isTaskDueDateValid = false;
    }
    else if (Date.parse(this.add_Task.dueDate) < Date.parse(this.add_Task.startDate)) {
      this.taskDueDateErrorInfo = 'Date should`nt be less than startdate.';
      this.isTaskDueDateValid = false;
    }
    else {
      this.taskDueDateErrorInfo = '';
      this.isTaskDueDateValid = true;
    }
    return this.isTaskDueDateValid;
  }

  addTask(task: any) {
    let isTitleValid = true;
    let isDescriptionValid = true;
    let isOwnerValid = true;
    let isStatusValid = true;
    let isStartDateValid = true;
    let isDueDateValid = true;
    let isPriorityValid = true;
    let isCategoryValid = true;

    if (!this.isTaskTitleValid) {
      var valid = this.validateTaskTitle();
      isTitleValid = valid;
    }
    if (!this.isTaskDescriptionValid) {
      var valid = this.validateTaskDescription();
      isDescriptionValid = valid;
    }
    // if (!this.isTaskPriorityValid) {
    //   var valid = this.validateTaskPriority();
    //   isPriorityValid = valid;
    // }
    if (!this.isTaskOwnerValid) {
      var valid = this.validateTaskOwner();
      isOwnerValid = valid;
    }
    if (!this.isTaskCategoryValid) {
      var valid = this.validateTaskCategory();
      isCategoryValid = valid;
    }
    // if (!this.isTaskStartDateValid) {
    //   var valid = this.validateTaskStartDate();
    //   isStartDateValid = valid;
    // }
    // if (!this.isTaskDueDateValid) {
    //   var valid = this.validateTaskDueDate();
    //   isDueDateValid = valid;
    // }

    if (isTitleValid == true && isDescriptionValid == true &&
      isOwnerValid == true && isPriorityValid == true && isStartDateValid == true
      && isDueDateValid == true && isCategoryValid == true
    ) {
      this.add_Task.emailId = this.selectedReporteeOrganizedActionItem != null ? this.selectedReporteeOrganizedActionItem : this.loggedInUser;
      this.add_Task.actionItemId = this.currentActionItemId;
      this.add_Task.departmentId = this.selectedUserdepartmentId;
      this.add_Task.taskCategory.taskCategoryId = this.add_Task.taskCategoryId
      this.add_Task.createdBy = localStorage.getItem('firstName')+' '+localStorage.getItem('lastName');
      this.add_Task.createdByEmailId = this.loggedInUser
      this.disableSaveButton=true;
      this.taskService.createTask(this.add_Task).subscribe({
        next: (response) => {
          var data = response.body;
          if (response.status == HttpStatusCode.Ok) {
            this.toastr.success("Task created successfully.");
            document.getElementById('closeAddModal').click();
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        }, error: error => {
          if (error.status === HttpStatusCode.Unauthorized) {
            this.router.navigateByUrl('/session-timeout');
          } else if (error.status === HttpStatusCode.ServiceUnavailable) {
            this.router.navigateByUrl('service-unavailable');
          }
          else {
            this.toastr.error('Error while creating task. Please try again !')
            this.disableSaveButton=false;
          }
        }
      })
    }else{
          this.isCriteria=true;
        }
  }
  min: any = "";

  /**
   * disable past date time
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
   * store selected reportee in localstorage
   */
  storeReporteeDataOfOrganizedActionItems() {
    localStorage.setItem('selectedReporteeOrganizedActionItem', this.selectedReporteeOrganizedActionItem);
    this.selectedReporteeOrganizedActionItem = localStorage.getItem('selectedReporteeOrganizedActionItem')
    if (this.selectedReporteeOrganizedActionItem === 'null') {
      localStorage.setItem('selectedReporteeOrganizedActionItem', this.loggedInUser)
      this.selectedReporteeOrganizedActionItem = localStorage.getItem('selectedReporteeOrganizedActionItem');
    }
    window.location.reload();
  }
  /**
   * close filter modal on click
   */
  CloseFilterActionItemModal() {
    document.getElementById('closeModal').click();
  }

  /**
   * reset filter
   */
  resetFilterModal() {
    localStorage.setItem('actionItemNameFilter', '');
    localStorage.setItem('actionItemStartDateFilter', '');
    localStorage.setItem('actionItemEndDateFilter', '');
    localStorage.setItem('actionItemOwnerFilter', '');

    this.CloseFilterActionItemModal();
    window.location.reload();
  }


  /**
   * 
   * @param ActionItemName 
   * @param ActionItemStartDate 
   * @param ActionItemEndDate 
   */
  filterActionItemList(actionItemTitle: string, actionItemOwner: string, actionItemStartDate: string, actionItemEndDate: string,) {
    this.actionItemNameFilter = actionItemTitle;
    this.actionItemOwnerFilter = actionItemOwner;
    this.actionItemStartDateFilter = actionItemStartDate;
    this.actionItemEndDateFilter = actionItemEndDate;
    this.isComponentLoading=true;
    this.isActionItemDataText=true;

    localStorage.setItem("actionItemNameFilter", actionItemTitle);
    localStorage.setItem("actionItemOwnerFilter", actionItemOwner);
    localStorage.setItem("actionItemStartDateFilter", actionItemStartDate);
    localStorage.setItem("actionItemEndDateFilter", actionItemEndDate);

    this.service.getActionItemByUserId(this.selectedReporteeOrganizedActionItem, actionItemTitle, actionItemOwner, actionItemStartDate, actionItemEndDate)
      .subscribe({
        next: response => {
          this.isComponentLoading=false;
          this.isActionItemDataText=false;
          this.actionItems = response.body;
          this.actionItemCount = response.body.length;

        }
      })
    this.CloseFilterActionItemModal();
    //window.location.reload();
  }

  getCurrentActionItemDetails(actionItem: ActionItems) {
    localStorage.setItem('currentActionItemPriority', actionItem.actionPriority)
    this.add_Task.taskPriority = localStorage.getItem('currentActionItemPriority');
    localStorage.setItem('currentActionItemPlannedStartDate', actionItem.startDate);
    this.add_Task.plannedStartDate = localStorage.getItem('currentActionItemPlannedStartDate');
    localStorage.setItem('currentActionItemPlannedEndDate', actionItem.endDate);
    this.add_Task.plannedEndDate = localStorage.getItem('currentActionItemPlannedEndDate');
  }

  getTaskcategories() {
    this.taskService.findTaskCategories().subscribe({
      next: response => {
        this.taskCategoryList = response.body;
      }
    })
  }

  currentMenuItem: MenuItem;
  /**
   * 
   * @returns 
   */
  async getCurrentMenuItemDetails(): Promise<MenuItem> {
    const response = await lastValueFrom(this.menuItemService.findMenuItemByName('Action Items')).then(response => {
      if (response.status === HttpStatusCode.Ok) {
        this.currentMenuItem = response.body;
      } else if (response.status === HttpStatusCode.Unauthorized) {
        this.router.navigateByUrl('/session-timeout');
      }
    }, reason => {
      if (reason.status === HttpStatusCode.Unauthorized) {
        this.router.navigateByUrl('/session-timeout')
      }
    }
    )
    return this.currentMenuItem;
  }

  getPOPUPMessage(){
    var popup = document.getElementById("myPopup");
    popup.classList.toggle("show");
  }

  // getPOPUPMessage2(){
  //   var popup = document.getElementById("myPopup2");
  //   popup.classList.toggle("show");
  // }

  //Pagination code
  page: number = 1;
  count: number = 0;
  tableSize: number = parseInt(localStorage.getItem('actionItemTableSize'));
  tableSizes: any = [3, 6, 9, 12];
  onTableDataChange(event: any) {
    this.page = event;
    this.getActionItemsOfUser();
    this.calculateEntriesInfo();
  }
  onTableSizeChange(event: any): void {
    this.tableSize = event.target.value;
    this.page = 1;
    this.getActionItemsOfUser();
  }
  public setItemsPerPage(event) {
    this.tableSize = event;
    localStorage.setItem('actionItemTableSize', event);
    if(this.reloadPageCount===2){
      window.location.reload()
    }
}
entriesInfo:string='';
calculateEntriesInfo() {
  const start = (this.page - 1) * this.tableSize + 1;
  const end = Math.min(start + this.tableSize - 1, this.actionItemCount); 
  this.entriesInfo = `Showing ${start} to ${end} of ${this.actionItemCount} entries`;

}

}


