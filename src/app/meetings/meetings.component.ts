
import { Component, ElementRef, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MeetingService } from './service/meetings.service';
import { Meeting } from '../model/Meeting.model';
import { Attendee } from '../model/Attendee.model';
import { ActionItems } from '../model/actionitem.model';
import { ActionItemComponent } from '../action-item/action-item.component';
import { ActionService } from '../action-item/service/action.service';
import { NavigationEnd, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpStatusCode } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { Users } from '../model/Users.model';
import { count } from 'rxjs';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-meetings',
  templateUrl: './meetings.component.html',
  styleUrls: ['./meetings.component.css']
})
export class MeetingsComponent implements OnInit{

  eventId: number;

  //global varibales
  meetings: Meeting[];
  meetingCount: number = 0;
  attendedMeetings: Meeting[];
  attendedMeetingCount: number = 0;
  transcriptsCount: number = 0;
  @Output() title: string = 'Meetings'
  tabOpened: string;
  transcriptData: string[];
  //isTransriptIconDisabled:boolean = true;
  actionItemsOfMeeting = [];
  currentMeetingId: number;

  response: Object;
  actions_details: Object

  id: number;
  data: object = {};

  transcriptMeetingId: number;
  meetingTrasncriptData: string[];
  meetingSubject: string;

  actionItemsToBeSubmittedIds = [];
  isEventActionItemsSubmitted;
  actionItemsToBeSubmitted = [];
  
  //errorinformation properties
  actionItemTitleErrorInfo: string = '';
  actionItemEndDateErrorInfo:string = '';
  actionItemDescriptionErrorInfo: string =''
  actionItemPriorityErrorInfo: string = ''
  actionItemStartDateErrorInfo: string =''

  actionItemStartDate: String = ''

  //action item save Button property
  isActionItemSaveButtonDisabled = false;

  actionItemsToBeDeleted = [];
  isMetingActionItemsDeleted;

  addDetails = {
    actionItemId: 0,
    meetingId: 0,
    emailId:'',
    actionItemOwner:'',
    actionItemTitle: '',
    actionItemDescription: '',
    actionPriority: '',
    actionStatus: 'Not Converted',
    startDate: '',
    endDate: ''

  }
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

  /**
   * 
   * @param meetingsService 
   * @param actionItemService 
   * @param router 
   * @param toastr 
   */
  constructor(private meetingsService: MeetingService, private actionItemService: ActionService,
    private router: Router, private toastr: ToastrService) {
    //this is jquery code that will slide the action items rows when show more action items link is clicked
    this.initializeActionItemsSlider();
}

/**
 * 
 */
  initializeActionItemsSlider(){
    $(function () {
      var previousRow=null;
      $('table').on('click', 'a.showmore', function (e) {
        e.preventDefault();
        //select thec closest tr of where the showmore link is present, and thats where th action items should be displayed
        var targetrow = $(this).closest('tr').next('.detail');   
        if(previousRow){
          previousRow.hide(1000).find('div').slideUp('slow',function(){
            if(!$(this).is(':visible')){
              previousRow.hide();
              previousRow=null
            }
          });
        }
        targetrow.show().find('div').slideDown('slow',function(){ 
          previousRow=targetrow;
        
        });
    });
  }); 
  }


  /**
   * 
   */
  ngOnInit(): void {
    //generate action items for user meetings automatically upon component initialization
    this.meetingsService.generateActionItemsByNlp(localStorage.getItem('email')).subscribe(
      (response =>{
        console.log(response.body)
      })
    

      
    )

   // setTimeout(() => { this.ngOnInit() }, 1000 * 3)
      //this.getOrganizedMeetings();
    //this.getMeetings('OrganizedMeeting');
    this.tabOpened = localStorage.getItem('tabOpened')
    console.log(this.tabOpened)
    this.getMeetings(this.tabOpened);

    //disable actionItem btn default
    this.isActionItemSaveButtonDisabled = true;
    this.pastDateTime();
  }

