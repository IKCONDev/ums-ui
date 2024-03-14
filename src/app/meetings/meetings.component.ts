
import { AfterViewChecked, AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { MeetingService } from './service/meetings.service';
import { Meeting } from '../model/Meeting.model';
import { Attendee } from '../model/Attendee.model';
import { ActionItems } from '../model/Actionitem.model';
import { ActionItemComponent } from '../action-item/action-item.component';
import { ActionService } from '../action-item/service/action.service';
import { NavigationEnd, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpStatusCode } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { Users } from '../model/Users.model';
import { count, lastValueFrom, max } from 'rxjs';
import { DatePipe, JsonPipe } from '@angular/common';
import { MOMObject } from '../model/momObject.model';
import { EmployeeService } from '../employee/service/employee.service';
import { Employee } from '../model/Employee.model';
import { HeaderService } from '../header/service/header.service';
import { MenuItem } from '../model/MenuItem.model';
import { AppMenuItemService } from '../app-menu-item/service/app-menu-item.service';


@Component({
  selector: 'app-meetings',
  templateUrl: './meetings.component.html',
  styleUrls: ['./meetings.component.css']
})
export class MeetingsComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChildren("itemElement") private itemElements: QueryList<ElementRef>;
  private table: any;

  eventId: number;
  meetingType : string = "Single Instance";
  meetingTypeOccurence : string = "Recurrence";
  meetingTypeNormal : string = "Manual";
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
  colon:string="  :"
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

  loggedInUser: string = localStorage.getItem('email');
  loggedInUserRole: string = localStorage.getItem('userRole')
  reporteeList: Employee[];
  reporteeCount: number = 0;
  selectedReporteeOrganizedMeeting: string = localStorage.getItem('selectedReporteeOrganizedMeeting');
  selectedReporteeAssignedMeeting: string = localStorage.getItem('selectedReporteeAssignedMeeting');

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
    actionStatus: 'Not Submitted',
    startDate: '',
    endDate: '',
    departmentId: 0

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
    endDate: '',
    departmentId: 0
  }

  organizedMeetingTitleFilter: string = localStorage.getItem('organizedMeetingTitleFilter');
  organizedMeetingOganizerFilter: string = localStorage.getItem('organizedMeetingOganizerFilter');
  organizedMeetingStartDateFilter: string = localStorage.getItem('organizedMeetingStartDateFilter');
  organizedMeetingEndDateFilter: string = localStorage.getItem('organizedMeetingEndDateFilter');

  attendedMeetingTitleFilter: string = localStorage.getItem('attendedMeetingTitleFilter');
  attendedMeetingOganizerFilter: string = localStorage.getItem('attendedMeetingOganizerFilter');
  attendedMeetingStartDateFilter: string = localStorage.getItem('attendedMeetingStartDateFilter');
  attendedMeetingEndDateFilter: string = localStorage.getItem('attendedMeetingEndDateFilter');

  isComponentLoading: boolean = false;
  displayText: boolean = false;
  isOrganizedMeetingDataText: boolean = false;
  isAttendedMeetingDataText: boolean = false;
  createButtonDisabled=false;
  isSendButtonDisabled=false;
  /**
   * executes when the component loaded first time
   * @param meetingsService 
   * @param actionItemService 
   * @param router 
   * @param toastr 
   */
  constructor(private meetingsService: MeetingService, private actionItemService: ActionService,
    private router: Router, private toastr: ToastrService, private employeeService: EmployeeService,
    private headerService: HeaderService, private datePipe: DatePipe, private menuItemService: AppMenuItemService) {
      localStorage.setItem("AttendedMeetingReloadCount","0")
  }

  /**
   * 
   */
  // InitailizeJqueryDataTable() {
  //   if(this.table!=null){
  //     this.table.destroy();
  //   }
  //   setTimeout(() => {
  //     $(document).ready(() => {
  //       this.table = $('#assignedTable').DataTable({
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
  //   }, 2000)

    
  //   setTimeout(() => {
  //     $(document).ready(() => {
  //       this.table = $('#orgTable').DataTable({
  //         paging: true,
  //         stateSave:true,
  //         searching: true, // Enable search feature
  //         pageLength: 10,
  //         order: [[1, 'asc']],
  //         lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
  //         // Add other options here as needed
  //       });
  //     });
  //   }, 1000)
  // }

  /**
   * 
  */
  initializeActionItemsSlider() {
    $(function () {
      var previousRow;
      //  var targetrow=null;
      $('table').on('click', 'a.showmore', function () {
        // e.preventDefault();
        //select thec closest tr of where the showmore link is present, and thats where th action items should be displayed
        var targetrow = $(this).closest('tr').next('.detail');
        if (previousRow && previousRow[0] !== targetrow[0]) {
          previousRow.hide(500).find('div').slideUp('slow');
          $('.mainCheckBox').prop('checked', false)
        }
        else if (previousRow && previousRow[0] === targetrow[0]) {
          targetrow.hide(500).find('div').slideUp('slow');
          $('.mainCheckBox').prop('checked', false)
          previousRow = null;
          return;
        }
        targetrow.show(1000).find('div').slideDown('slow');
        previousRow = targetrow;
      });
    });
  }

  selectedReporteeName: string = '';
  selectedReporteeDepartment: number = 0;
  userRoleMenuItemsPermissionMap: Map<string, string>
  viewPermission: boolean;
  createPermission: boolean = false;
  updatePermission: boolean = false;
  deletePermission: boolean = false;
  noPermissions: boolean;
  updateButtonColor: string;

  /**
   * executes when the component is initialized or loaded first time
   */
  async ngOnInit(): Promise<void> {
    if (localStorage.getItem('jwtToken') === null) {
      this.router.navigateByUrl('/session-timeout');
    }
    if (localStorage.getItem('userRoleMenuItemPermissionMap') != null) {
      this.userRoleMenuItemsPermissionMap = new Map(Object.entries(JSON.parse(localStorage.getItem('userRoleMenuItemPermissionMap'))));
      var currentMenuItem = await this.getCurrentMenuItemDetails();
      if (this.userRoleMenuItemsPermissionMap.has(currentMenuItem.menuItemId.toString().trim())) {
        //this.noPermissions = false;
        //provide permission to access this component for the logged in user if view permission exists
        //get permissions of this component for the user
        var menuItemPermissions = this.userRoleMenuItemsPermissionMap.get(this.currentMenuItem.menuItemId.toString().trim());
        if (menuItemPermissions.includes('View')) {
          //this.isComponentLoading = false;
          this.viewPermission = true;
          //hit db and get all details
          this.getActiveUMSAttendeesEmailIdList();
          //get user data on switch reportee or user
          this.headerService.fetchUserProfile(this.selectedReporteeOrganizedMeeting != '' ? this.selectedReporteeOrganizedMeeting : this.loggedInUser).subscribe({
            next: response => {
              this.selectedReporteeName = response.body.employee.firstName + ' ' + response.body.employee.lastName;
              this.selectedReporteeDepartment = response.body.employee.department.departmentId;
              this.addMeeting.organizerName = this.selectedReporteeName;
              this.addMeeting.departmentId = this.selectedReporteeDepartment;
            }
          });
          /**
           * This featue is under implementation for future versions: please do not remove this commented code
           */
          //generate action items for user meetings automatically upon component initialization
          // this.meetingsService.generateActionItemsByNlp(localStorage.getItem('email')).subscribe(
          //   (response => {
          //    // console.log(response.body)
          //   })
          // )
          if (this.selectedReporteeOrganizedMeeting === '') {
            this.selectedReporteeOrganizedMeeting = localStorage.getItem('email');
          }
          if (this.selectedReporteeAssignedMeeting === '') {
            this.selectedReporteeAssignedMeeting = localStorage.getItem('email');
          }
          this.tabOpened = localStorage.getItem('tabOpened')
          this.getMeetings(this.tabOpened);
          //disable actionItem btn default
          this.isActionItemSaveButtonDisabled = true;
          // this.pastDateTime();
          //get reportees data of logged in user
          if (this.loggedInUserRole === 'ADMIN' || this.loggedInUserRole === 'SUPER_ADMIN') {
            this.getAllEmployees();
          } else {
            this.getEmployeeReportees();
          }
         
          this.enableOrDisableSendMOM();
        } else {
          this.viewPermission = false;
        }
        if (menuItemPermissions.includes('Create')) {
          this.createPermission = true;
        }
        if (menuItemPermissions.includes('Update')) {
          this.updatePermission = true;
          this.updateButtonColor = '#5590AA';
        } else {
          this.updateButtonColor = 'lightgrey';
        }
        if (menuItemPermissions.includes('Delete')) {
          this.deletePermission = true;
        }
      }else{
        this.router.navigateByUrl('/unauthorized');
      }
    }
  }

  /**
   * executes after the initialization of component
   */
  initalizeDataTable:boolean=false;
  ngAfterViewChecked(): void {
   this.initializeJqueryDataTable();
  }
  attendedMeetingReloadCount:number=0;
  initializeJqueryDataTable(){
    if(this.attendedMeetingDataLoaded&&!this.initalizeDataTable){
      if(this.table!=null){
        this.table.destroy();
      }
      
        this.table = $('#assignedTable').DataTable({
          paging: true,
          stateSave:true,
          searching: true, // Enable search feature
          pageLength: 10,
          order: [[0, 'asc']],
          lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
          // Add other options here as needed
          columnDefs:[{
            "targets":[4,5],
            "type":"date",
            "render": function (data, type, row) {
              // Create a new JavaScript Date object directly from the provided format
              const dateObj = new Date(data);
              //console.log(dateObj)
              // Format the date object for display using the desired format string
              const formattedDate = dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                minute:'2-digit',
                hour:'2-digit'
              });
      
              return formattedDate;
            }
          }]
        });
        this.initalizeDataTable=true;
      }
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
    if (this.addDetails.actionItemTitle === '' || this.addDetails.actionItemTitle.trim() === "" || regex.test(this.addDetails.actionItemTitle) === false) {
      if(this.addDetails.actionItemTitle.startsWith(" ")){
        this.actionItemTitleErrorInfo = "Title cannot start with space";
      }else
      this.actionItemTitleErrorInfo = "Title is required";
      this.isActionItemTitleValid = false;
    } else if (this.addDetails.actionItemTitle.length < 5) {
      this.actionItemTitleErrorInfo = 'Title should have a minimum of 5 characters';
      this.isActionItemTitleValid = false;
    } else if (this.addDetails.actionItemTitle.length > 50) {
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
    const regex = /^(?!\s)[\s\S]*$/;
    if (this.addDetails.actionItemDescription === '' || this.addDetails.actionItemDescription.trim() === "" || regex.test(this.addDetails.actionItemDescription) === false) {
      if(this.addDetails.actionItemDescription.startsWith(" ")){
        this.actionItemDescriptionErrorInfo ="Description cannot start with space";
      }else
      this.actionItemDescriptionErrorInfo = "Description is required";
      this.isActionItemDescriptionValid = false;
    } else if (this.addDetails.actionItemDescription.length < 10) {
      this.actionItemDescriptionErrorInfo = 'Description should have a minimum of 10 characters';
      this.isActionItemDescriptionValid = false;
    } else if (this.addDetails.actionItemDescription.length > 250) {
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
    this.meetingStartDateErrorInfo = '';
    this.meetingEndDateErrorInfo = '';
    this.meetingAttendeesErrorInfo = '';


    //reset the SendMOM 
    this.isemailforSendMoMEmailValid = false;
    this.emailListErrorInfo = '';
    this.discussionPoints = '';
    this.discussionPointErrorInfo = '';
  }

  /**
   * 
   * @param event 
   */
  validateActionStartDate() {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (this.addDetails.startDate === '') {
      this.actionItemStartDateErrorInfo = 'Start Date cannot be blank'
      this.isActionItemStartDateValid = false;
    }
    //else if (new Date(this.addDetails.startDate) < currentDate) {
    //   this.actionItemStartDateErrorInfo = 'Start date cannot be a previous date.'
    //   this.isActionItemStartDateValid = false;
    // } 
    else {
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
    //var actionItemOwner = event.target.value;
    if (this.addDetails.actionItemOwner === null || this.addDetails.actionItemOwner.length === 0) {
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
      this.addDetails.meetingId = this.currentMeetingId;
      this.addDetails.emailId = this.selectedReporteeOrganizedMeeting != null ? this.selectedReporteeOrganizedMeeting : this.loggedInUser;
      this.addDetails.departmentId = this.selectedReporteeDepartment;
      this.actionItemService.saveActionItem(this.addDetails).subscribe({
        next: (response) => {
          this.response = response.body;
          this.actions_details = response.body;
          if (response.status === HttpStatusCode.Ok) {
            this.toastr.success('Action item added sucessfully !');
            document.getElementById('closeAddModal').click();
            setTimeout(() => {
              window.location.reload();
            }, 1000)
          }
        },
        error: (error) => {
          if (error.status === HttpStatusCode.Unauthorized) {
            this.router.navigateByUrl("/session-timeout")
          }
        }//error
      });
      this.fetchActionItemsOfEvent(this.currentMeetingId);
    }
  }

  /**
   * 
   * @param meetingId 
   */
  fetchActionItemsOfEvent(meetingId: number) {
    this.currentMeetingId = meetingId;
    //this.router.navigateByUrl('/meeting-actionitems/'+eventid);
    this.meetingsService.getActionItems().subscribe({
      next: (response => {
        // this.actionItemsOfEvent = response.body;
        this.actionItemsOfMeeting = response.body;
      }),
      error: (error) => {
        if (error.status === HttpStatusCode.Unauthorized) {
          this.router.navigateByUrl("/session-timeout")
        }
      }//error
    })

  }

  /**
   * 
   * @param tabOpened 
   */
  numberCountPerPage:number=0;
  reloadPageCount:number;
  attendedMeetingDataLoaded:boolean=false
  StartDateTimestampUTC:string;
  endDateTimestampUTC:string;
  getMeetings(tabOpened: string) {
    this.isComponentLoading = true;
    this.displayText = true;
    this.isOrganizedMeetingDataText = true;
    this.isAttendedMeetingDataText = true;
    //re-initailze slider
    this.initializeActionItemsSlider();
    localStorage.setItem('tabOpened', tabOpened);
    this.tabOpened = localStorage.getItem('tabOpened')
    if (tabOpened === 'OrganizedMeeting') {
      //get user organized meetings
      if (this.selectedReporteeOrganizedMeeting != '') {
        if(this.organizedMeetingStartDateFilter!=''||this.organizedMeetingEndDateFilter!=''){
          if(localStorage.getItem('organizedMeetingStartDateFilter')!=''){
          this.StartDateTimestampUTC = this.datePipe.transform(localStorage.getItem('organizedMeetingStartDateFilter'), 'yyyy-MM-ddTHH:mm:ss', 'UTC');
         console.log(this.StartDateTimestampUTC)
          }else{
            this.StartDateTimestampUTC=''
          }
         if(localStorage.getItem('organizedMeetingEndDateFilter')!=''){
          this.endDateTimestampUTC = this.datePipe.transform(localStorage.getItem('organizedMeetingEndDateFilter'), 'yyyy-MM-ddTHH:mm:ss', 'UTC');
          console.log(this.endDateTimestampUTC)
         }
          else{
            this.endDateTimestampUTC=''
          }
        }
        else{
          this.StartDateTimestampUTC='';
          this.endDateTimestampUTC='';
        }
        
        this.meetingsService.getUserOraganizedMeetingsByUserId(this.selectedReporteeOrganizedMeeting, this.organizedMeetingTitleFilter,
          this.StartDateTimestampUTC, this.endDateTimestampUTC).subscribe({
            next: (response) => {
              document.getElementById("organizedMeeting").style.borderBottom = '2px solid white';
              document.getElementById("organizedMeeting").style.width = 'fit-content';
              document.getElementById("organizedMeeting").style.paddingBottom = '2px';
              document.getElementById("attendedMeeting").style.borderBottom = 'none';
              this.meetingCount = response.body.length
              if (this.meetingCount === 0) {
                this.isComponentLoading = false;
                this.displayText = false;
              } else {
                if(this.numberCountPerPage===0){
                 if(localStorage.getItem('meetingTableSize')!=null){
                this.onTableDataChange(1);
                this.setItemsPerPage(parseInt(localStorage.getItem('meetingTableSize')));
                this.numberCountPerPage=1;
                this.reloadPageCount=2
                 }else{
                  this.onTableDataChange(1);
                this.setItemsPerPage(10);
                this.numberCountPerPage=1;
                this.reloadPageCount=0;
                 }
                }
                //set default time for loading
                setTimeout(() => {
                 this.isComponentLoading = false;
                 this.isOrganizedMeetingDataText = false;
                },1500)
                this.meetings = response.body; 
                console.log(this.meetings);     
              }
              localStorage.setItem('meetingCount', this.meetingCount.toString());
              this.meetings.forEach(meeting => {
                if (meeting.meetingTranscripts.length > 0) {
                  //enable the transcript icon, if transcript is not available for the meeting
                  meeting.isTranscriptDisabled = false;
                  //store the count of transcripts available for the meeting
                  this.transcriptsCount = meeting.meetingTranscripts.length;
                  //iterate through transcripts of the meeting and merge it into a single transcript
                  meeting.meetingTranscripts.forEach(transcript => {
                    //split the transcript data properly to display to the user 
                    //get all transcripts of the meeting and display it as single transcript
                    meeting.transcriptData = transcript.transcriptContent.split('\n');
                  })
                } else {
                  //disable the transcript icon, if transcript is not available for the meeting
                  meeting.isTranscriptDisabled = true;
                }
              });
            },//next
            error: (error) => {
              if (error.status === HttpStatusCode.Unauthorized) {
                this.router.navigateByUrl("/session-timeout")
              }
            }//error
          })//subscribe
      } else {
        const startDateFilter = this.organizedMeetingStartDateFilter ? new Date(this.organizedMeetingStartDateFilter).toISOString() : null;
        const endDateFilter = this.organizedMeetingEndDateFilter ? new Date(this.organizedMeetingEndDateFilter).toISOString() : null;
        this.meetingsService.getUserOraganizedMeetingsByUserId(localStorage.getItem('email'), this.organizedMeetingTitleFilter,
          startDateFilter, endDateFilter).subscribe({
            next: (response) => {
              this.meetings = response.body;
              this.meetingCount = response.body.length
              localStorage.setItem('meetingCount', this.meetingCount.toString());
              this.meetings.forEach(meeting => {
                if (meeting.meetingTranscripts.length > 0) {
                  //enable the transcript icon, if transcript is not available for the meeting
                  meeting.isTranscriptDisabled = false;
                  //store the count of transcripts available for the meeting
                  this.transcriptsCount = meeting.meetingTranscripts.length;
                  //iterate through transcripts of the meeting and merge it into a single transcript
                  meeting.meetingTranscripts.forEach(transcript => {
                    //split the transcript data properly to display to the user 
                    //get all transcripts of the meeting and display it as single transcript
                    meeting.transcriptData = transcript.transcriptContent.split('\n');
                  })
                } else {
                  //disable the transcript icon, if transcript is not available for the meeting
                  meeting.isTranscriptDisabled = true;
                }
              });
            },//next
            error: (error) => {
              if (error.status === HttpStatusCode.Unauthorized) {
                this.router.navigateByUrl("/session-timeout")
              }
            }//error
          })//subscribe
      }
    } else {
      if (this.selectedReporteeAssignedMeeting != '') {
        //get user attended meetings
        this.meetingsService.getUserAttendedMeetingsByUserId(this.selectedReporteeAssignedMeeting, this.attendedMeetingTitleFilter,
          this.attendedMeetingStartDateFilter, this.attendedMeetingEndDateFilter).subscribe({
            next: (response) => {
              document.getElementById("attendedMeeting").style.borderBottom = '2px solid white';
              document.getElementById("attendedMeeting").style.paddingBottom = '2px';
              document.getElementById("attendedMeeting").style.width = 'fit-content';
              document.getElementById("organizedMeeting").style.borderBottom = 'none';
              //extract the meetings from response object
             
              this.attendedMeetingCount = response.body.length;
              if (this.attendedMeetingCount === 0) {
                this.isComponentLoading = false;
                this.displayText = false;
              } else {
                setTimeout(() => {
                  this.isComponentLoading = false;
                  this.isAttendedMeetingDataText = false;
                  this.attendedMeetingDataLoaded=true;
                  this.initalizeDataTable=false;
                },1500)
                this.attendedMeetings = response.body;
                console.log(this.attendedMeetings);
                
              }
              localStorage.setItem('attendedMeetingCount', this.attendedMeetingCount.toString());
            },//next
            error: (error) => {
              if (error.status === HttpStatusCode.Unauthorized) {
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
        this.meetingsService.getUserAttendedMeetingsByUserId((localStorage.getItem('email')), this.attendedMeetingTitleFilter,
          this.attendedMeetingStartDateFilter, this.attendedMeetingEndDateFilter).subscribe({
            next: (response) => {
              //extract the meetings from response object
              this.attendedMeetings = response.body;
              this.attendedMeetingCount = response.body.length
              localStorage.setItem('attendedMeetingCount', this.attendedMeetingCount.toString());
            },//next
            error: (error) => {
              if (error.status === HttpStatusCode.Unauthorized) {
                this.router.navigateByUrl("/session-timeout")
              }
            }//error
          })//subscribe
      }
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
    var table = document.getElementById("myTable" + meetingId)
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
          this.actionItemsToBeDeleted.push(checkbox.value)
        }
      }
    }
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
    var isConfirmed = window.confirm('Are you sure, you really want to delete the selected action items ?');
    if (isConfirmed) {
      //subscribe to the response
      this.meetingsService.deleteActionItemsOfMeeting(actionItemIds, meetingId).subscribe({
        next: (response) => {
          this.isMetingActionItemsDeleted = response.body;
          if (this.isMetingActionItemsDeleted) {
            if (actionItemIds.length > 1) {
              this.toastr.success('Action items are deleted')
            } else {
              this.toastr.success('Action item ' + actionItemIds + ' is deleted')
            }
            setTimeout(() => {
              window.location.reload();
            }, 1000)
          } else {
            this.toastr.error('Action items were not deleted, try again')
          }
        }, error: (error) => {
          if (error.status === HttpStatusCode.Unauthorized) {
            this.router.navigateByUrl("/session-timeout")
          }
        }//error
      })
    } else {
      //this.toastr.warning('Action items not deleted.');
    }
    this.actionItemsToBeDeleted =  [];
  }


  //count: number= 0;
  /**
   * 
   * @param eventId 
   * @param index 
   */
  hideActionItem:boolean=false;
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
      var mainCheckBox=document.getElementById("actionItemMainCheck"+ meetingId) as HTMLInputElement
      let mcount=0;
      if(mainCheckBox.checked===true){
        mcount=1;
      }
      let value;
      if (checkbox) {
        value = checkbox.checked
      }

      if (value === true) {
        count = (count + 1);
        var buttons = document.getElementById('submitAndDelete' + meetingId);
        buttons.style.display = 'table-cell'
        this.hideActionItem=true;
        var emptyCell = document.getElementById('emptycell' + meetingId);
        emptyCell.style.display = 'none'

      } 
      
      else {
        if (count < 1) {
          this.hideActionItem=false;
          var buttons = document.getElementById('submitAndDelete' + meetingId);
          buttons.style.display = 'none'
          var emptyCell = document.getElementById('emptycell' + meetingId);
          emptyCell.style.display = 'table-cell'
        }
      }
      if(value=== false && mainCheckBox.checked===true){
        this.hideActionItem=false;
        var buttons = document.getElementById('submitAndDelete' + meetingId);
        buttons.style.display = 'none'
        var emptyCell = document.getElementById('emptycell' + meetingId);
        emptyCell.style.display = 'table-cell'
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
      next: (response) => {
        this.actionItems_new = response.body;
        this.updatedetails.actionItemId = this.actionItems_new.actionItemId;
        this.updatedetails.actionItemDescription = this.actionItems_new.actionItemDescription;
        this.updatedetails.meetingId = this.actionItems_new.meetingId;
        this.updatedetails.actionStatus = this.actionItems_new.actionStatus;
        this.updatedetails.actionItemTitle = this.actionItems_new.actionItemTitle;
        this.updatedetails.actionPriority = this.actionItems_new.actionPriority;
        this.updatedetails.actionItemOwner = this.actionItems_new.actionItemOwner;
        this.updatedetails.startDate = this.actionItems_new.startDate;
        this.updatedetails.endDate = this.actionItems_new.endDate;
        this.updatedetails.departmentId = this.actionItems_new.departmentId;
      }, error: (error) => {
        if (error.status === HttpStatusCode.Unauthorized) {
          this.router.navigateByUrl("/session-timeout")
        }
      }//error
    });
  }

  meetingData: Meeting

  /**
   * 
   * @param meetingId 
   */
  disableSubmit: Boolean = false;
  submitActionItems(meeting: Meeting) {
    //this.meetingData = meeting;
    var table = document.getElementById("myTable" + meeting.meetingId)
    //for(var i=0; i<tables.length; i++){
    var rows = table.getElementsByTagName("tr");
    var value: number[];
    // Loop through each row
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];

      var checkbox = row.querySelector("input[type='checkbox']") as HTMLInputElement;
      // Check if the checkbox exists in the row
      if (checkbox && checkbox != checkbox[1]) {
        // Check the 'checked' property to get the state (true or false)
        if (checkbox.checked) {
          this.actionItemsToBeSubmittedIds.push(checkbox.value)
        }
      }
    }
    this.actionItemsOfMeeting.filter((action) => {
      //if(action.status === 'NotConverted'){
      var acitems = this.actionItemsToBeSubmittedIds.forEach((acId) => {
        if (acId == action.actionItemId) {
          this.actionItemsToBeSubmitted.push(action);
        }
      })
      //}
    });
    this.meetingsService.submitActionItems(this.actionItemsToBeSubmitted, meeting).subscribe({
      next: (response) => {
        this.disableSubmit = true;
        var isActionItemsSubmitted = response.body;
        this.toastr.success('Action items submitted successfully')
        setTimeout(() => {
          window.location.reload();
        }, 1000)
      }, error: (error) => {
        if (error.status === HttpStatusCode.Unauthorized) {
          this.router.navigateByUrl("/session-timeout")
        } else {
          this.toastr.error('Error while submitting action items. Please try again !')
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
  }

  userEmailIdList: string[];
  userEmailIdListForAttendees: string[];
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
      next: (response) => {
        let i = 0;
        this.userEmailIdList = response.body;

      }, error: (error) => {
        if (error.status === HttpStatusCode.Unauthorized) {
          this.router.navigateByUrl("/session-timeout")
        }
      }//error
    })
  }

  /**
   * get the list of active users
   */
  getActiveUMSAttendeesEmailIdList() {
    //perform an AJAX call to get list of users
    var isActive: boolean = true;
    // $.ajax({url:"http://localhost:8012/users/getEmail-list/", success: function(result){
    //   this.userEmailIdList = result;
    //   console.log(result);
    //   console.log(this.userEmailIdList[0]);
    // }});
    let i = 0;
    this.meetingsService.getActiveUserEmailIdList().subscribe({
      next: (response) => {
        this.userEmailIdListForAttendees = response.body;
        this.userEmailIdListForAttendees.map(email => {
          if (email === this.selectedReporteeOrganizedMeeting) {
            this.userEmailIdListForAttendees.splice(i, 1);
          }
          i++;
        })
      }, error: (error) => {
        if (error.status === HttpStatusCode.Unauthorized) {
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
    if (this.updatedetails.actionItemTitle === '' || this.updatedetails.actionItemTitle.trim() === "" || regex.test(this.updatedetails.actionItemTitle) === false) {
      if(this.updatedetails.actionItemTitle.startsWith(" ")){
        this.updateActionItemTitleErrorInfo = 'Title cannot start with space';
      }else
      this.updateActionItemTitleErrorInfo = 'Title is required';
      this.isUpdateActionItemTitleValid = false;
    } else if (this.updatedetails.actionItemTitle.length < 5) {
      this.updateActionItemTitleErrorInfo = 'Title should have minimum of 5 characters';
      this.isUpdateActionItemTitleValid = false;
    } else if (this.updatedetails.actionItemTitle.length > 50) {
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
    const regex = /^(?!\s)[\s\S]*$/;
    if (this.updatedetails.actionItemDescription === '' || this.updatedetails.actionItemDescription.trim() === "" || regex.test(this.updatedetails.actionItemDescription) === false) {
      if(this,this.updatedetails.actionItemDescription.startsWith(" ")){
        this.updateActionItemDescErrorInfo = 'Description cannot start with space';
      }else
      this.updateActionItemDescErrorInfo = 'Description is required';
      this.isUpdateActionItemDescValid = false;
    } else if (this.updatedetails.actionItemDescription.length < 10) {
      this.updateActionItemDescErrorInfo = 'Description should have minimum of 10 characters';
      this.isUpdateActionItemDescValid = false;
    } else if (this.updatedetails.actionItemDescription.length > 250) {
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
    if (this.updatedetails.actionItemOwner === null || this.updatedetails.actionItemOwner.length === 0) {
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
    if (this.updatedetails.startDate === '') {
      this.updateActionItemStartDateErrorInfo = 'Start Date cannot be blank'
      this.isUpdateActionItemStartDateValid = false;
    }
    //  else if (new Date(this.updatedetails.startDate.toString()) < new Date(Date.now())) {
    //   this.updateActionItemStartDateErrorInfo = 'Start date cannot be a previous date.'
    //   this.isUpdateActionItemStartDateValid = false;
    // }
    else {
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
      //this.updatedetails.departmentId = this.selectedReporteeDepartment;
      this.actionItemService.updateActionItem(this.updatedetails).subscribe({
        next: (response) => {
          this.data = response.body;
          //var modal = document.getElementById('myModal');
          //modal.setAttribute('data-dismiss','modal');
          document.getElementById('closeUpdateModal').click();
          this.toastr.success('Action item updated successfully');
          setTimeout(() => {
            window.location.reload();
          }, 1000)
        }, error: (error) => {
          if (error.status === HttpStatusCode.Unauthorized) {
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
      var table = document.getElementById("myTable" + meetingId)
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
      buttons.style.display = 'table-cell'
      var emptyCell = document.getElementById('emptycell' + meetingId);
      emptyCell.style.display = 'none'
    } else {
      var table = document.getElementById("myTable" + meetingId)
      var rows = table.getElementsByTagName("tr");
      if (mainCheckBox.checked === false) {
        for (var j = 0; j < rows.length; j++) {
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


  // min: any = "";

  // /**
  //  * 
  //  */
  // pastDateTime() {
  //   var tdate: any = new Date();
  //   var date: any = tdate.getDate();
  //   if (date < 10) {
  //     date = "0" + date;
  //   }
  //   var month: any = tdate.getMonth() + 1;
  //   if (month < 10) {
  //     month = "0" + month;
  //   }
  //   var year: any = tdate.getFullYear();
  //   this.min = year + "-" + month + "-" + date ;
  //   console.log(this.min);
  // }

  onMaterialGroupChange(event) {
   // console.log(event);
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
  }


  /** send Mom Email */
  emailListForsendingMOM: string[];
  SendActionItemList = new Array();
  momObject: MOMObject;
  resultData: boolean;
  discussionPoints: string;
  sendMOMEmail() {
    this.isSendButtonDisabled=true;
    for (var i = 0; i < this.actionItemsOfMeeting.length; i++) {

      if (this.meetingData.meetingId == this.actionItemsOfMeeting[i].meetingId) {
        this.SendActionItemList.push(this.actionItemsOfMeeting[i]);
        //console.log("loop executed successfully"+i);
      }
    }
    this.meetingsService.sendMinutesofMeeting(this.emailListForsendingMOM, this.meetingData, this.discussionPoints, this.hoursDiff, this.minutesDiff).subscribe({
      next: (response) => {
        if (response.status == HttpStatusCode.Ok) {
          this.toastr.success("MOM send successfully");
          this.isSendButtonDisabled=false;
          document.getElementById('closeSendMoMEmail').click();
        }



      }, error: (error) => {
        if (error.status === HttpStatusCode.Unauthorized) {
          this.router.navigateByUrl("/session-timeout")
        } else {
          this.toastr.error("Error occured while sending email, please try again");
          this.isSendButtonDisabled=false;
        }
      }//error
    })
  }


  addMeeting = {
    meetingId: 0,
    subject: '',
    organizerName: '',
    organizerEmailId: this.selectedReporteeOrganizedMeeting != '' ? this.selectedReporteeOrganizedMeeting : this.loggedInUser,
    departmentId: 0,
    startDateTime: '',
    endDateTime: '',
    attendees: [],
    //actionItems: 
    emailId: this.selectedReporteeOrganizedMeeting != '' ? this.selectedReporteeOrganizedMeeting : this.loggedInUser,
    location : '',
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

    if (this.isMeetingSubjectValid === false) {
      var valid = this.validateMeetingSubject();
      isSubjectvalid = valid;
    }
    if (this.isMeetingStartDateValid === false) {
      var valid = this.validateMeetingStartDateTime();
      isStartDateValid = valid;
    }
    if (this.isMeetingEndDateValid === false) {
      var valid = this.validateMeetingEndDateTime();
      isEndDateValid = valid;
    }
    if (this.isMeetingAttendeesValid === false) {
      var valid = this.validateMeetingAttendees();
      isAttendeesValid = valid;
    }

    if (isSubjectvalid && isStartDateValid && isEndDateValid && isAttendeesValid) {
      //create meeting
      this.createButtonDisabled=true;
      this.meetingsService.createMeeting(this.addMeeting).subscribe({
        next: (response) => {
          if (response.status === HttpStatusCode.Created) {
            //get the created meeting
            this.createdMeeting = response.body;
            this.toastr.success('Meeting created successfully');
            document.getElementById('closeCreateMeetingModal').click();
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            this.toastr.error('Error while creating meeting. Please try again !');
            this.createButtonDisabled=false;
          }
        }, error: (error) => {
          if (error.status === HttpStatusCode.Unauthorized) {
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
    if (this.addMeeting.subject === '' || this.addMeeting.subject.trim() === "" || regex.test(this.addMeeting.subject) === false) {
      if(this.addMeeting.subject.startsWith(" ")){
        this.meetingSubjectErrorInfo = 'Meeting subject cannot start with space';
      }else
      this.meetingSubjectErrorInfo = 'Meeting subject is required';
      this.isMeetingSubjectValid = false;
    } else if (this.addMeeting.subject.length < 4) {
      this.meetingSubjectErrorInfo = 'Meeting subject should have minimum of 4 characters';
      this.isMeetingSubjectValid = false;
    } else if (this.addMeeting.subject.length > 250) {
      this.meetingSubjectErrorInfo = 'Meeting subject should not exceed maximum of 250 characters';
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
    } else if ((this.addMeeting.endDateTime) < (this.addMeeting.startDateTime)) {
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
  toggleMainCheckbox(meetingId, index: number) {
    const uncheckedCount = $('#myTable' + meetingId + ' .ac-check:not(:checked)').length;
    $('.mainCheckBox').prop('checked', uncheckedCount === 0);
}

  //Duration of meeting
  hoursDiff: any
  minutesDiff: any
  getDuration(meeting: Meeting) {
    var startdate = new Date(meeting.startDateTime);
    var endDate = new Date(meeting.endDateTime);
  
    // Calculate the time difference in milliseconds
    var timeDifference = endDate.getTime() - startdate.getTime();
  
    // Calculate hours, minutes, and seconds
    var millisecondsInMinute = 60 * 1000;
    var millisecondsInHour = 60 * millisecondsInMinute;
  
    this.hoursDiff = Math.floor(timeDifference / millisecondsInHour);
    this.minutesDiff = Math.floor((timeDifference % millisecondsInHour) / millisecondsInMinute);
  }
  emailListErrorInfo = '';
  isemailforSendMoMEmailValid = false;
  validateMoMEmail() {
    if (this.emailListForsendingMOM === null || this.emailListForsendingMOM.length === 0) {
      this.emailListErrorInfo = 'Choose an email ID for sending the email';
      this.isemailforSendMoMEmailValid = false;
    }
    else {
      this.isemailforSendMoMEmailValid = true;
      this.emailListErrorInfo = '';
    }
    return this.isemailforSendMoMEmailValid;
  }

  /**
   * if Role is not Admin and have reportees excute this method
   */
  getEmployeeReportees() {
    this.employeeService.getReporteesDataOfEmployee(this.loggedInUser).subscribe({
      next: response => {
        this.reporteeList = response.body;
        this.reporteeCount = response.body.length;
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
   * store selected reportee in localstorage
   */
  storeReporteeDataOfOrganizedMeeting() {
    localStorage.setItem('selectedReporteeOrganizedMeeting', this.selectedReporteeOrganizedMeeting);
    this.selectedReporteeOrganizedMeeting = localStorage.getItem('selectedReporteeOrganizedMeeting')
    if (this.selectedReporteeOrganizedMeeting === 'null') {
      localStorage.setItem('selectedReporteeOrganizedMeeting', this.loggedInUser)
      this.selectedReporteeOrganizedMeeting = localStorage.getItem('selectedReporteeOrganizedMeeting');
    }
    window.location.reload();
  }

  /**
  * store selected reportee in localstorage
  */
  storeReporteeDataOfAssignedMeeting() {
    localStorage.setItem('selectedReporteeAssignedMeeting', this.selectedReporteeAssignedMeeting);
    this.selectedReporteeAssignedMeeting = localStorage.getItem('selectedReporteeAssignedMeeting')
    if (this.selectedReporteeAssignedMeeting === 'null') {
      localStorage.setItem('selectedReporteeAssignedMeeting', this.loggedInUser)
      this.selectedReporteeAssignedMeeting = localStorage.getItem('selectedReporteeAssignedMeeting');
    }
    window.location.reload();
  }

  /**
   * 
   * @param meetingTitle 
   * @param startDate 
   * @param endDate 
   */
  newStartDate: Date;
  newEndDate: Date;
  filterOrganizedMeetingList(meetingTitle: string, startDate: string, endDate: string) {
    // this.newStartDate = new Date(startDate);
    let StartDateTimestampUTC: string | null = "";
    let endDateTimestampUTC: string | null = "";

    if (startDate != "") {
      console.log(startDate)
      const StartDateTimestamp = new Date(startDate);
      console.log(StartDateTimestamp)
      StartDateTimestampUTC = this.datePipe.transform(StartDateTimestamp, 'yyyy-MM-ddTHH:mm:ss', 'UTC');
      console.log(StartDateTimestampUTC)
    }

    if (endDate != "") {
      const endDateTimestamp = new Date(endDate);
      endDateTimestampUTC = this.datePipe.transform(endDateTimestamp, 'yyyy-MM-ddTHH:mm:ss', 'UTC');
    }
    this.organizedMeetingTitleFilter = meetingTitle;
    this.organizedMeetingStartDateFilter = startDate;
    this.organizedMeetingEndDateFilter = endDate;

    localStorage.setItem('organizedMeetingTitleFilter', meetingTitle);
    localStorage.setItem('organizedMeetingStartDateFilter', startDate);
    localStorage.setItem('organizedMeetingEndDateFilter', endDate);
    console.log( localStorage.getItem('organizedMeetingStartDateFilter'))

    this.meetingsService.getUserOraganizedMeetingsByUserId(this.selectedReporteeOrganizedMeeting,
      this.organizedMeetingTitleFilter,
      StartDateTimestampUTC.toString(),
      endDateTimestampUTC.toString()).subscribe({
        next: response => {
          this.meetings = response.body;
          this.meetingCount = response.body.length;
          this.closeFilterModal();
         // window.location.reload();
        }
      });


  }

  closeFilterModal() {
    document.getElementById('filterModal').click();
    document.getElementById('addfilterModal').click();
    //window.location.reload()
  }

  resetOrganizedMeetingsFilter() {
    localStorage.setItem('organizedMeetingTitleFilter', '');
    localStorage.setItem('organizedMeetingStartDateFilter', '');
    localStorage.setItem('organizedMeetingEndDateFilter', '');
    this.closeFilterModal();
    window.location.reload();
  }

  resetAttendedMeetingsFilter() {
    localStorage.setItem('attendedMeetingTitleFilter', '');
    localStorage.setItem('attendedMeetingStartDateFilter', '');
    localStorage.setItem('attendedMeetingEndDateFilter', '');
    this.closeFilterModal();
    window.location.reload();
  }

  /**
   * 
   * @param meetingTitle 
   * @param meetingStartDateTime 
   * @param meetingEndDateTime 
   */
  filterAttendedMeetingList(meetingTitle, meetingStartDateTime, meetingEndDateTime) {
    let StartDateTimestampUTC: string | null = "";
    let endDateTimestampUTC: string | null = "";
    if (meetingStartDateTime != "") {
      const StartDateTimestamp = new Date(meetingStartDateTime);
      StartDateTimestampUTC = this.datePipe.transform(StartDateTimestamp, 'yyyy-MM-ddTHH:mm:ss', 'UTC');
    }

    if (meetingEndDateTime != "") {
      const endDateTimestamp = new Date(meetingEndDateTime);
      endDateTimestampUTC = this.datePipe.transform(endDateTimestamp, 'yyyy-MM-ddTHH:mm:ss', 'UTC');
    }
    this.attendedMeetingTitleFilter = meetingTitle;
    this.attendedMeetingStartDateFilter = meetingStartDateTime;
    this.attendedMeetingEndDateFilter = meetingEndDateTime;
    localStorage.setItem('attendedMeetingTitleFilter', meetingTitle);
    localStorage.setItem('attendedMeetingStartDateFilter', meetingStartDateTime);
    localStorage.setItem('attendedMeetingEndDateFilter', meetingEndDateTime);

    this.meetingsService.getUserAttendedMeetingsByUserId(this.selectedReporteeAssignedMeeting,
      this.attendedMeetingTitleFilter, StartDateTimestampUTC.toString(), endDateTimestampUTC.toString()).subscribe({
        next: response => {
          if (response.status === HttpStatusCode.Ok) {
            this.attendedMeetings = response.body;
            this.attendedMeetingCount = response.body.length;
            this.closeFilterModal();
          }
        }
      })
   window.location.reload();
  }


  attendeeEmailList: string[];
  attendeeEmployeeName: Employee[];
  // Define a function to retrieve attendee names by email IDs
  getAllAttendeeNamesByEmailId(meetingAttendees: any[]) {
    const attendeeEmailList: string[] = [];

    // Extract email addresses from meetingAttendees
    meetingAttendees.forEach(attendee => {
      attendeeEmailList.push(attendee.email);
    });
    //attendeeEmailList.push('dhanush.akunuri@ikcontech.com')
    //attendeeEmailList.push('dhanush.akunuri@ikcontech.com')
    // Call the service to get employee names based on email IDs
    this.employeeService.getAllEmployeesByAttendeeEmailId(attendeeEmailList).subscribe({
      next: (response) => {
        this.attendeeEmployeeName = response.body;
        // Perform further actions with retrieved attendee names if needed
      },
      error: (err) => {
        console.error('Error occurred while fetching attendee names:', err);
        // Handle error as per your application's requirements
      }
    });
  }

  isDisabled = false;
  actionItemsErrorMessage = '';
  actionItemList: ActionItems[];
  meetingList: Meeting[];
  disabled : any;
  //newActionItemList: ActionItems[] = [];
  enableOrDisableSendMOM() {
    // Fetch all action items outside the loop
    this.actionItemService.getAllActionItems().subscribe({
      next: response => {
        this.actionItemList = response.body;
        
        // Process each meeting
        this.meetingsService.getUserOraganizedMeetingsByUserId(this.selectedReporteeOrganizedMeeting, '', '', '').subscribe({
          next: response => {
            this.meetingList = response.body;
  
            this.meetingList.forEach(meeting => {
              // Check if meeting has any associated action items
              const hasActionItems = this.actionItemList.some(actionItem => actionItem.meetingId === meeting.meetingId);
          
              // Disable the button if there are unsubmitted action items OR no associated action items
              if (hasActionItems && this.actionItemList.some(item => item.meetingId === meeting.meetingId && item.actionStatus === "Not Submitted") ||
                  !hasActionItems) {
                  this.disableMomButton(meeting.meetingId);
                }
              var actionItemLisTOfParticularMeeting =this.actionItemList.filter(actionItem => actionItem.meetingId === meeting.meetingId);
              var newactionItemLisTOfParticularMeeting= actionItemLisTOfParticularMeeting.filter(actionItem=> actionItem.actionStatus==="Not Submitted");
              if(newactionItemLisTOfParticularMeeting.length ===0){
                this.allSubCheckboxChecked(meeting.meetingId)
              }
            });
          },
          error: error => {
            console.error('Error fetching meetings:', error);
          }
        });
      },
      error: error => {
        console.error('Error fetching action items:', error);
      }
    });
  }

  disableMomButton(meetingId: number) {
    this.itemElements.changes.subscribe(() => {
      const htmlElement = document.getElementById('email'+meetingId);
      if(htmlElement!=null){
      htmlElement.classList.add("disabled")
      }
    });
  }
  receiptientsList: string[] = [];
  updatedreceiptientsList: string[] = [];

  getAddReceiptientsForMOMEmail(meetingAttendees: Attendee[]) {
    this.meetingsService.getActiveUserEmailIdList().subscribe({
      next: (response) => {
        this.receiptientsList = response.body;
        this.updatedreceiptientsList = [];
        meetingAttendees.forEach(attendee => {
          // Check  attendee's email is not in the user email list
          if (!this.receiptientsList.includes(attendee.email)) {
            this.updatedreceiptientsList.push(attendee.email);
          }
          else {
            //attendee's email is present, remove it from userEmailIdList
            const index = this.receiptientsList.indexOf(attendee.email);
            if (index > -1) {
              this.receiptientsList.splice(index, 1);
            }
          }

        });
      },
      error: (error) => {
        if (error.status === HttpStatusCode.Unauthorized) {
          this.router.navigateByUrl("/session-timeout");
        }
      }
    });
  }


  currentMenuItem: MenuItem;
  async getCurrentMenuItemDetails(): Promise<MenuItem> {
    const response = await lastValueFrom(this.menuItemService.findMenuItemByName('Meetings')).then(response => {
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

  //Pagination code
  page: number = 1;
  count: number = 0;
  tableSize: number = parseInt(localStorage.getItem('meetingTableSize'));
  tableSizes: any = [3, 6, 9, 12];
  onTableDataChange(event: any) {
    this.page = event;
    this.getMeetings(this.tabOpened);
   this.calculateEntriesInfo();
  }
  onTableSizeChange(event: any): void {
    this.tableSize = event.target.value;
    this.page = 1;
    this.getMeetings(this.tabOpened);
  }
  public setItemsPerPage(event) {
    this.tableSize = event;
    localStorage.setItem('meetingTableSize', event);
    if(this.reloadPageCount===2){
      window.location.reload()
    }
}
entriesInfo:string='';
calculateEntriesInfo() {
  const start = (this.page - 1) * this.tableSize + 1;
  const end = Math.min(start + this.tableSize - 1, this.meetingCount); 
  this.entriesInfo = `Showing ${start} to ${end} of ${this.meetingCount} entries`;

}
allSubCheckboxChecked(meetingId){
  this.itemElements.changes.subscribe(() => {
    const htmlElement = document.getElementById('actionItemMainCheck'+meetingId);
    if(htmlElement!=null){
    htmlElement.classList.add("disabled")
    }
  });
}
discussionPointErrorInfo : string;
validDiscussionPoint = false
validateDiscussionPoints(){
   if(this.discussionPoints.length >=1000){
     this.discussionPointErrorInfo ="Discussion points should not exceed maximum of 1000 characters"
     this.validDiscussionPoint = false;
   }else{
     this.discussionPointErrorInfo = "";
     this.validDiscussionPoint = true;
   }
}

}

