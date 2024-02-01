import { AfterViewChecked, AfterViewInit, Component, OnDestroy, OnInit, Output } from '@angular/core';
import { Designation } from '../model/Designation.model';
import { DesignationService } from './service/designation.service';
import { ToastrService } from 'ngx-toastr';
import { HttpStatusCode } from '@angular/common/http';
import { Router } from '@angular/router';
import { error } from 'jquery';
import { MenuItem } from '../model/MenuItem.model';
import { lastValueFrom } from 'rxjs';
import { AppMenuItemService } from '../app-menu-item/service/app-menu-item.service';

@Component({
  selector: 'app-designation',
  templateUrl: './designation.component.html',
  styleUrls: ['./designation.component.css']
})
export class DesignationComponent implements OnInit, OnDestroy, AfterViewChecked {

  loggedInUserRole = localStorage.getItem('userRole');
  @Output() title:string='Designations';
  designationList: Designation[];
  addDesignation = {
    designationName: '',
    createdBy:'',
    createdByEmailId: ''
  }
  updateDesignation: Designation;

  private table: any;

  dataTableInitialized:boolean=false;
  ngAfterViewChecked(): void {
    console.log(this.designationDataLoaded+" "+"designationDataLoaded")
    if(this.designationDataLoaded&&!this.dataTableInitialized){
        this.table = $('#table').DataTable({
          paging: true,
          searching: true, // Enable search feature
          pageLength: 10,
          stateSave:true,
          order: [[1,'asc']],
          lengthMenu: [ [10, 25, 50, -1], [10, 25, 50, "All"] ],
          // Add other options here as needed
        });
        this.dataTableInitialized=true;
      }
  }

  ngOnDestroy(): void {
    if (this.table) {
      this.table.destroy();
    }
  }

  isComponentLoading:boolean=false;
  isDesignationDataText:boolean=false;

  constructor(private designationService: DesignationService,
    private toastr: ToastrService,
    private router: Router,
    private menuItemService: AppMenuItemService){
    //get all departments List on component initialization
    this.getAllDesignations();
    
  }

  /**
   * ngOnInit() executes on component initialization everytime
   */
  viewPermission: boolean;
  createPermission: boolean;
  updatePermission: boolean;
  deletePermission: boolean;
  noPermissions: boolean;
  addButtonColor: string;
  deleteButtonColor: string;
  updateButtonColor: string;
  userRoleMenuItemsPermissionMap: Map<string, string>