  /**
   * 
   * @param event 
   */

  isActionItemTitleValid = false;
  isActionItemDescriptionValid = false;
  isActionItemPriorityValid = false;
  isActionItemOwnerValid = false;
  isActionItemStartDateValid = false;
  isActionItemEndDateValid = false;

  /**
   * 
   * @returns 
   */
  validateActionTitle():boolean{
   // var actionItemTitle = event.target.value;
    if(this.addDetails.actionItemTitle === ''){
      this.actionItemTitleErrorInfo = "Action Item title is required";
      this.isActionItemTitleValid = false;
    }else if(this.addDetails.actionItemTitle.length < 5){
      this.actionItemTitleErrorInfo = 'Title should have a minimum of 5 chars';
      this.isActionItemTitleValid = false;
    }else if(this.addDetails.actionItemTitle.length > 50){
      this.actionItemTitleErrorInfo = 'Title should not exceed 50 chars';
      this.isActionItemTitleValid = false;
    }else{
      this.actionItemTitleErrorInfo = '';
      this.isActionItemTitleValid = true;
    }
    return this.isActionItemTitleValid;
  }

  /**
   * 
   * @param event 
   */
  validateActionDescription(): boolean{
    //var actionItemDescription = event.target.value;
    if(this.addDetails.actionItemDescription === ''){
      this.actionItemDescriptionErrorInfo = "Description is required";
      this.isActionItemDescriptionValid = false;
    }else if(this.addDetails.actionItemDescription.length <= 10){
      this.actionItemDescriptionErrorInfo = 'Description should have a minimum of 10 characters';
      this.isActionItemDescriptionValid = false;
    }else if(this.addDetails.actionItemDescription.length >= 250){
      this.actionItemDescriptionErrorInfo = 'Description must not exceed 250 characters';
      this.isActionItemDescriptionValid = false;
    }else{
      this.actionItemDescriptionErrorInfo = '';
      this.isActionItemDescriptionValid = true;
    }
    return this.isActionItemDescriptionValid;
  }


  /**
   * 
   * @param event 
   */
  validateActionPriority(){
    //var actionItemPriority = event.target.value;
    if(this.addDetails.actionPriority === ''){
      this.actionItemPriorityErrorInfo = "Priority is required";
      this.isActionItemPriorityValid = false;
    }else if(this.addDetails.actionPriority === 'select'){
      this.actionItemPriorityErrorInfo = "Priority is required";
      this.isActionItemPriorityValid = false;
    }else{
      this.actionItemPriorityErrorInfo = '';
      this.isActionItemPriorityValid =true;
    }
    return this.isActionItemPriorityValid;
  }

  /**
   * 
   * @param form 
   */
  clearErrorMessages(form: NgForm){

    //reset the form
    this.addDetails.actionItemTitle = '';
    this.addDetails.actionItemDescription = '';
    this.addDetails.actionItemOwner = '';
    this.addDetails.actionPriority = '';
    this.addDetails.actionStatus = '';
    this.addDetails.endDate = '';
    this.addDetails.startDate = '';

    // this.updatedetails.actionItemTitle = '';
    // this.updatedetails.actionItemDescription = '';
    // this.updatedetails.actionItemOwner = '';
    // this.updatedetails.actionPriority = '';
    // this.updatedetails.actionStatus = '';
    // this.updatedetails.endDate = '';
    // this.updatedetails.startDate = '';

    //clear Error messages
     this.actionItemTitleErrorInfo = '';
     this.actionItemDescriptionErrorInfo = '';
     this.actionItemOwnerErrorInfo = '';
     this.actionItemPriorityErrorInfo = '';
     this.actionItemStartDateErrorInfo = '';
     this.actionItemEndDateErrorInfo = '';

     this.updateActionItemTitleErrorInfo = '';
     this.updateActionItemDescErrorInfo = '';
     this.updateActionItemOwnerErrorInfo = '';
     this.updateActionItemPriorityErrorInfo = '';
     this.updateActionItemStartDateErrorInfo = '';
     this.updateActionItemEndDateErrorInfo = '';

     //
     this.isActionItemTitleValid = false;
     this.isActionItemDescriptionValid = false;
     this.isActionItemPriorityValid = false;
     this.isActionItemOwnerValid = false;
     this.isActionItemStartDateValid = false;
     this.isActionItemEndDateValid = false;

     this.isUpdateActionItemTitleValid = false;
     this.isUpdateActionItemDescValid = false;
     this.isUpdateActionItemPriorityValid = false;
     this.isUpdateActionItemOwnerValid = false;
     this.isUpdateActionItemStartDateValid = false;
     this.isUpdateActionItemEndDateValid = false;
  }

