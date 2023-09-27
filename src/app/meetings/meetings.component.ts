import { Component, OnInit, Output } from '@angular/core';
import { MeetingService } from './service/meetings.service';
import { Meeting } from '../model/Meeting.model';
import { Attendee } from '../model/Attendee.model';
import { ActionItems } from '../model/actionitem.model';
import { ActionItemComponent } from '../action-item/action-item.component';
import { ActionService } from '../action-item/service/action.service';
import { NavigationEnd, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

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
  actionItemsOfEvent = [];

  currentEventId: number;

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
  }

  fetchActionItemsOfEvent(eventId: number) {
    this.currentEventId = eventId;
    console.log(eventId)
    //this.router.navigateByUrl('/meeting-actionitems/'+eventid);
    this.meetingsService.getActionItems().subscribe(
      (response => {
       // this.actionItemsOfEvent = response.body;
       this.actionItemsOfEvent = response.body;
        console.log(response.body)
      })
    )
  }

  //get organized meetings of the logged in user
  getMeetings(tabOpened: string) {
    console.log(tabOpened)
    localStorage.setItem('tabOpened', tabOpened);
    this.tabOpened = localStorage.getItem('tabOpened')
    console.log(localStorage.getItem('tabOpened'))

    if (tabOpened === 'OrganizedMeeting') {
      document.getElementById("organizedMeeting").style.textDecorationLine = 'underline';
      document.getElementById("attendedMeeting").style.textDecorationLine = 'none';
      //get user organized meetings
      this.meetingsService.fetchAllMeetingsByUserId(localStorage.getItem('email')).subscribe(
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
      this.meetingsService.getUserAttendedEvents((localStorage.getItem('email'))).subscribe(
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

  //download the transcript data option, if required
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

  // create actio item

  response: Object;
  actions_details: Object
  //save Action Item method
  saveDetails() {
    console.log(this.addDetails);
    console.log(this.currentEventId)
    this.addDetails.meetingId = this.currentEventId;
    this.addDetails.emailId = localStorage.getItem('email');
    this.actionItemService.saveActionItem(this.addDetails).subscribe(response => {
      this.response = response.body;
      this.actions_details = response.body;
      console.log(this.response);
    });
    this.fetchActionItemsOfEvent(this.currentEventId);
  }



  //check the action item checkboxes are checked or not and delete them if checked, delete only of the particular event
  actionItemsToBeDeleted = [];
  isEventActionItemsDeleted;
  checkCheckboxes(eventId: number) {
    console.log(eventId)
    var table = document.getElementById("myTable" + eventId)
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
    this.deleteActionItems(this.actionItemsToBeDeleted, eventId);
  }

  //deletes the list of action items that are checked on the UI, of the particular meeting
  deleteActionItems(actionItemIds: any[], eventId: number) {
    console.log('deleteActionItems()')
    //subscribe to the response
    this.meetingsService.deleteActionItemsOfEvent(actionItemIds, eventId).subscribe(
      (response) => {
        this.isEventActionItemsDeleted = response.body;
        console.log(this.isEventActionItemsDeleted);
        if (this.isEventActionItemsDeleted) {
          this.toastr.success('Action Items are deleted')
        } else {
          this.toastr.error('Action items were not deleted, try again')
        }
      }
    )
  }

  //count: number= 0;
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
  editData(id: number) {
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
      this.updatedetails.startDate = this.actionItems_new.startDate;
      this.updatedetails.endDate = this.actionItems_new.endDate;

    });
    console.log("data fetching");

  }

  //Update the  action item Details
  id: number;
  data: object = {};
  updateDetails(meeting: any) {
    this.id = this.updatedetails.actionItemId;
    console.log(this.updatedetails.actionPriority);
    console.log(this.id);
    console.log(this.updatedetails);
    this.actionItemService.updateActionItem(this.updatedetails).subscribe(response => {
      this.data = response.body;

      console.log(this.data);
    });
  }

  /**
   * convert ac to task
   */
  actionItemsToBeSubmittedIds = [];
  isEventActionItemsSubmitted;
  actionItemsToBeSubmitted = [];
 
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
    this.actionItemsOfEvent.filter((action)=>{
     //if(action.status === 'NotConverted'){
      var acitems = this.actionItemsToBeSubmittedIds.forEach((acId)=>{
        console.log(acId+" to be submitted")
          if(acId == action.meetingId){
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

  transcriptEventId: number;
  meetingTrasncriptData: string[];
  meetingSubject: string;
  displayTranscriptData(eventId: number, subject: string, transriptData: string[]){
    this.transcriptEventId = eventId;
    this.meetingSubject = subject;
    this.meetingTrasncriptData = transriptData;
    console.log(this.meetingSubject);
  }

}
