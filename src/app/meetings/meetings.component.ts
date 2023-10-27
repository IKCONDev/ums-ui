
import { AfterViewInit, Component, OnDestroy, OnInit, Output } from '@angular/core';
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
import { count, max } from 'rxjs';
import { JsonPipe } from '@angular/common';
import { MOMObject } from '../model/momObject.model';


@Component({
  selector: 'app-meetings',
  templateUrl: './meetings.component.html',
  styleUrls: ['./meetings.component.css']
})
export class MeetingsComponent implements OnInit, OnDestroy, AfterViewInit {

  private table: any;

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
  actionItemEndDateErrorInfo: string = '';
  actionItemDescriptionErrorInfo: string = ''
  actionItemPriorityErrorInfo: string = ''
  actionItemStartDateErrorInfo: string = ''

  actionItemStartDate: String = ''

  //action item save Button property
  isActionItemSaveButtonDisabled = false;

  actionItemsToBeDeleted = [];
  isMetingActionItemsDeleted;

  addDetails = {
    actionItemId: 0,
    meetingId: 0,
    emailId: '',
    actionItemOwner: [],
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
    emailId: '',
    actionItemOwner: [],
    actionItemTitle: '',
    actionItemDescription: '',
    actionPriority: '',
    actionStatus: '',
    startDate: '',
    endDate: ''

  }

  /**
   * executes when the component loaded first time
   * @param meetingsService 
   * @param actionItemService 
   * @param router 
   * @param toastr 
   */
  constructor(private meetingsService: MeetingService, private actionItemService: ActionService,
    private router: Router, private toastr: ToastrService) {
    //this is jquery code that will slide the action items rows when show more action items link is clicked

  }

  /**
   * 
  */
  initializeActionItemsSlider() {
    $(function () {
      console.log('function one called');
      var previousRow;
      //  var targetrow=null;
      $('table').on('click', 'a.showmore', function () {
        console.log('function two called');
        // e.preventDefault();
        //select thec closest tr of where the showmore link is present, and thats where th action items should be displayed
        var targetrow = $(this).closest('tr').next('.detail');
        if (previousRow && previousRow[0] !== targetrow[0]) {
          previousRow.hide(500).find('div').slideUp('slow');
          $('.mainCheckBox').prop('checked',false)
        }
        else if (previousRow && previousRow[0] === targetrow[0]) {
          targetrow.hide(500).find('div').slideUp('slow');
          $('.mainCheckBox').prop('checked',false)
          previousRow = null;
          return;
        }
        targetrow.show(1000).find('div').slideDown('slow');
        previousRow = targetrow;
      });
    });
  }

  /**
   * executes when the component is initialized or loaded first time
   */
  ngOnInit(): void {
    //generate action items for user meetings automatically upon component initialization
    this.meetingsService.generateActionItemsByNlp(localStorage.getItem('email')).subscribe(
      (response => {
        console.log(response.body)
      })
    )
    //set default tab to OrganizedMeetings tab when application is opened
    localStorage.setItem('tabOpened','OrganizedMeeting');
    this.tabOpened = localStorage.getItem('tabOpened')
    console.log(this.tabOpened)
    this.getMeetings(this.tabOpened);

    //disable actionItem btn default
    this.isActionItemSaveButtonDisabled = true;
    this.pastDateTime();
  }

  /**
   * executes after the initialization of component
   */
  ngAfterViewInit(): void {
    console.log('executed - After View Init')
    $(document).ready(() => {
      this.table = $('#table').DataTable({
        paging: true,
        searching: true, // Enable search feature
        pageLength: 7,
        // Add other options here as needed
      });
    });
  }