  /**
   * 
   * @param event 
   */
  validateActionStartDate(){
    //var actionItemStartDate = event.target.value;
    console.log(this.actionItemStartDate);
    if(this.addDetails.startDate === ''){
      this.actionItemStartDateErrorInfo = 'Start Date cannot be blank'
      this.isActionItemStartDateValid = false;
    }else if(new Date(this.addDetails.startDate.toString()) < new Date(Date.now())){
      this.actionItemStartDateErrorInfo = 'Start date cannot be a previous date.'
      this.isActionItemStartDateValid = false;
    }else{
      this.actionItemStartDateErrorInfo = '';
      this.isActionItemStartDateValid = true;
    }
    return this.isActionItemStartDateValid;
  }

  actionItemOwnerErrorInfo: string = '';

  /**
   * 
   * @returns 
   */
  validateActionItemOwner(){
    console.log(this.addDetails.actionItemOwner)
    //var actionItemOwner = event.target.value;
    if(this.addDetails.actionItemOwner === '' || this.addDetails.actionItemOwner === null){
      this.actionItemOwnerErrorInfo = 'Owner is required';
      this.isActionItemOwnerValid = false;
    }else{
      this.actionItemOwnerErrorInfo = '';
      this.isActionItemOwnerValid = true;
    }
    return this.isActionItemOwnerValid;
  }

  
  /**
   * 
   * @param event 
   */
  validateActionEndDate(){
   // var actionItemEndDate = event.target.value;
    //console.log(actionItemEndDate);
    if(this.addDetails.endDate === ''){
      this.actionItemEndDateErrorInfo = 'End Date cannot be blank'
      this.isActionItemEndDateValid = false;
    }else if(new Date(this.addDetails.endDate) < new Date(this.addDetails.startDate.toString())){
      this.actionItemEndDateErrorInfo = 'End date cannot be less than start date.'
      this.isActionItemEndDateValid = false;
    }else{
      this.actionItemEndDateErrorInfo = '';
      this.isActionItemEndDateValid = true;
    }
    return this.isActionItemEndDateValid;
  }

  /**
   * 
   * @param form 
   */

