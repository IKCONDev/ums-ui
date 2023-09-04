import { Component, OnInit, Output } from '@angular/core';
import { MeetingService } from './service/meetings.service';
import { Meeting } from '../model/Meeting.model';
import * as fs from 'fs';

@Component({
  selector: 'app-meetings',
  templateUrl: './meetings.component.html',
  styleUrls: ['./meetings.component.css']
})
export class MeetingsComponent implements OnInit {


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

  constructor(private meetingsService: MeetingService) {
  }

  ngOnInit() {

    //this.getOrganizedMeetings();
    //this.getMeetings('OrganizedMeeting');
    this.tabOpened = localStorage.getItem('tabOpened')
    console.log(this.tabOpened)
    this.getMeetings(this.tabOpened);

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
      this.meetingsService.getUserEvents(localStorage.getItem('email')).subscribe(
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
            }else{
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
      this.meetingsService.getUserEvents(localStorage.getItem('email')).subscribe(
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
      const blob = new Blob([data], { type: 'text/plain' });
  
      // Create and return the URL to the browser with the blob containing transcript data
      url = window.URL.createObjectURL(blob);
    }

    return url;
  }
  
}