  /**
   * executes after the un-initialization of component
   */
  ngOnDestroy(): void {
    if (this.table) {
      this.table.destroy();
    }
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
  validateActionTitle(): boolean {
    // var actionItemTitle = event.target.value;
    const regex = /^\S.*[a-zA-Z\s]*$/;
    if (this.addDetails.actionItemTitle === ''|| this.addDetails.actionItemTitle.trim()==="" || regex.exec(this.addDetails.actionItemTitle)===null) {
      this.actionItemTitleErrorInfo = "Title is required";
      this.isActionItemTitleValid = false;
    } else if (this.addDetails.actionItemTitle.length <= 5) {
      this.actionItemTitleErrorInfo = 'Title should have a minimum of 5 characters';
      this.isActionItemTitleValid = false;
    } else if (this.addDetails.actionItemTitle.length >= 50) {
      this.actionItemTitleErrorInfo = 'Title must not exceed 50 characters';
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
    const regex = /^\S.*[a-zA-Z\s]*$/;
    if (this.addDetails.actionItemDescription === '' || this.addDetails.actionItemDescription.trim()==="" || regex.exec(this.addDetails.actionItemDescription)===null) {
      this.actionItemDescriptionErrorInfo = "Description is required";
      this.isActionItemDescriptionValid = false;
    } else if (this.addDetails.actionItemDescription.length <= 10) {
      this.actionItemDescriptionErrorInfo = 'Description should have a minimum of 10 characters';
      this.isActionItemDescriptionValid = false;
    } else if (this.addDetails.actionItemDescription.length >= 250) {
      this.actionItemDescriptionErrorInfo = 'Description must not exceed 250 characters';
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

    //clear EmailList
    this.emailListForsendingMOM = [];

    //form.form.reset();

    //reset the add action item form
    this.addDetails.actionItemTitle = '';
    this.addDetails.actionItemDescription = '';
    this.addDetails.actionItemOwner = [];
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

    //clear add action item form Error messages
    this.actionItemTitleErrorInfo = '';
    this.actionItemDescriptionErrorInfo = '';
    this.actionItemOwnerErrorInfo = '';
    this.actionItemPriorityErrorInfo = '';
    this.actionItemStartDateErrorInfo = '';
    this.actionItemEndDateErrorInfo = '';

    //clear update action item form Error messages
    this.updateActionItemTitleErrorInfo = '';
    this.updateActionItemDescErrorInfo = '';
    this.updateActionItemOwnerErrorInfo = '';
    this.updateActionItemPriorityErrorInfo = '';
    this.updateActionItemStartDateErrorInfo = '';
    this.updateActionItemEndDateErrorInfo = '';

    //reset add action item form boolean properties
    this.isActionItemTitleValid = false;
    this.isActionItemDescriptionValid = false;
    this.isActionItemPriorityValid = false;
    this.isActionItemOwnerValid = false;
    this.isActionItemStartDateValid = false;
    this.isActionItemEndDateValid = false;

    //reset update action item form boolean properties
    this.isUpdateActionItemTitleValid = false;
    this.isUpdateActionItemDescValid = false;
    this.isUpdateActionItemPriorityValid = false;
    this.isUpdateActionItemOwnerValid = false;
    this.isUpdateActionItemStartDateValid = false;
    this.isUpdateActionItemEndDateValid = false;

    //reset the create meeting form
    this.addMeeting.subject = '';
    this.addMeeting.startDateTime = '';
    this.addMeeting.endDateTime = '';
    this.addMeeting.attendees = [];

    //reset the create meeting form boolean properties
    this.isMeetingSubjectValid = false;
    this.isMeetingStartDateValid = false;
    this.isMeetingEndDateValid = false;
    this.isMeetingAttendeesValid = false;

    //reset the create meeting error messages
    this.meetingSubjectErrorInfo = '';
    this.meetingStartDateErrorInfo ='';
    this.meetingEndDateErrorInfo = '';
    this.meetingAttendeesErrorInfo = '';
  }

  /**
   * 
   * @param event 
   */
  validateActionStartDate() {
    //var actionItemStartDate = event.target.value;
    console.log(this.actionItemStartDate);
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

  /**
   * 
   * @returns 
   */
  validateActionItemOwner() {
    console.log(this.addDetails.actionItemOwner)
    //var actionItemOwner = event.target.value;
    if (this.addDetails.actionItemOwner === null) {
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
      this.addDetails.meetingId = this.currentMeetingId;
      this.addDetails.emailId = localStorage.getItem('email');
      this.actionItemService.saveActionItem(this.addDetails).subscribe({
        next: (response) => {
        this.response = response.body;
        this.actions_details = response.body;
        console.log(this.response);
        if (response.status === HttpStatusCode.Ok) {
          this.toastr.success('Action item added sucessfully !');
          document.getElementById('closeAddModal').click();
          setTimeout(() => {
            window.location.reload();
          }, 1000)
        }
      },
      error: (error)=>{
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl("/session-timeout")
        }
      }//error
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
    this.meetingsService.getActionItems().subscribe({
      next: (response => {
        // this.actionItemsOfEvent = response.body;
        this.actionItemsOfMeeting = response.body;
      }),
      error: (error)=>{
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl("/session-timeout")
        }
      }//error
  })
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
      this.meetingsService.getUserOraganizedMeetingsByUserId(localStorage.getItem('email')).subscribe({
        next: (response) =>{
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
        },//next
        error: (error) =>{
          if(error.status === HttpStatusCode.Unauthorized){
            this.router.navigateByUrl("/session-timeout")
          }
        }//error
      })//subscribe
    } else {
      document.getElementById("attendedMeeting").style.borderBottom = '2px solid white';
      document.getElementById("attendedMeeting").style.paddingBottom = '2px';
      document.getElementById("attendedMeeting").style.width = 'fit-content';
      document.getElementById("organizedMeeting").style.borderBottom = 'none';
      //get user attended meetings
      this.meetingsService.getUserAttendedMeetingsByUserId((localStorage.getItem('email'))).subscribe({
        next:(response) => {
          //extract the meetings from response object
          this.attendedMeetings = response.body;
          this.attendedMeetingCount = response.body.length
          localStorage.setItem('attendedMeetingCount', this.attendedMeetingCount.toString());
          console.log(this.attendedMeetings);
        },//next
        error: (error)=>{
          if(error.status === HttpStatusCode.Unauthorized){
            this.router.navigateByUrl("/session-timeout")
          }
        }//error
    })//subscribe
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
      const blob = new Blob([data], { type: 'text/plain' });

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
    if (actionItemIds.length < 1) {
      this.toastr.error('No action items selected to delete');
      return;
    }
    console.log('deleteActionItems()')
    //subscribe to the response
    this.meetingsService.deleteActionItemsOfMeeting(actionItemIds, meetingId).subscribe({
      next: (response) => {
        this.isMetingActionItemsDeleted = response.body;
        console.log(this.isMetingActionItemsDeleted);
        if (this.isMetingActionItemsDeleted) {
          this.toastr.success('Action items are deleted')
          setTimeout(() => {
            window.location.reload();
          }, 1000)
        } else {
          this.toastr.error('Action items were not deleted, try again')
        }
      },error: (error)=>{
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl("/session-timeout")
        }
      }//error
  })
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
      if (checkbox) {
        value = checkbox.checked
      }

      if (value === true) {
        console.log(checkbox)
        console.log(value)
        count = count + 1;
        console.log(count);

        var buttons = document.getElementById('submitAndDelete' + meetingId);
        buttons.style.display = 'table-cell'
        var emptyCell = document.getElementById('emptycell' + meetingId);
        emptyCell.style.display = 'none'

      } else {
        if (count < 1) {
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
    this.actionItemService.getActionItemById(id).subscribe({
      next:(response) => {
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

    },error: (error)=>{
      if(error.status === HttpStatusCode.Unauthorized){
        this.router.navigateByUrl("/session-timeout")
      }
    }//error
  });
    console.log("data fetching");
  }

  meetingData: Meeting

  /**
   * 
   * @param meetingId 
   */
  disableSubmit: Boolean = false;
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
      if (checkbox && checkbox != checkbox[1]) {
        console.log("value of checkbox is " + checkbox.value);
        // Check the 'checked' property to get the state (true or false)
        if (checkbox.checked) {
          this.actionItemsToBeSubmittedIds.push(checkbox.value)
          this.disableSubmit = true;
        }
      }
    }
    console.log(" action item's to be submitted are " + this.actionItemsToBeSubmittedIds)
    this.actionItemsOfMeeting.filter((action) => {
      //if(action.status === 'NotConverted'){
      var acitems = this.actionItemsToBeSubmittedIds.forEach((acId) => {
        console.log(acId + " to be submitted")
        if (acId == action.actionItemId) {
          console.log(acId + " to be submitted")
          this.actionItemsToBeSubmitted.push(action);
        }
      })
      //}
    });
    console.log(this.actionItemsToBeSubmitted);

    this.meetingsService.convertActionitemsToTasks(this.actionItemsToBeSubmitted, meeting).subscribe({
      next:(response) => {
        console.log(response.body)
        this.toastr.success('Action items converted to task successfully')
        setTimeout(() => {
          window.location.reload();
        }, 1000)
      },error: (error)=>{
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl("/session-timeout")
        }
      }//error
    })
  }

  /**
   * 
   * @param meetingId 
   * @param subject 
   * @param transriptData 
   */
  displayTranscriptData(meetingId: number, meetingSubject: string, meetingTransriptData: string[]) {
    this.transcriptMeetingId = meetingId;
    this.meetingSubject = meetingSubject;
    this.meetingTrasncriptData = meetingTransriptData;
    console.log(this.meetingSubject);
  }

  userEmailIdList: string[];
  /**
   * get the list of active users
   */
  getActiveUMSUsersEmailIdList() {
    //perform an AJAX call to get list of users
    var isActive: boolean = true;
    // $.ajax({url:"http://localhost:8012/users/getEmail-list/", success: function(result){
    //   this.userEmailIdList = result;
    //   console.log(result);
    //   console.log(this.userEmailIdList[0]);
    // }});
    this.meetingsService.getActiveUserEmailIdList().subscribe({
      next:(response) => {
        this.userEmailIdList = response.body;
        console.log(response.body);
        console.log(this.userEmailIdList);
      },error: (error)=>{
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl("/session-timeout")
        }
      }//error
    })
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
  validateUpdateActionTitle() {
    const regex = /^\S.*[a-zA-Z\s]*$/;
    if (this.updatedetails.actionItemTitle === '' || this.updatedetails.actionItemTitle.trim()==="" || regex.exec(this.updatedetails.actionItemTitle)===null) {
      this.updateActionItemTitleErrorInfo = 'Title is required';
      this.isUpdateActionItemTitleValid = false;
    } else if (this.updatedetails.actionItemTitle.length <= 5) {
      this.updateActionItemTitleErrorInfo = 'Title should have minimum of 5 characters';
      this.isUpdateActionItemTitleValid = false;
    } else if (this.updatedetails.actionItemTitle.length >= 50) {
      this.updateActionItemTitleErrorInfo = 'Title must not exceed 50 characters';
      this.isUpdateActionItemTitleValid = false;
    } else {
      this.updateActionItemTitleErrorInfo = '';
      this.isUpdateActionItemTitleValid = true;
    }
    return this.isUpdateActionItemTitleValid;
  }

  /**
   * 
   * @returns 
   */
  validateUpdateActionDescription() {
    const regex = /^\S.*[a-zA-Z\s]*$/;
    if (this.updatedetails.actionItemDescription === '' || this.updatedetails.actionItemDescription.trim()==="" ||  regex.exec(this.updatedetails.actionItemDescription)===null) {
      this.updateActionItemDescErrorInfo = 'Description is required';
      this.isUpdateActionItemDescValid = false;
    } else if (this.updatedetails.actionItemDescription.length <= 10) {
      this.updateActionItemDescErrorInfo = 'Description should have minimum of 10 characters';
      this.isUpdateActionItemDescValid = false;
    } else if (this.updatedetails.actionItemDescription.length >= 250) {
      this.updateActionItemDescErrorInfo = 'Description must not exceed 250 characters';
      this.isUpdateActionItemDescValid = false;
    } else {
      this.updateActionItemDescErrorInfo = '';
      this.isUpdateActionItemDescValid = true;
    }
    return this.isUpdateActionItemDescValid;
  }

  /**
   * 
   * @returns 
   */
  validateUpdateActionPriority() {
    //var actionItemPriority = event.target.value;
    if (this.updatedetails.actionPriority === '') {
      this.updateActionItemPriorityErrorInfo = "Priority is required";
      this.isUpdateActionItemPriorityValid = false;
    } else if (this.updatedetails.actionPriority === 'select') {
      this.updateActionItemPriorityErrorInfo = "Priority is required";
      this.isUpdateActionItemPriorityValid = false;
    } else {
      this.updateActionItemPriorityErrorInfo = '';
      this.isUpdateActionItemPriorityValid = true;
    }
    return this.isUpdateActionItemPriorityValid;
  }

  /**
   * 
   * @returns 
   */
  validateUpdateActionItemOwner() {
    //var actionItemOwner = event.target.value;
    if (this.updatedetails.actionItemOwner === null) {
      this.updateActionItemOwnerErrorInfo = 'Owner is required';
      this.isUpdateActionItemOwnerValid = false;
    } else {
      this.updateActionItemOwnerErrorInfo = '';
      this.isUpdateActionItemOwnerValid = true;
    }
    return this.isUpdateActionItemOwnerValid;
  }

  /**
   * 
   * @returns 
   */
  validateUpdateActionStartDate() {
    //var actionItemStartDate = event.target.value;
    console.log(this.actionItemStartDate);
    if (this.updatedetails.startDate === '') {
      this.updateActionItemStartDateErrorInfo = 'Start Date cannot be blank'
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
   * 
   * @returns 
   */
  validateUpdateActionEndDate() {
    // var actionItemEndDate = event.target.value;
    //console.log(actionItemEndDate);
    if (this.updatedetails.endDate === '') {
      this.updateActionItemEndDateErrorInfo = 'End Date cannot be blank'
      this.isUpdateActionItemEndDateValid = false;
    } else if (new Date(this.updatedetails.endDate) < new Date(this.updatedetails.startDate.toString())) {
      this.updateActionItemEndDateErrorInfo = 'End date cannot be less than start date.'
      this.isUpdateActionItemEndDateValid = false;
    } else {
      this.updateActionItemEndDateErrorInfo = '';
      this.isUpdateActionItemEndDateValid = true;
    }
    return this.isUpdateActionItemEndDateValid;
  }

  /**
 * 
 * @param meeting 
 */
  updateModelClose: string;
  updateActionItem(form: NgForm) {
    let isTitlevalid = true;
    let isDescriptionValid = true;
    let isPriorityValid = true;
    let isOwnervalid = true;
    let isEndDateValid = true;
    let isStartDateValid = true;
    if (this.isUpdateActionItemTitleValid === false) {
      var valid = this.validateUpdateActionTitle();
      console.log(valid)
      isTitlevalid = valid;
    }
    if (this.isUpdateActionItemDescValid === false) {
      var valid = this.validateUpdateActionDescription();
      console.log(valid)
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
    console.log(isTitlevalid + '' + isDescriptionValid + '' + isEndDateValid + '' + isStartDateValid + '' + isPriorityValid + '' + isOwnervalid)
    if (isTitlevalid === true && isDescriptionValid === true
      && isPriorityValid === true && isOwnervalid == true && isStartDateValid === true
      && isEndDateValid === true) {
      this.id = this.updatedetails.actionItemId;
      console.log(this.updatedetails);
      this.actionItemService.updateActionItem(this.updatedetails).subscribe({
        next:(response) => {
        this.data = response.body;
        console.log(this.data);
        //var modal = document.getElementById('myModal');
        //modal.setAttribute('data-dismiss','modal');
        document.getElementById('closeUpdateModal').click();
        this.toastr.success('Action item updated successfully');
        setTimeout(() => {
          window.location.reload();
        }, 1000)
      },error: (error)=>{
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl("/session-timeout")
        }
      }//error
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
  checkAllcheckBoxesOfCurrentMeeting(meetingId: number, event: any) {
    //var mainChekckBox = event.checked;
    var mainCheckBox = document.getElementById('actionItemMainCheck' + meetingId) as HTMLInputElement;
    if (mainCheckBox.checked === true) {
      console.log(mainCheckBox.checked + " in if")
      var table = document.getElementById("myTable" + meetingId)
      console.log(table)
      var rows = table.getElementsByTagName("tr");
      // Loop through each row
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var checkbox = row.querySelector("input[type='checkbox']") as HTMLInputElement;
        if (!checkbox.checked) {
          checkbox.click();
        }
      }

      var buttons = document.getElementById('submitAndDelete' + meetingId);
      console.log('executed')
      buttons.style.display = 'table-cell'
      var emptyCell = document.getElementById('emptycell' + meetingId);
      emptyCell.style.display = 'none'
    } else {

      console.log(mainCheckBox.checked + " in else")
      var table = document.getElementById("myTable" + meetingId)
      console.log(table)
      var rows = table.getElementsByTagName("tr");
      if (mainCheckBox.checked === false) {
        console.log("entering the if method")
        console.log("te length of the row " + rows.length)
        for (var j = 0; j < rows.length; j++) {
          console.log('in for loop ' + j)
          var row = rows[j];
          var checkbox = row.querySelector("input[type='checkbox']") as HTMLInputElement;
          if (checkbox.checked) {
            checkbox.click();
          }
        }

      }
      var buttons = document.getElementById('submitAndDelete' + meetingId);
      buttons.style.display = 'none'
      var emptyCell = document.getElementById('emptycell' + meetingId);
      emptyCell.style.display = 'table-cell'
    }
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

  onMaterialGroupChange(event) {
    console.log(event);
  }

  /**
   *  fetch the meeting
   * 
   */
  meetingToCompare: Meeting;
  fetchUserOrganizedMeetings(meeting: any) {

    /*this.meetingsService.getMeetingObject(meeting.meetingId).subscribe(
         response =>{
           console.log(response.body);
            this.meetingToCompare= response.body;
           
            console.log("meeting object:"+ this.meetingToCompare);
   
         }
     )*/
    this.meetingData = meeting;
    console.log(this.meetingData);
  }
 

/** send Mom Email */
emailListForsendingMOM : string[];
SendActionItemList = new Array() ;
momObject : MOMObject;
resultData : boolean;
sendMOMEmail(){

  for(var i=0; i<this.actionItemsOfMeeting.length; i++){

     if(this.meetingData.meetingId == this.actionItemsOfMeeting[i].meetingId){
         this.SendActionItemList.push(this.actionItemsOfMeeting[i]);
         //console.log("loop executed successfully"+i);
     }
  }
  console.log(this.SendActionItemList);
  console.log("entered sendmom email method");
    this.meetingsService.sendMinutesofMeeting(this.emailListForsendingMOM,this.meetingData).subscribe({
     next: (response) =>{
     if(response.status == HttpStatusCode.Ok){
        this.toastr.success("Email sent successfully");
        document.getElementById('closeSendMoMEmail').click();
      }
      else{
         this.toastr.error("Error occured while sending email, please try again");
      }
    },error: (error)=>{
      if(error.status === HttpStatusCode.Unauthorized){
        this.router.navigateByUrl("/session-timeout")
      }
    }//error
  })
  }

  addMeeting = {
    meetingId: 0,
    subject: '',
    organizerName: localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName'),
    organizerEmailId: localStorage.getItem('email'),
    startDateTime: '',
    endDateTime: '',
    attendees: [],
    //actionItems: 
    emailId: localStorage.getItem('email'),
    attendeeCount: 0,
    createdBy: localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName'),
    createByEmailId: localStorage.getItem('email'),
    //meetingTranscripts: [],
    //transcriptData:[],
    //isTranscriptDisabled: boolean;
  }

  createdMeeting: Meeting;
  /**
   * 
   */
  createMeeting(from: NgForm) {

    var isSubjectvalid = true;
    var isStartDateValid = true;
    var isEndDateValid = true;
    var isAttendeesValid = true;

    if(this.isMeetingSubjectValid === false){
      var valid = this.validateMeetingSubject();
      isSubjectvalid = valid;
    }
    if(this.isMeetingStartDateValid === false){
      var valid = this.validateMeetingStartDateTime();
      isStartDateValid = valid;
    }
    if(this.isMeetingEndDateValid === false){
      var valid = this.validateMeetingEndDateTime();
      isEndDateValid = valid;
    }
    if(this.isMeetingAttendeesValid === false){
      var valid = this.validateMeetingAttendees();
      isAttendeesValid = valid;
    }

    if(isSubjectvalid && isStartDateValid && isEndDateValid && isAttendeesValid){
      //create meeting
    console.log(this.addMeeting)
    this.meetingsService.createMeeting(this.addMeeting).subscribe({
      next: (response) => {
        if (response.status === HttpStatusCode.Created) {
          //get the created meeting
          this.createdMeeting = response.body;
          console.log(response.body);
          this.toastr.success('Meeting created successfully');
          document.getElementById('closeCreateMeetingModal').click();
          setTimeout(()=>{
            window.location.reload();
          },1000);
        } else {
          this.toastr.error('Error while creating meeting. Please try again !');
        }
      },error: (error)=>{
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl("/session-timeout")
        }
      }//error
    })
    }
  }

  meetingSubjectErrorInfo = '';
  isMeetingSubjectValid = false;
  validateMeetingSubject() {
    const regex = /^\S.*[a-zA-Z\s]*$/;
    if (this.addMeeting.subject === '' || this.addMeeting.subject.trim()==="" || regex.exec(this.addMeeting.subject)===null) {
      this.meetingSubjectErrorInfo = 'Meeting subject is required';
      this.isMeetingSubjectValid = false;
    } else if (this.addMeeting.subject.length < 4) {
      this.meetingSubjectErrorInfo = 'Meeting subject should have minimum of 4 chars';
      this.isMeetingSubjectValid = false;
    } else if (this.addMeeting.subject.length > 100) {
      this.meetingSubjectErrorInfo = 'Meeting subject should not exceed maximum of 100 chars';
      this.isMeetingSubjectValid = false;
    } else {
      this.isMeetingSubjectValid = true;
      this.meetingSubjectErrorInfo = '';
    }
    return this.isMeetingSubjectValid;
  }

  meetingStartDateErrorInfo = '';
  isMeetingStartDateValid = false;
  validateMeetingStartDateTime() {
    if (this.addMeeting.startDateTime === '') {
      this.meetingStartDateErrorInfo = 'Start date time is required';
      this.isMeetingStartDateValid = false;
    } else if (this.addMeeting.startDateTime === null) {
      this.meetingStartDateErrorInfo = 'Start date time is required';
      this.isMeetingStartDateValid = false;
    } else if (new Date(this.addMeeting.startDateTime) < new Date(Date.now())) {
      this.meetingStartDateErrorInfo = 'Start date time cannot be a previous date';
      this.isMeetingStartDateValid = false;
    } else {
      this.meetingStartDateErrorInfo = '';
      this.isMeetingStartDateValid = true;
    }
    return this.isMeetingStartDateValid;
  }

  meetingEndDateErrorInfo = '';
  isMeetingEndDateValid = false;
  validateMeetingEndDateTime() {
    if (this.addMeeting.endDateTime === '') {
      this.meetingEndDateErrorInfo = 'End date time is required';
      this.isMeetingEndDateValid = false;
    } else if (this.addMeeting.endDateTime === null) {
      this.meetingEndDateErrorInfo = 'End date time is required';
      this.isMeetingEndDateValid = false;
    } else if (new Date(this.addMeeting.endDateTime) < new Date(this.addMeeting.startDateTime)) {
      this.meetingEndDateErrorInfo = 'End date time cannot be less than start date time';
      this.isMeetingEndDateValid = false;
    } else {
      this.meetingEndDateErrorInfo = '';
      this.isMeetingEndDateValid = true;
    }
    return this.isMeetingEndDateValid;
  }

  meetingAttendeesErrorInfo = '';
  isMeetingAttendeesValid = false;
  validateMeetingAttendees() {
    if (this.addMeeting.attendees.length === 0) {
      this.meetingAttendeesErrorInfo = 'Meetings attendees are required';
      this.isMeetingAttendeesValid = false;
    } else {
      this.meetingAttendeesErrorInfo = '';
      this.isMeetingAttendeesValid = true;
    }
    return this.isMeetingAttendeesValid;
  }

  /**
   * 
   * @param index 
   */
   toggleMainCheckbox(index: number){
    if(!$('#ac-check'+index).is(':checked')){
      $('.mainCheckBox').prop('checked',false)
    }
   }
   //Duration of meeting
   hoursDiff : any
   minutesDiff  : any
   getDuration(meeting : Meeting){
     var startdate =  new Date(meeting.startDateTime);
     var endDate = new Date(meeting.endDateTime);
     this.hoursDiff = (endDate.getHours()-startdate.getHours());
     this.minutesDiff = (endDate.getMinutes()-startdate.getMinutes());


   }
}

