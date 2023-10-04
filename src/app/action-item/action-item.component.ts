import { Component, OnInit, Output } from '@angular/core';
import { ActionItems } from 'src/app/model/actionitem.model';
import { ActionService } from './service/action.service';
import { Task } from '../model/task.model';
import { TaskService } from '../task/service/task.service';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { MeetingService } from '../meetings/service/meetings.service';

@Component({
  selector: 'app-action-item',
  templateUrl: './action-item.component.html',
  styleUrls: ['./action-item.component.css']
})
export class ActionItemComponent implements OnInit {

  @Output() title: string = 'Actions'
  actionItemCount: number = 0;
  id: number;
  //actionItem:ActionItems = new ActionItems();
  task_array: Task[];
  actions: Object;
  isfill: boolean = false;
  actionItems: ActionItems[];
  actionItems_new: ActionItems;
  email: string;
  updatedetails = {
    actionItemId: 0,
    meetingId: 0,
    emailId: '',
    actionItemOwner: '',
    actionItemTitle: '',
    actionItemDescription: '',
    actionPriority: '',
    actionStatus: '',
    startDate: '',
    endDate: ''

  }

  isActionItemTitleValid = false;
  isActionItemDescriptionValid = false;
  isActionItemPriorityValid = false;
  isActionItemOwnerValid = false;
  isActionItemStartDateValid = false;
  isActionItemEndDateValid = false;

  //errorinformation properties
  actionItemTitleErrorInfo: string = '';
  actionItemEndDateErrorInfo: string = '';
  actionItemDescriptionErrorInfo: string = ''
  actionItemPriorityErrorInfo: string = ''
  actionItemStartDateErrorInfo: string = ''

  constructor(private service: ActionService, private taskService: TaskService, private toastr: ToastrService,
    private meetingsService: MeetingService) {

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
    console.log("logged in userId is: " + localStorage.getItem('email'));
    /* this.service.getAllActionItems().subscribe(response => {
       console.log(this.actionItems);
       this.actionItems = response.body;
       this.actionItemCount = response.body.length;
       
     });*/
    this.service.getUserActionItemsByUserId(localStorage.getItem('email')).subscribe(res => {
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
      this.updatedetails.meetingId = this.actionItems_new.meetingId;
      this.updatedetails.actionStatus = this.actionItems_new.actionStatus;
      console.log(this.actionItems_new.actionItemDescription);
      this.updatedetails.actionItemTitle = this.actionItems_new.actionItemTitle;
      this.updatedetails.actionPriority = this.actionItems_new.actionPriority;
      this.updatedetails.startDate = this.actionItems_new.startDate;
      this.updatedetails.endDate = this.actionItems_new.endDate;

    });
    console.log("data fetching");

  }
  data: object = {};
  //Update the Details
  updateDetails(event: any) {
    this.id = this.updatedetails.actionItemId;
    console.log(this.updatedetails.actionPriority);
    console.log(this.id);
    console.log(this.updatedetails);
    this.service.updateActionItem(this.updatedetails).subscribe(response => {
      this.data = response.body;

      console.log(this.data);
    });
  }
  addDetails = {
    actionItemId: 0,
    meetingId: 0,
    emailId: '',
    actionItemOwner: '',
    actionItemTitle: '',
    actionItemDescription: '',
    actionPriority: '',
    actionStatus: 'NotConverted',
    startDate: '',
    endDate: ''
  }
  ViewTaskDetails() {
    console.log("fetching task details");
    this.service.getAlltasks().subscribe(response => {
      this.task_array = response.body;
      console.log(this.task_array);
    });
    console.log("request success");

  }