  saveActionItem(form: NgForm) {
   let isTitlevalid = true;
   let isDescriptionValid = true;
   let isPriorityValid = true;
   let isOwnervalid = true;
   let isEndDateValid = true;
   let isStartDateValid = true;
    if(this.isActionItemTitleValid===false){
        var valid = this.validateActionTitle();
        console.log(valid)
        isTitlevalid = valid;
    }
    if(this.isActionItemDescriptionValid===false){
      var valid = this.validateActionDescription();
      console.log(valid)
      isDescriptionValid = valid;
    }
    if(!this.isActionItemPriorityValid){
      var valid = this.validateActionPriority();
      isPriorityValid = valid;
    }
    if(!this.isActionItemOwnerValid){
      var valid = this.validateActionItemOwner();
      isOwnervalid = valid;
    }
    if(!this.isActionItemStartDateValid){
      var valid = this.validateActionStartDate();
      isStartDateValid = valid;
    }
    if(!this.isActionItemEndDateValid){
      var valid = this.validateActionEndDate();
      isEndDateValid = valid;
    }
    console.log(isTitlevalid+''+isDescriptionValid+''+isEndDateValid+''+isStartDateValid+''+isPriorityValid+''+isOwnervalid)
    if(isTitlevalid === true && isDescriptionValid === true
      && isPriorityValid === true && isOwnervalid==true && isStartDateValid===true
      && isEndDateValid === true) {
      console.log(this.addDetails);
    this.addDetails.meetingId = this.currentMeetingId;
    this.addDetails.emailId = localStorage.getItem('email');
    this.actionItemService.saveActionItem(this.addDetails).subscribe(response => {
      this.response = response.body;
      this.actions_details = response.body;
      console.log(this.response);
      if(response.status === HttpStatusCode.Ok){
        this.toastr.success('Action item added sucessfully !');
        document.getElementById('closeAddModal').click();
        setTimeout(()=>{
          window.location.reload();  
         },1000)
      }
    });
    this.fetchActionItemsOfEvent(this.currentMeetingId);
    //reset the form after submitting
    form.form.reset();
    // //need to change this later
    // window.location.reload();
    }
  }

  /**
   * 
   * @param meetingId 
   */
  fetchActionItemsOfEvent(meetingId: number) {
    this.currentMeetingId = meetingId;
    console.log(meetingId)
    //this.router.navigateByUrl('/meeting-actionitems/'+eventid);
    this.meetingsService.getActionItems().subscribe(
      (response => {
       // this.actionItemsOfEvent = response.body;
       this.actionItemsOfMeeting = response.body;
      })
    )
  }

  /**
   * 
   * @param tabOpened 
   */
  getMeetings(tabOpened: string) {
    //re-initailze slider
    this.initializeActionItemsSlider();
    console.log(tabOpened)
    localStorage.setItem('tabOpened', tabOpened);
    this.tabOpened = localStorage.getItem('tabOpened')
    console.log(localStorage.getItem('tabOpened'))

    if (tabOpened === 'OrganizedMeeting') {
      document.getElementById("organizedMeeting").style.borderBottom = '2px solid white';
      document.getElementById("organizedMeeting").style.width = 'fit-content';
      document.getElementById("organizedMeeting").style.paddingBottom = '2px';
      document.getElementById("attendedMeeting").style.borderBottom = 'none';
      //get user organized meetings
      this.meetingsService.getUserOraganizedMeetingsByUserId(localStorage.getItem('email')).subscribe(
        (response) => {
          this.meetings = response.body;
          this.meetingCount = response.body.length
          localStorage.setItem('meetingCount', this.meetingCount.toString());
          console.log(this.meetings);
          this.meetings.forEach(meeting => {
            if (meeting.meetingTranscripts.length > 0) {
              //enable the transcript icon, if transcript is not available for the meeting
              meeting.isTranscriptDisabled = false;
              console.log('transcript found for the meeting')

              //store the count of transcripts available for the meeting
              this.transcriptsCount = meeting.meetingTranscripts.length;

              //iterate through transcripts of the meeting and merge it into a single transcript
              meeting.meetingTranscripts.forEach(transcript => {
                //split the transcript data properly to display to the user 
                //get all transcripts of the meeting and display it as single transcript
                meeting.transcriptData = transcript.transcriptContent.split('\n');
                console.log(meeting.transcriptData)
              })
            } else {
              //disable the transcript icon, if transcript is not available for the meeting
              meeting.isTranscriptDisabled = true;
            }
          });
        }
      )
    } else {
      document.getElementById("attendedMeeting").style.borderBottom = '2px solid white';
      document.getElementById("attendedMeeting").style.paddingBottom = '2px';
      document.getElementById("attendedMeeting").style.width = 'fit-content';
      document.getElementById("organizedMeeting").style.borderBottom = 'none';
      //get user attended meetings
      this.meetingsService.getUserAttendedMeetingsByUserId((localStorage.getItem('email'))).subscribe(
        (response) => {
          //extract the meetings from response object
          this.attendedMeetings = response.body;
          this.attendedMeetingCount = response.body.length
          localStorage.setItem('attendedMeetingCount', this.attendedMeetingCount.toString());
          console.log(this.attendedMeetings);
        }
      )
    }
  }

