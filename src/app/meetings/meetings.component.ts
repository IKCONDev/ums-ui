import { Component, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
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

@Component({
  selector: 'app-meetings',
  templateUrl: './meetings.component.html',
  styleUrls: ['./meetings.component.css']
})
export class MeetingsComponent implements OnInit {

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
    actionStatus: 'NotConverted',
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

  constructor(private meetingsService: MeetingService, private actionItemService: ActionService,
    private router: Router, private toastr: ToastrService) {
    //this is jquery code that will slide the action items rows when show more action items link is clicked
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

  validateActionTitle(){
   // var actionItemTitle = event.target.value;
    if(this.addDetails.actionItemTitle === ''){
      this.actionItemTitleErrorInfo = "Action Item title is required";
      this.isActionItemTitleValid = false;
    }else if(this.addDetails.actionItemTitle.length < 5){
      this.actionItemTitleErrorInfo = 'Title should have a minimum of 5 chars';
      this.isActionItemTitleValid = false;
    }else if(this.addDetails.actionItemTitle.length > 500){
      this.actionItemTitleErrorInfo = 'Title must not exceed 500 chars';
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
  validateActionDescription(){
    //var actionItemDescription = event.target.value;
    if(this.addDetails.actionItemDescription === ''){
      this.actionItemDescriptionErrorInfo = "Description is required";
      this.isActionItemDescriptionValid = false;
    }else if(this.addDetails.actionItemDescription.length < 10){
      this.actionItemDescriptionErrorInfo = 'Description should have a minimum of 10 chars';
      this.isActionItemDescriptionValid = false;
    }else if(this.addDetails.actionItemDescription.length > 1000){
      this.actionItemDescriptionErrorInfo = 'Description must not exceed 1000 chars';
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

  commonErrorMessageInfo: string = '';


  saveActionItem(form: NgForm) {
   let isTitlevalid = false;
   let isDescriptionValid = false;
   let isPriorityValid = false;
  let isOwnervalid = false;
  let isEndDateValid = false;
  let isStartDateValid = false;
    if(!this.isActionItemTitleValid){
        var valid = this.validateActionTitle();
        isTitlevalid = valid;
    }
    if(!this.isActionItemDescriptionValid){
      var valid = this.validateActionDescription();
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
    if(isTitlevalid === true && isDescriptionValid === true
      && isPriorityValid === true && isOwnervalid && isStartDateValid
      && isEndDateValid) {
      console.log(this.addDetails);
    this.addDetails.meetingId = this.currentMeetingId;
    this.addDetails.emailId = localStorage.getItem('email');
    this.actionItemService.saveActionItem(this.addDetails).subscribe(response => {
      this.response = response.body;
      this.actions_details = response.body;
      console.log(this.response);
      if(response.status === HttpStatusCode.Ok){
        this.toastr.success('Action item added sucessfully !');
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
    console.log(tabOpened)
    localStorage.setItem('tabOpened', tabOpened);
    this.tabOpened = localStorage.getItem('tabOpened')
    console.log(localStorage.getItem('tabOpened'))

    if (tabOpened === 'OrganizedMeeting') {
      document.getElementById("organizedMeeting").style.textDecorationLine = 'underline';
      document.getElementById("attendedMeeting").style.textDecorationLine = 'none';
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
      document.getElementById("organizedMeeting").style.textDecorationLine = 'none';
      document.getElementById("attendedMeeting").style.textDecorationLine = 'underline';
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
  toggleSubmitAndDeleteButtons(eventId: number, index: number) {
    var table = document.getElementById("myTable" + eventId)
    //for(var i=0; i<tables.length; i++){
    var rows = table.getElementsByTagName("tr");
    var value: number[];
    // Loop through each row
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var checkbox = row.querySelector("input[type='checkbox']") as HTMLInputElement;
      if (checkbox) {
        let value = checkbox.checked
        console.log(checkbox)
        console.log(value)
        if (value) {
          var buttons = document.getElementById('submitAndDelete' + eventId);
          buttons.style.display = 'table-cell'
          var emptyCell = document.getElementById('emptycell' + eventId);
          emptyCell.style.display = 'none'
        } else {
          var buttons = document.getElementById('submitAndDelete' + eventId);
          buttons.style.display = 'none'
          var emptyCell = document.getElementById('emptycell' + eventId);
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

  //Update the  action item Details

  /**
   * 
   * @param meeting 
   */
  updateActionItem(meeting: any) {
    this.id = this.updatedetails.actionItemId;
    console.log(this.updatedetails.actionPriority);
    console.log(this.id);
    console.log(this.updatedetails);
    this.actionItemService.updateActionItem(this.updatedetails).subscribe(response => {
      this.data = response.body;

      console.log(this.data);
    });
    //need to change this later
    window.location.reload();
  }

  /**
   * convert ac to task
   */
 
  /**
   * 
   * @param meetingId 
   */
  convertActionItemToTask(meetingId: number) {
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
  this.meetingsService.convertActionitemsToTasks(this.actionItemsToBeSubmitted).subscribe(
    (response =>{
      console.log(response.body)
      this.toastr.success('Action items converted to task succesfully')
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

  /**
   * get the list of active users
   */
  userEmailIdList: string[];
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

}