  //Add Action Item method
  addActionItems() {

    this.addDetails;

  }
  response: Object;
  actions_details: Object
  //save Action Item method
  saveActionItem(form: NgForm) {
    let isTitlevalid = true;
    let isDescriptionValid = true;
    let isPriorityValid = true;
    let isOwnervalid = true;
    let isEndDateValid = true;
    let isStartDateValid = true;
    if (this.isActionItemTitleValid === false) {
      var valid = this.validateActionTitle();
      console.log(valid)
      isTitlevalid = valid;
    }
    if (this.isActionItemDescriptionValid === false) {
      var valid = this.validateActionDescription();
      console.log(valid)
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
    console.log(isTitlevalid + '' + isDescriptionValid + '' + isEndDateValid + '' + isStartDateValid + '' + isPriorityValid + '' + isOwnervalid)
    if (isTitlevalid === true && isDescriptionValid === true
      && isPriorityValid === true && isOwnervalid == true && isStartDateValid === true
      && isEndDateValid === true) {
      console.log(this.addDetails);
      this.addDetails.emailId = localStorage.getItem('email');
      this.service.saveActionItem(this.addDetails).subscribe(response => {
        this.response = response.body;
        this.actions_details = response.body;
        console.log(this.response);
      });
    }
  }
  actionItem_id: number;

  checkCheckBoxes() {
    var actionItemsToBeDeleted = [];
    var table = document.getElementById("myTable")
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
          actionItemsToBeDeleted.push(checkbox.value);
        }
      }

    }
    console.log(actionItemsToBeDeleted);

    this.deleteActionItems(actionItemsToBeDeleted);

  }
  isActionsDeleted: boolean = false;
  deleteActionItems(actionItemList: any[]) {

    this.service.deleteSelectedActionItemsByIds(actionItemList).subscribe(res => {
      this.isActionsDeleted = res.body;
      console.log(this.isActionsDeleted);
      if (this.isActionsDeleted) {
        console.log("actions deleted");
        this.toastr.success("action Items Deleted");

      }
      else {
        console.log("actions not deleted");
        this.toastr.error("action Items are not deleted try again");
      }
    })


  }

  temp_data: number
  str: string;
  //delete single action Item data
  deleteData(id: number): any {
    this.actionItem_id = id;
    console.log("the id is:" + id);
    this.service.deleteActionItem(this.actionItem_id).subscribe(res => {
      this.temp_data = res.body;
      console.log("the returned value is:", this.temp_data);
      if (this.temp_data === 1) {
        console.log("record deleted deleted");
      }
      else {
        console.log("record not deleted");
      }

    });
    return this.actionItem_id;


  }

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

  validateActionTitle(): boolean {
    // var actionItemTitle = event.target.value;
    if (this.addDetails.actionItemTitle === '') {
      this.actionItemTitleErrorInfo = "Action Item title is required";
      this.isActionItemTitleValid = false;
    } else if (this.addDetails.actionItemTitle.length < 5) {
      this.actionItemTitleErrorInfo = 'Title should have a minimum of 5 chars';
      this.isActionItemTitleValid = false;
    } else if (this.addDetails.actionItemTitle.length > 500) {
      this.actionItemTitleErrorInfo = 'Title must not exceed 500 chars';
      this.isActionItemTitleValid = false;
    } else {
      this.actionItemTitleErrorInfo = '';
      this.isActionItemTitleValid = true;
    }
    return this.isActionItemTitleValid;
  }

  /**
   * 
   * @param event 
   */
  validateActionDescription(): boolean {
    //var actionItemDescription = event.target.value;
    if (this.addDetails.actionItemDescription === '') {
      this.actionItemDescriptionErrorInfo = "Description is required";
      this.isActionItemDescriptionValid = false;
    } else if (this.addDetails.actionItemDescription.length < 10) {
      this.actionItemDescriptionErrorInfo = 'Description should have a minimum of 10 chars';
      this.isActionItemDescriptionValid = false;
    } else if (this.addDetails.actionItemDescription.length > 1000) {
      this.actionItemDescriptionErrorInfo = 'Description must not exceed 1000 chars';
      this.isActionItemDescriptionValid = false;
    } else {
      this.actionItemDescriptionErrorInfo = '';
      this.isActionItemDescriptionValid = true;
    }
    return this.isActionItemDescriptionValid;
  }


  /**
   * 
   * @param event 
   */
  validateActionPriority() {
    //var actionItemPriority = event.target.value;
    if (this.addDetails.actionPriority === '') {
      this.actionItemPriorityErrorInfo = "Priority is required";
      this.isActionItemPriorityValid = false;
    } else if (this.addDetails.actionPriority === 'select') {
      this.actionItemPriorityErrorInfo = "Priority is required";
      this.isActionItemPriorityValid = false;
    } else {
      this.actionItemPriorityErrorInfo = '';
      this.isActionItemPriorityValid = true;
    }
    return this.isActionItemPriorityValid;
  }

  /**
   * 
   * @param form 
   */
  clearErrorMessages(form: NgForm) {
    // this.actionItemTitleErrorInfo = '';
    // this.actionItemDescriptionErrorInfo = '';
    // this.actionItemPriorityErrorInfo = '';
    // this.actionItemStartDateErrorInfo = '';
    // this.actionItemEndDateErrorInfo = '';
    form.form.reset();
  }

  /**
   * 
   * @param event 
   */
  validateActionStartDate() {
    //var actionItemStartDate = event.target.value;
    if (this.addDetails.startDate === '') {
      this.actionItemStartDateErrorInfo = 'Start Date cannot be blank'
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

  actionItemOwnerErrorInfo: string = '';
  validateActionItemOwner() {
    console.log(this.addDetails.actionItemOwner)
    //var actionItemOwner = event.target.value;
    if (this.addDetails.actionItemOwner === '' || this.addDetails.actionItemOwner === null) {
      this.actionItemOwnerErrorInfo = 'Owner is required';
      this.isActionItemOwnerValid = false;
    } else {
      this.actionItemOwnerErrorInfo = '';
      this.isActionItemOwnerValid = true;
    }
    return this.isActionItemOwnerValid;
  }


  /**
   * 
   * @param event 
   */
  validateActionEndDate() {
    // var actionItemEndDate = event.target.value;
    //console.log(actionItemEndDate);
    if (this.addDetails.endDate === '') {
      this.actionItemEndDateErrorInfo = 'End Date cannot be blank'
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

  updateActionItemTitleErrorInfo = '';
  updateActionItemDescErrorInfo = '';
  updateActionItemPriorityErrorInfo = '';
  updateActionItemOwnerErrorInfo = '';
  updateActionItemStartDateErrorInfo = '';
  updateActionItemEndDateErrorInfo = '';

  isUpdateActionItemTitleValid = false;
  isUpdateActionItemDescValid = false;
  isUpdateActionItemPriorityValid = false;
  isUpdateActionItemOwnerValid = false;
  isUpdateActionItemStartDateValid = false;
  isUpdateActionItemEndDateValid = false;

  validateUpdateActionTitle(){
    if(this.updatedetails.actionItemTitle === ''){
      this.updateActionItemTitleErrorInfo = 'Title is required';
      this.isUpdateActionItemTitleValid = false;
    }else if(this.updatedetails.actionItemTitle.length < 5){
      this.updateActionItemTitleErrorInfo = 'Title should be manimum of 5 chars';
      this.isUpdateActionItemTitleValid = false;
    }else if(this.updatedetails.actionItemTitle.length>500){
      this.updateActionItemTitleErrorInfo = 'Title should not exceed 500 chars';
      this.isUpdateActionItemTitleValid = false;
    }else{
      this.updateActionItemTitleErrorInfo = '';
      this.isUpdateActionItemTitleValid = true;
    }
    return this.isUpdateActionItemTitleValid;
  }

  validateUpdateActionDescription(){
    if(this.updatedetails.actionItemDescription === ''){
      this.updateActionItemDescErrorInfo = 'Description is required';
      this.isUpdateActionItemDescValid = false;
    }else if(this.updatedetails.actionItemDescription.length < 5){
      this.updateActionItemDescErrorInfo = 'Description should be manimum of 10 chars';
      this.isUpdateActionItemDescValid = false;
    }else if(this.updatedetails.actionItemDescription.length>500){
      this.updateActionItemDescErrorInfo = 'Description should not exceed 1000 chars';
      this.isUpdateActionItemDescValid = false;
    }else{
      this.updateActionItemDescErrorInfo = '';
      this.isUpdateActionItemDescValid = true;
    }
    return this.isUpdateActionItemDescValid;
  }

  /** */
  validateUpdateActionPriority(){
    //var actionItemPriority = event.target.value;
    if(this.updatedetails.actionPriority === ''){
      this.updateActionItemPriorityErrorInfo = "Priority is required";
     this.isUpdateActionItemPriorityValid = false;
    }else if(this.updatedetails.actionPriority === 'select'){
      this.updateActionItemPriorityErrorInfo = "Priority is required";
      this.isUpdateActionItemPriorityValid = false;
    }else{
      this.updateActionItemPriorityErrorInfo = '';
      this.isUpdateActionItemPriorityValid = true;
    }
    return this.isUpdateActionItemPriorityValid;
  }

  /**
   * 
   * @returns 
   */
  validateUpdateActionItemOwner(){
    //var actionItemOwner = event.target.value;
    if(this.updatedetails.actionItemOwner === '' || this.updatedetails.actionItemOwner === null){
      this.updateActionItemOwnerErrorInfo = 'Owner is required';
      this.isUpdateActionItemOwnerValid = false;
    }else{
      this.updateActionItemOwnerErrorInfo = '';
      this.isUpdateActionItemOwnerValid = true;
    }
    return this.isUpdateActionItemOwnerValid;
  }

  /**
   * 
   * @returns 
   */
  validateUpdateActionStartDate(){
    //var actionItemStartDate = event.target.value;
    if(this.updatedetails.startDate === ''){
      this.updateActionItemStartDateErrorInfo = 'Start Date cannot be blank'
      this.isUpdateActionItemStartDateValid = false;
    }else if(new Date(this.updatedetails.startDate.toString()) < new Date(Date.now())){
      this.updateActionItemStartDateErrorInfo = 'Start date cannot be a previous date.'
      this.isUpdateActionItemStartDateValid = false;
    }else{
      this.updateActionItemStartDateErrorInfo = '';
      this.isUpdateActionItemStartDateValid = true;
    }
    return this.isUpdateActionItemStartDateValid;
  }

   /**
    * 
    * @returns 
    */
   validateUpdateActionEndDate(){
    // var actionItemEndDate = event.target.value;
     //console.log(actionItemEndDate);
     if(this.updatedetails.endDate === ''){
       this.updateActionItemEndDateErrorInfo = 'End Date cannot be blank'
       this.isUpdateActionItemEndDateValid = false;
     }else if(new Date(this.updatedetails.endDate) < new Date(this.addDetails.startDate.toString())){
       this.updateActionItemEndDateErrorInfo = 'End date cannot be less than start date.'
       this.isUpdateActionItemEndDateValid = false;
     }else{
       this.updateActionItemEndDateErrorInfo = '';
       this.isUpdateActionItemEndDateValid = true;
     }
     return this.isUpdateActionItemEndDateValid;
   }

    /**
   * 
   * @param meeting 
   */
  updateActionItem(form: NgForm) {
    let isTitlevalid = true;
   let isDescriptionValid = true;
   let isPriorityValid = true;
   let isOwnervalid = true;
   let isEndDateValid = true;
   let isStartDateValid = true;
    if(this.isUpdateActionItemTitleValid===false){
        var valid = this.validateUpdateActionTitle();
        console.log(valid)
        isTitlevalid = valid;
    }
    if(this.isUpdateActionItemDescValid===false){
      var valid = this.validateUpdateActionDescription();
      console.log(valid)
      isDescriptionValid = valid;
    }
    if(!this.isUpdateActionItemPriorityValid){
      var valid = this.validateUpdateActionPriority();
      isPriorityValid = valid;
    }
    if(!this.isUpdateActionItemOwnerValid){
      var valid = this.validateUpdateActionItemOwner();
      isOwnervalid = valid;
    }
    if(!this.isUpdateActionItemStartDateValid){
      var valid = this.validateUpdateActionStartDate();
      isStartDateValid = valid;
    }
    if(!this.isUpdateActionItemEndDateValid){
      var valid = this.validateUpdateActionEndDate();
      isEndDateValid = valid;
    }
    console.log(isTitlevalid+''+isDescriptionValid+''+isEndDateValid+''+isStartDateValid+''+isPriorityValid+''+isOwnervalid)
    if(isTitlevalid === true && isDescriptionValid === true
      && isPriorityValid === true && isOwnervalid==true && isStartDateValid===true
      && isEndDateValid === true) {
    this.id = this.updatedetails.actionItemId;
    console.log(this.updatedetails);
    this.service.updateActionItem(this.updatedetails).subscribe(response => {
      this.data = response.body;
      console.log(this.data);
    });
    this.toastr.success('Action item updated successfully');
    //need to change this later
    //window.location.reload();
  }
}

  userEmailIdList: string[];
  getActiveUMSUsersEmailIdList() {
    //perform an AJAX call to get list of users
    var isActive: boolean = true;
    // $.ajax({url:"http://localhost:8012/users/getEmail-list/", success: function(result){
    //   this.userEmailIdList = result;
    //   console.log(result);
    //   console.log(this.userEmailIdList[0]);
    // }});
    this.meetingsService.getActiveUserEmailIdList().subscribe(
      (response) => {
        this.userEmailIdList = response.body;
        console.log(response.body);
        console.log(this.userEmailIdList);
      }
    )
  }

}
