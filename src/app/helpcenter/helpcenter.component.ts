import { Component,OnInit,Output } from '@angular/core';
import { MenuItem } from '../model/MenuItem.model';
import { lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { AppMenuItemService } from '../app-menu-item/service/app-menu-item.service';
import { HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-helpcenter',
  templateUrl: './helpcenter.component.html',
  styleUrls: ['./helpcenter.component.css']
})
export class HelpcenterComponent implements OnInit {
  
  @Output() title: string = 'Help Center';
  viewPermission: boolean;
  createPermission: boolean;
  updatePermission: boolean;
  deletePermission: boolean;
  noPermissions: boolean;
  userRoleMenuItemsPermissionMap: Map<string, string>

  constructor(private router: Router, private menuItemService: AppMenuItemService){}

 async ngOnInit(): Promise<void> {
    if(localStorage.getItem('jwtToken') === null){
      this.router.navigateByUrl('/session-timeout');
    }
    
    if (localStorage.getItem('userRoleMenuItemPermissionMap') != null) {
      this.userRoleMenuItemsPermissionMap = new Map(Object.entries(JSON.parse(localStorage.getItem('userRoleMenuItemPermissionMap'))));
    }
    //get menu item  details of home page
    var currentMenuItem = await this.getCurrentMenuItemDetails();

      if (this.userRoleMenuItemsPermissionMap.has(currentMenuItem.menuItemId.toString().trim())) {
       // this.noPermissions = false;
        //provide permission to access this component for the logged in user if view permission exists
        //get permissions of this component for the user
        var menuItemPermissions = this.userRoleMenuItemsPermissionMap.get(this.currentMenuItem.menuItemId.toString().trim());
        if (menuItemPermissions.includes('View')) {
          this.viewPermission = true;
        }else{
          this.viewPermission = false;
        }
        if (menuItemPermissions.includes('Create')) {
          this.createPermission = true;
        }else{
          this.createPermission = false;
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

  currentMenuItem: MenuItem;
  async getCurrentMenuItemDetails() : Promise<MenuItem> {
      const response =  await lastValueFrom(this.menuItemService.findMenuItemByName('Help Center')).then(response => {
        if (response.status === HttpStatusCode.Ok) {
          this.currentMenuItem = response.body;
        }else if(response.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout');
        }
      },reason => {
        if(reason.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout')
        }
      }
      )
    return this.currentMenuItem;
  }
  
  items = [
    { question: '1. How to send MOM Email directly for the created meeting?', 
    answer: `In the organized meetings page, click on the mail icon in the MOM column for a particular meeting to open a pop-up.
     This pop-up, by default, contains all the meeting details and action items generated during the meeting, which will be sent to the meeting attendees automatically. 
    Additional recipients and discussion points can be added if required.` },

    { question: '2. How to view action items related to a particular meeting?', 
    answer: `Click on the 'Show Action Items' link in the organized meetings. 
    A pop-up will appear under the meeting with an 'Add Action Item' button. 
    Clicking this button displays another pop-up where you can add the title, 
    description, priority, action owner, planned start date, and end date. 
    Once you click 'Save,' the action item is added` },

    { question: '3. How to submit an action item and view it in the action items page before adding tasks to it?', 
    answer: `Select one action item under the meeting using the single checkbox or multiple action items using the 'Select All' checkbox, 
    then click the 'Submit' button. 
    Upon submission, a green success message "Action item submitted successfully" will appear, and the submitted action item will be displayed in the action items tab, accessible via the side menu bar.` },

    { question: '4. How to create a meeting entry into UMS for an offline meeting?', 
    answer: `In the organized meetings page, click on the '+' icon in the top right corner. 
    A 'Create Meeting' pop-up will appear, where you can enter the meeting title, start date & time, end date & time, attendees, location, and other details. 
    Three other fields will be auto-filled, such as time zone, organizer name, and organizer email ID.` },

    { question: '5. How to delete multiple tasks?', 
    answer: `In the Organized Tasks page, click on the trash icon/delete button to delete a task. 
    The trash icon is used for single deletion, while the delete button is used for both single and multiple deletions. 
    After clicking either option, a confirmation pop-up will appear asking "Are you sure you really want to delete the task?" with OK and Cancel buttons. 
    Clicking OK will display a success message for the successful deletion of the selected task.` },

    { question: '6. How to add a filter for meeting and task data?', 
    answer: `In organized meetings or attended meetings, click on the filter icon in the top right corner. 
    Enter the meeting title, from date, and to date, then click 'Apply' to filter the data accordingly.` },

    { question: '7. How to view reports on a weekly or monthly basis?', 
    answer: `: In the Reports module, users can select weekly or monthly options for all available reports. 
    The charts available for visualization in each report will display counts and views accordingly when the weekly/monthly option is selected.` },

    { question: '8. How to add designation in UMS application?', 
    answer: `In the Settings module, click on the 'Designations' option under Organization. Then, click on the 'Add' button in the top right corner. In the window displayed, provide the designation name in the 'Designation Name' field and click 'Add.' 
    A success message will indicate that the designation has been added successfully.` },

    { question: `9. How to switch to reportee's account in Lead/department head account?`, 
    answer: `In the meetings, action items page & tasks page, the drop-down list will contain the accounts of employees who have added you as their reporting manager/lead. 
    You can access these accounts on behalf of them to create, edit, and delete meetings, action items & tasks.` },

    { question: '10. How to add reportees under a user?', 
    answer: `The admin/super admin can navigate to the user who is going to report to a specific department head or team lead's account. 
    Then, in settings-> employee profile -> add/edit employees, they can add them as their reporting manager.` },

    { question: '11. How to add role in UMS application?', 
    answer: `The admin/super admin can access roles in the settings page under the user access control section. 
    Click on 'Add,' which opens a pop-up where the Role Name & Assign Permission drop-down containing predefined set of permissions can be selected. 
    Clicking 'Save' will result in a success message 'role has been created successfully.` },

    { question: '12. How to add department in UMS application?', 
    answer: `The admin/super admin can access departments in the settings page under the organization section. 
    Click on the 'Add' button, which opens a pop-up where department name, department head, department code & department location can be entered. 
    Click 'Save' to get a success message 'department has been created successfully.` },

    { question: '13. Difference between organized meeting and Attended meetings?', 
    answer: `Organized meetings are those initiated by you in teams or manually, 
    where you are the creator by entering details such as Meeting title, attendees (optional & required), date & time, occurrence, 
    location & description. Attended meetings are those in which we participated, either in teams or manual meetings, 
    and our names are in the attendees list.` },

    { question: '14. How to view tasks related to a particular action item?', 
    answer: `Tasks of a particular action item can be viewed by clicking the 'Action Items' tab in the side menu bar and navigating to the action items page. 
    In the tasks column, click on the 'Show Tasks' link for each action item to open a sub-table of tasks for that particular action item.` },

    { question: '15. How to add a task for an action item?', 
    answer: `By clicking on 'Show Tasks' in the action items page column, a sub-table for each action item is displayed. 
    Below the table, there is an 'Add Task' button. 
    Clicking on this button opens an 'Add Task' pop-up, where you can fill in the title, description, 
    assignee, category, priority, planned start date & time, planned end date & time, and status. Once all details are filled, 
    clicking 'Save' will display a success message 'Task has been created successfully.` },

  ];

  activeIndex = -1; // Initially, no item is active

  toggleAccordion(index: number): void {
    this.activeIndex = index === this.activeIndex ? -1 : index;
  }

}