  /**
   * 
   * @param transcriptData 
   * @returns 
   */
  generateDownloadLink(transcriptData: string[]): string {
    let url = '';

    if (transcriptData != null) {
      // Join the transcriptData into a single string
      const data = transcriptData.join('\n');

      // Add the transcript data into a blob storage with the specified fileName
      const blob = new Blob([data], { type: 'text/plain'});

      // Create and return the URL to the browser with the blob containing transcript data
      url = window.URL.createObjectURL(blob);
    }
    return url;
  }


  //check the action item checkboxes are checked or not and delete them if checked, delete only of the particular event
  /**
   * 
   * @param meetingId 
   */
  checkCheckboxes(meetingId: number) {
    console.log(meetingId)
    var table = document.getElementById("myTable" + meetingId)
    console.log(table)
    //for(var i=0; i<tables.length; i++){
    var rows = table.getElementsByTagName("tr");
    var value: number[];
    // Loop through each row
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];

      var checkbox = row.querySelector("input[type='checkbox']") as HTMLInputElement;
      console.log(checkbox)
      // Check if the checkbox exists in the row
      if (checkbox) {
        console.log("value of checkbox is " + checkbox.value);
        // Check the 'checked' property to get the state (true or false)
        if (checkbox.checked) {
          this.actionItemsToBeDeleted.push(checkbox.value)
        }
      }
    }
    console.log(" action item's to be deleted are " + this.actionItemsToBeDeleted)
    this.deleteActionItems(this.actionItemsToBeDeleted, meetingId);
  }

  //deletes the list of action items that are checked on the UI, of the particular meeting
  /**
   * 
   * @param actionItemIds 
   * @param meetingId 
   */
  deleteActionItems(actionItemIds: any[], meetingId: number) {
    if(actionItemIds.length < 1 ){
      this.toastr.error('No action items selected to delete');
      return;
    }
    console.log('deleteActionItems()')
    //subscribe to the response
    this.meetingsService.deleteActionItemsOfMeeting(actionItemIds, meetingId).subscribe(
      (response) => {
        this.isMetingActionItemsDeleted = response.body;
        console.log(this.isMetingActionItemsDeleted);
        if (this.isMetingActionItemsDeleted) {
          this.toastr.success('Action Items are deleted')
        } else {
          this.toastr.error('Action items were not deleted, try again')
        }
      }
    )
    //need to change this later
    window.location.reload();
  }


  //count: number= 0;
  /**
   * 
   * @param eventId 
   * @param index 
   */
  toggleSubmitAndDeleteButtons(meetingId: number, index: number) {
    var count = 0;
    var table = document.getElementById("myTable" + meetingId)
    //for(var i=0; i<tables.length; i++){
    var rows = table.getElementsByTagName("tr");
    var value: number[];
    // Loop through each row
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var checkbox = row.querySelector("input[type='checkbox']") as HTMLInputElement;
     
      let value;
      if(checkbox){
        value = checkbox.checked
      }

        if(value === true){
        console.log(checkbox)
        console.log(value)
        count = count+1;
        console.log(count);
        
          var buttons = document.getElementById('submitAndDelete' + meetingId);
          buttons.style.display = 'table-cell'
          var emptyCell = document.getElementById('emptycell' + meetingId);
          emptyCell.style.display = 'none'
         
        }else {
          if(count < 1){
            var buttons = document.getElementById('submitAndDelete' + meetingId);
          buttons.style.display = 'none'
          var emptyCell = document.getElementById('emptycell' + meetingId);
          emptyCell.style.display = 'table-cell'
          }
      }
    }
  }

  //edit action items data
  actionItems_new: ActionItems;

  /**
   * 
   * @param id 
   */
  editActionItem(id: number) {
    this.actionItemService.getActionItemById(id).subscribe(response => {
      this.actionItems_new = response.body;
      console.log(this.actionItems_new);
      this.updatedetails.actionItemId = this.actionItems_new.actionItemId;
      this.updatedetails.actionItemDescription = this.actionItems_new.actionItemDescription;
      this.updatedetails.meetingId = this.actionItems_new.meetingId;
      this.updatedetails.actionStatus = this.actionItems_new.actionStatus;
      console.log(this.actionItems_new.actionItemDescription);
      this.updatedetails.actionItemTitle = this.actionItems_new.actionItemTitle;
      this.updatedetails.actionPriority = this.actionItems_new.actionPriority;
      this.updatedetails.actionItemOwner = this.actionItems_new.actionItemOwner;
      this.updatedetails.startDate = this.actionItems_new.startDate;
      this.updatedetails.endDate = this.actionItems_new.endDate;

    });
    console.log("data fetching");
  }

  meetingData: Meeting

  /**
   * 
   * @param meetingId 
   */
  convertActionItemToTask(meeting: Meeting) {
    console.log(meeting.meetingId)
    //this.meetingData = meeting;
    var table = document.getElementById("myTable" + meeting.meetingId)
    console.log(table)
    //for(var i=0; i<tables.length; i++){
    var rows = table.getElementsByTagName("tr");
    var value: number[];
    // Loop through each row
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];

      var checkbox = row.querySelector("input[type='checkbox']") as HTMLInputElement;
      console.log(checkbox)
      // Check if the checkbox exists in the row
      if (checkbox) {
        console.log("value of checkbox is " + checkbox.value);
        // Check the 'checked' property to get the state (true or false)
        if (checkbox.checked) {
          this.actionItemsToBeSubmittedIds.push(checkbox.value)
        }
      }
    }
    console.log(" action item's to be submitted are " + this.actionItemsToBeSubmittedIds)
    this.actionItemsOfMeeting.filter((action)=>{
     //if(action.status === 'NotConverted'){
      var acitems = this.actionItemsToBeSubmittedIds.forEach((acId)=>{
        console.log(acId+" to be submitted")
          if(acId == action.actionItemId){
            console.log(acId+" to be submitted")
            this.actionItemsToBeSubmitted.push(action);
          }
        })
     //}
    });
    console.log(this.actionItemsToBeSubmitted);
  this.meetingsService.convertActionitemsToTasks(this.actionItemsToBeSubmitted,meeting).subscribe(
    (response =>{
      console.log(response.body)
      this.toastr.success('Action items converted to task succesfully')
      setTimeout(()=>{
        window.location.reload();  
       },1000)
    })
  )
  }

  /**
   * 
   * @param meetingId 
   * @param subject 
   * @param transriptData 
   */
  displayTranscriptData(meetingId: number, meetingSubject: string, meetingTransriptData: string[]){
    this.transcriptMeetingId = meetingId;
    this.meetingSubject = meetingSubject;
    this.meetingTrasncriptData = meetingTransriptData;
    console.log(this.meetingSubject);
  }

  userEmailIdList: string[];
  /**
   * get the list of active users
   */
  getActiveUMSUsersEmailIdList(){
    //perform an AJAX call to get list of users
    var isActive:boolean = true;
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

  /**
   * 
   */
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

  /**
   * 
   * @returns 
   */
  validateUpdateActionTitle(){
    if(this.updatedetails.actionItemTitle === ''){
      this.updateActionItemTitleErrorInfo = 'Title is required';
      this.isUpdateActionItemTitleValid = false;
    }else if(this.updatedetails.actionItemTitle.length < 5){
      this.updateActionItemTitleErrorInfo = 'Title should be minimum of 5 chars';
      this.isUpdateActionItemTitleValid = false;
    }else if(this.updatedetails.actionItemTitle.length > 50){
      this.updateActionItemTitleErrorInfo = 'Title should not exceed 50 chars';
      this.isUpdateActionItemTitleValid = false;
    }else{
      this.updateActionItemTitleErrorInfo = '';
      this.isUpdateActionItemTitleValid = true;
    }
    return this.isUpdateActionItemTitleValid;
  }

  /**
   * 
   * @returns 
   */
  validateUpdateActionDescription(){
    if(this.updatedetails.actionItemDescription === ''){
      this.updateActionItemDescErrorInfo = 'Description is required';
      this.isUpdateActionItemDescValid = false;
    }else if(this.updatedetails.actionItemDescription.length < 10){
      this.updateActionItemDescErrorInfo = 'Description should be manimum of 10 chars';
      this.isUpdateActionItemDescValid = false;
    }else if(this.updatedetails.actionItemDescription.length>200){
      this.updateActionItemDescErrorInfo = 'Description should not exceed 200 chars';
      this.isUpdateActionItemDescValid = false;
    }else{
      this.updateActionItemDescErrorInfo = '';
      this.isUpdateActionItemDescValid = true;
    }
    return this.isUpdateActionItemDescValid;
  }

  /**
   * 
   * @returns 
   */
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
    console.log(this.actionItemStartDate);
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
     }else if(new Date(this.updatedetails.endDate) < new Date(this.updatedetails.startDate.toString())){
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
  updateModelClose:string;
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
    this.actionItemService.updateActionItem(this.updatedetails).subscribe(response => {
      this.data = response.body;
      console.log(this.data);
     //var modal = document.getElementById('myModal');
     //modal.setAttribute('data-dismiss','modal');
     document.getElementById('closeUpdateModal').click();
     this.toastr.success('Action item updated successfully');
     setTimeout(()=>{
      window.location.reload();  
     },1000)
    
    });
   
    //need to change this later
    //window.location.reload();
  }
}