  async ngOnInit(): Promise<void> {
    // if(this.loggedInUserRole != 'ADMIN' && this.loggedInUserRole != 'SUPER_ADMIN'){
    //   this.router.navigateByUrl('/unauthorized');
    // }
    if(localStorage.getItem('jwtToken') === null){
      this.router.navigateByUrl('/session-timeout');
    }
    
    if (localStorage.getItem('userRoleMenuItemPermissionMap') != null) {
      this.userRoleMenuItemsPermissionMap = new Map(Object.entries(JSON.parse(localStorage.getItem('userRoleMenuItemPermissionMap'))));
    }
    //get menu item  details of home page
    var currentMenuItem = await this.getCurrentMenuItemDetails();
        if (this.userRoleMenuItemsPermissionMap.has(currentMenuItem.menuItemId.toString().trim())) {
        this.noPermissions = false;
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
          this.addButtonColor = 'lightgray'
        }
        if (menuItemPermissions.includes('Update')) {
          this.updatePermission = true;
          this.updateButtonColor = '#5590AA';
        }else{
          this.updatePermission = false;
          this.updateButtonColor = 'lightgray';
        }
        if (menuItemPermissions.includes('Delete')) {
          this.deletePermission = true;
        }else{
          this.deletePermission = false;
          this.deleteButtonColor = 'lightgray';
        }
      }else{
        this.noPermissions = true;
        this.router.navigateByUrl('/unauthorized');
      }
  }


  /**
   * get list of all departments from Database and display to admin in UI
   */
  designationDataLoaded:boolean=false;
  getAllDesignations(){
    this.isComponentLoading=true;
    this.isDesignationDataText=true;
    setTimeout(()=>{
      this.isComponentLoading=false;
      this.isDesignationDataText=false;
    },200)
    this.designationService.getDesignationList().subscribe({
      next: (response)=>{
        this.designationList = response.body;
        
          this.isComponentLoading=false;
          this.isDesignationDataText=false;
          setTimeout(() => {
            this.designationDataLoaded=!!this.designationList;
          }, 150);
             },
      error: (error) => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout');
        }else{
          this.toastr.error('Error occured while showing designations data ! Please try again or reload the page.')
        }
      }
   })
  }

  
  /**
   * create a new department
   */
  createdDesignation: Designation;
  createDesignation(){
    let isNameValid = true;
    var flag = 0;
    
    if(this.isDesignationNameValid === false){
      var valid = this.validateDesignationName();
      isNameValid = valid;
      flag = 1;
    }
    // if(flag==1){
    //   this.toastr.error('Please fill the required fields')
    // }
    if(isNameValid === true){
    //set createdBy
    this.addDesignation.designationName = this.transformToTitleCase(this.addDesignation.designationName);

    this.addDesignation.createdBy =this.transformToTitleCase( localStorage.getItem('firstName')+' '+localStorage.getItem('lastName'));
    this.addDesignation.createdByEmailId = localStorage.getItem('email');
    this.designationService.createDesignation(this.addDesignation).subscribe({
      next: (response)=> {
        if(response.status === HttpStatusCode.Created){
          this.createdDesignation = response.body;
        this.toastr.success('Designation added successfully.')
        document.getElementById('closeAddModal').click();
          setTimeout(()=>{
            window.location.reload();
          },1000)
        }
      },
      error: (error) => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout');
        }else if(error.status === HttpStatusCode.Found){
          this.toastr.error("Designation name '"+this.addDesignation.designationName+"' already exists.");
          //document.getElementById('closeAddModal').click();
        }else{
          this.toastr.error('Error occured while creating designation. Please try again !')
        }
      }
    })
     }
  }

  //validations for addDepartment
  /**
   * 
   */
  designationNameErrorInfo: string = ''
  isDesignationNameValid = false;
  validateDesignationName(){
   // var deptName=  event.target.value;
   const regex = /^\S.*[a-zA-Z\s]*$/;
   const regex2=/^[A-Za-z ]+$/;
    if(this.addDesignation.designationName === '' || this.addDesignation.designationName.trim()==="" || regex.exec(this.addDesignation.designationName)===null){
      this.designationNameErrorInfo = 'Designation name is required.';
      this.isDesignationNameValid = false;
    }else if(regex2.test(this.addDesignation.designationName) === false){
      this.designationNameErrorInfo = 'Designation name cannot have special characters or numbers.';
      this.isDesignationNameValid = false;
     }
    else if(this.addDesignation.designationName.length < 5){
      this.designationNameErrorInfo = 'Designation name should have minimum of 5 characters.';
      this.isDesignationNameValid = false;
    }else if(this.addDesignation.designationName.length > 50){
      this.designationNameErrorInfo = 'Designation name should not exceed more than 50 characters.';
      this.isDesignationNameValid = false;
    }else{
      this.isDesignationNameValid = true;
      this.designationNameErrorInfo = '';
    }
    return this.isDesignationNameValid;
  }

  

  /**
   * delete a department
   * @param departmentId 
   */
  removeDesignation(designationId: number){
    var isConfirmed = window.confirm('Are you sure, you really want to delete this designation?')
   if(isConfirmed){
    this.designationService.deleteDesignation(designationId).subscribe({
      next: (response) => {
        if(response.status === HttpStatusCode.Ok){
          var result = response.body;
          this.toastr.success('Designation '+designationId+' deleted successfully.')
          setTimeout(()=>{
            window.location.reload();
          },1000)
        }
      },
      error : (error) =>{
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout')
        }else if(error.status === HttpStatusCode.ImUsed){
          this.toastr.error("Designation is already in usage by an employee, cannot be deleted.")
        }
        else{
          this.toastr.warning('Error occured while deleting designation '+ designationId+ '. Please try again !')
        }
      }
   })
   }else{
    this.toastr.warning('Designation '+designationId+' not deleted.');
   }
  }

  /**
   * 
   * @param departmentId 
   */
  existingDesignation = {
    id:0,
    designationName: '',
    createdBy:'',
    createdByEmailId:'',
    createdDateTime:'',
    modifiedBy:'',
    modifiedDateTime:''
  };

  /**
   * get an exisitng department from DB
   * @param departmentId 
   */
  fetchOneDesignation(designationId: number){
    this.designationService.getDesignation(designationId).subscribe({
      next: (response)=>{
        if(response.status === HttpStatusCode.Ok){
         this.existingDesignation = response.body;
        }
      },
      error: (error) => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout');
        }else{
          this.toastr.error('Error while fetching designation data. Please try again !')
        }
      }
  })
  }


  /**
   * update an existing department
   */
  modifyDesignation(){
    var flag = 0;
    let isNameValid = true;
    
    if(this.isUpdatedDesignationNameValid === false){
      var valid = this.validateUpdatedDesignationName();
      isNameValid = valid;
      flag = 1;
    }
    // if(flag===1){
    //   this.toastr.error('Please fill the required fields')
    // }
    if(isNameValid === true){
    
    this.existingDesignation.designationName = this.transformToTitleCase(this.existingDesignation.designationName);
    this.existingDesignation.createdBy = this.transformToTitleCase(this.existingDesignation.createdBy);

    this.existingDesignation.modifiedBy =this.transformToTitleCase(localStorage.getItem('firstName')+' '+localStorage.getItem('lastName'));
    this.designationService.updateDesignation(this.existingDesignation).subscribe({
      next: (response) => {
        if(response.status === HttpStatusCode.PartialContent){
          this.toastr.success('Designation '+this.existingDesignation.id+' updated successfully.')
          document.getElementById('closeUpdateModal').click();
          setTimeout(()=>{
            window.location.reload();
          },1000)
        }
      },
      error: (error) => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('session-timeout');
        }else{
          this.toastr.error("Error occured while updating designation '"+this.existingDesignation.designationName+"'. Please try again !");
        }
      }
    })
     }
  }

  //validations for update department
  /**
   * 
   */
  updatedDesignationNameErrorInfo: string = ''
  isUpdatedDesignationNameValid = false;
  validateUpdatedDesignationName(){
    // var deptName=  event.target.value;
    const regex = /^\S.*[a-zA-Z\s]*$/;
    const regex2=/^[A-Za-z ]+$/;
     if(this.existingDesignation.designationName === '' || this.existingDesignation.designationName.trim()==="" || regex.exec(this.existingDesignation.designationName)===null){
       this.updatedDesignationNameErrorInfo = 'Designation name is required.';
       this.isUpdatedDesignationNameValid = false;
     }else if(regex2.test(this.existingDesignation.designationName) === false){
      this.updatedDesignationNameErrorInfo = 'Designation name cannot have special characters or numbers.';
      this.isUpdatedDesignationNameValid = false;
     }
     else if(this.existingDesignation.designationName.length < 5){
       this.updatedDesignationNameErrorInfo = 'Designation name should have minimum of 5 characters.';
       this.isUpdatedDesignationNameValid = false;
     }else if(this.existingDesignation.designationName.length > 50){
       this.updatedDesignationNameErrorInfo = 'Designation name should not exceed more than 50 characters';
       this.isUpdatedDesignationNameValid = false;
     }else{
       this.isUpdatedDesignationNameValid = true;
       this.updatedDesignationNameErrorInfo = '';
     }
     return this.isUpdatedDesignationNameValid;
   }

   /**
    * 
    */
   checkSubCheckBoxes(){
    if($('#mainCheckBox').is(':checked')){
      $('.subCheckBox').prop('checked', true);
    }else{
      $('.subCheckBox').prop('checked', false);
    }
 }


   /**
   * remove multiple departments
   */
  designationIdsToBeDeleted = [];
  removeAllSelectedDesignations(){
    //initialize to empty array on clikck from second time
    this.designationIdsToBeDeleted = [];
   var subCheckBoxes = document.getElementsByClassName('subCheckBox') as HTMLCollectionOf<HTMLInputElement>;
   for(var i=0; i<subCheckBoxes.length; i++){
    if(subCheckBoxes[i].checked){
      this.designationIdsToBeDeleted.push(subCheckBoxes[i].value);
    }
   }
   //delete the selected departments
   if(this.designationIdsToBeDeleted.length>0){
    var isconfirmed = window.confirm('Are you sure you want to permanently delete these designations ?')
    if(isconfirmed){
      this.designationService.deleteAllSelectedDesignationsById(this.designationIdsToBeDeleted).subscribe({
        next: response => {
          if(response.status === HttpStatusCode.Ok){
            var isAllDeleted = response.body    
            if(this.designationIdsToBeDeleted.length > 1){
              this.toastr.success('Designations deleted sucessfully.') 
            } else{
              this.toastr.success('Designation '+this.designationIdsToBeDeleted+ ' is deleted sucessfully.') 
            }
            setTimeout(()=>{
              window.location.reload();
            },1000)  
          }else {
            this.toastr.error('Error occurred while deleting designations. Please try again !');
          }
        },error: error => {
          if(error.status === HttpStatusCode.Unauthorized){
            this.router.navigateByUrl('/session-timeout');
          }else if(error.status === HttpStatusCode.ImUsed){
            this.toastr.error("Designation is already in usage by an employee, cannot be deleted.")
          }
        }
      })
    }else{
      this.toastr.warning('Designations not deleted.')
    }
   }else{
    this.toastr.error('Please select atleast one designation to delete.')
   }
   
  }

  

   /**
    * 
    */
   clearErrorMessages(){
    //$(".modal-body input").val("")
    this.designationNameErrorInfo = '';
    this.updatedDesignationNameErrorInfo = '';
    this.addDesignation.designationName = ''; 
    this.isDesignationNameValid = false;
  
  }

  /**
   * 
   * @param index Uncheck the main checkbox when any of its child/subcheckbox is checked
   */
  toggleMainCheckBox(index: number){
    if(!$('#subCheckBox'+index).is(':checked')){
      $('#mainCheckBox').prop('checked',false);
    }

    const anyUnchecked = $('.subCheckBox:not(:checked)').length > 0;
    $('#mainCheckBox').prop('checked', !anyUnchecked);
  }

  transformToTitleCase(text: string | undefined | null): string {
    if (!text) {
      return ''; // Or handle null/undefined case appropriately
    }
    return text.toLowerCase().split(' ').map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  }

  currentMenuItem: MenuItem;
  async getCurrentMenuItemDetails() : Promise<MenuItem> {
      const response =  await lastValueFrom(this.menuItemService.findMenuItemByName('Designations')).then(response => {
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



}