/**
 * 
 * @param meetingId 
 * @param event 
 */
checkAllcheckBoxesOfCurrentMeeting(meetingId: number, event:any){
  var mainCheckBox = document.getElementById('actionItemMainCheck'+meetingId) as HTMLInputElement;
  if(mainCheckBox.checked){
    var table = document.getElementById("myTable" + meetingId)
    console.log(table)
    var rows = table.getElementsByTagName("tr");
    // Loop through each row
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var checkbox = row.querySelector("input[type='checkbox']") as HTMLInputElement;
      checkbox.click();
    }
    var buttons = document.getElementById('submitAndDelete' + meetingId);
    console.log('executed')
      buttons.style.display = 'table-cell'
      var emptyCell = document.getElementById('emptycell' + meetingId);
      emptyCell.style.display = 'none'
  }else{
    var buttons = document.getElementById('submitAndDelete' + meetingId);
          buttons.style.display = 'none'
          var emptyCell = document.getElementById('emptycell' + meetingId);
          emptyCell.style.display = 'table-cell'
  }
}

min:any = "";

/**
 * 
 */
pastDateTime(){
  var tdate:any = new Date();
  var date:any = tdate.getDate();
  if(date<10){
    date = "0" + date;
  }
  var month:any = tdate.getMonth()+1;
  if(month<10){
    month = "0" + month;
  }  
  var year:any = tdate.getFullYear();
  var hours:any = tdate.getHours();
  var minutes:any = tdate.getMinutes();
  this.min = year + "-" + month + "-" + date + "T" + hours + ":" + minutes;
  console.log(this.min);
}

onMaterialGroupChange(event) {
  console.log(event);
}

/**
 *  fetch the meeting
 * 
 */
fetchUserOrganizedMeetings(meeting : Meeting){
  this.meetingData = meeting;

}

/** send Mom Email */
emailListForsendingMOM : string[];
sendMOMEmail( actionItemList: ActionItems[], meeting : Meeting){
    console.log(meeting.meetingId);
    console.log(actionItemList);

}

}

