import { AfterViewInit, Component,OnDestroy,Output } from '@angular/core';
import { Department } from '../model/Department.model';
import { DepartmentService } from './service/department.service';
import { OnInit } from '@angular/core';
import { HttpStatusCode } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { EmployeeService } from '../employee/service/employee.service';
import { Employee } from '../model/Employee.model';
import { MenuItem } from '../model/MenuItem.model';
import { lastValueFrom } from 'rxjs';
import { AppMenuItemService } from '../app-menu-item/service/app-menu-item.service';


@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.css']
})
export class DepartmentComponent implements OnInit, OnDestroy, AfterViewInit {

  private table: any;
  loggedInUserRole = localStorage.getItem('userRole');

  @Output() title:string='Departments';
  departmentList: Department[];
  addDepartment = {
    departmentName: '',
    departmentCode: '',
    departmentAddress: '',
    departmentHead: '',
    createdBy:'',
    createdByEmailId: ''
  }
  updateDepartment: Department;
  
  isComponentLoading:boolean=false;
  isDepartmentDataText:boolean=false;

  viewPermission: boolean;
  createPermission: boolean;
  updatePermission: boolean;
  deletePermission: boolean;
  noPermissions: boolean;
  addButtonColor: string;
  deleteButtonColor: string;
  updateButtonColor: string;
  userRoleMenuItemsPermissionMap: Map<string, string>

  constructor(private departmentService: DepartmentService,
    private toastr: ToastrService, private router: Router, 
    private employeeService: EmployeeService, private menuItemService: AppMenuItemService){

    
  }

  /**
   * ngOnInit() executes on component initialization everytime
   */
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
    console.log(currentMenuItem)

      if (this.userRoleMenuItemsPermissionMap.has(currentMenuItem.menuItemId.toString().trim())) {
        this.noPermissions = false;
        //provide permission to access this component for the logged in user if view permission exists
        console.log('exe')
        //get permissions of this component for the user
        var menuItemPermissions = this.userRoleMenuItemsPermissionMap.get(this.currentMenuItem.menuItemId.toString().trim());
        if (menuItemPermissions.includes('View')) {
          this.viewPermission = true;
          //get all departments List on component initialization
          this.getAllDepartments();
          this.getUserStatusEmployees(true);
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

  employeesAsUser: Employee[];
  getUserStatusEmployees(isUser: boolean){
    this.employeeService.getUserStatusEmployees(isUser).subscribe({
      next: response => {
        if(response.status === HttpStatusCode.Ok){
          this.employeesAsUser = response.body;
          console.log(this.employeesAsUser)
        }
      }
    })
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      $(document).ready(() => {
        this.table = $('#table').DataTable({
          paging: true,
          stateSave:true,
          searching: true, // Enable search feature
          pageLength: 10,
          order: [[1,'asc']],
          lengthMenu: [ [10, 25, 50, -1], [10, 25, 50, "All"] ],
          // Add other options here as needed
        });
      });
    },200)
  }

  ngOnDestroy(): void {
    if (this.table) {
      this.table.destroy();
    }
  }


  /**
   * get list of all departments from Database and display to admin in UI
   */
  getAllDepartments(){
    this.isComponentLoading=true;
    this.isDepartmentDataText=true;
    setTimeout(()=>{
      this.isComponentLoading=false;
      this.isDepartmentDataText=false;
    },200)
    this.departmentService.getDepartmentList().subscribe({
      next: (response)=>{
        this.departmentList = response.body;
          this.isComponentLoading=false;
          this.isDepartmentDataText=false;
        console.log(this.departmentList)
      },error: (error) => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout')
        } 
      }
  })
  }

  
  /**
   * create a new department
   */
  createdDepartment: Department;
  createDepartment(){
    let isNameValid = true;
    let isHeadValid = true;
    let isCodeValid = true;
    let isLocationValid = true;
    var flag = 0;
    
    if(this.isDepartmentNameValid === false){
      var valid = this.validateDepartmentName();
      isNameValid = valid;
      flag = 1;
    }
    if(this.isDepartmentCodeValid === false){
     var valid = this.validateDepartmentCode();
      isCodeValid = valid;
      flag = 1;
    }
    if(this.isDepartmentHeadValid === false){
     var valid = this.validateDepartmentHead();
     isHeadValid = valid;
     flag = 1;
    }
    if(this.isDepartmentLocationValid === false){
      var valid = this.validateDepartmentLocation();
      isLocationValid = valid;
      flag = 1;
    }
    // if(flag==1){
    //   this.toastr.error('Please fill the required fields')
    // }
    if(isNameValid === true && isCodeValid === true
     &&isHeadValid === true && isLocationValid === true){
    //set createdBy
    this.addDepartment.departmentName = this.transformToTitleCase(this.addDepartment.departmentName);
    this.addDepartment.departmentAddress = this.transformToTitleCase(this.addDepartment.departmentAddress);
    this.addDepartment.departmentCode = this.addDepartment.departmentCode.toUpperCase();

    this.addDepartment.createdBy =this.transformToTitleCase(localStorage.getItem('firstName')+' '+localStorage.getItem('lastName'));
    this.addDepartment.createdByEmailId = localStorage.getItem('email');
    this.departmentService.saveDepartment(this.addDepartment).subscribe({
      next: (response)=> {
        if(response.status === HttpStatusCode.Created){
          this.createdDepartment = response.body;
        this.toastr.success('Department added successfully.')
        document.getElementById('closeAddModal').click();
          setTimeout(()=>{
            window.location.reload();
          },1000)
        }
      },error: (error) => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout')
        }else if(error.status === HttpStatusCode.Found){
          console.log(error)
          this.toastr.error("Department name '"+this.addDepartment.departmentName+ "' already exists.")
          //document.getElementById('closeAddModal').click();
        }else{
          this.toastr.error('Error occured while creating department. Please try again !')
        }
      }
     })
     }
  }

  //validations for addDepartment
  /**
   * 
   */
  departmentNameErrorInfo: string = ''
  isDepartmentNameValid = false;
  validateDepartmentName(){
   // var deptName=  event.target.value;
    const regex = /^\S.*[a-zA-Z\s]*$/;
    const regex2=/^[A-Za-z ]+$/;
    if(this.addDepartment.departmentName === '' || this.addDepartment.departmentName.trim()==="" || regex.exec(this.addDepartment.departmentName)===null){
      this.departmentNameErrorInfo = 'Department name is required.';
      this.isDepartmentNameValid = false;
    }else if(regex2.test(this.addDepartment.departmentName) === false){
      this.departmentNameErrorInfo = 'Department name cannot have special characters or numbers.';
      this.isDepartmentNameValid = false;
     }
    else if(this.addDepartment.departmentName.length < 3){
      this.departmentNameErrorInfo = 'Department name should have minimum of 3 characters.';
      this.isDepartmentNameValid = false;
    }else if(this.addDepartment.departmentName.length > 50){
      this.departmentNameErrorInfo = 'Department name should not exceed more than 50 characters';
      this.isDepartmentNameValid = false;
    }else{
      this.isDepartmentNameValid = true;
      this.departmentNameErrorInfo = '';
    }
    return this.isDepartmentNameValid;
  }

  /**
   * 
   */
  departmentHeadErrorInfo: string = ''
  isDepartmentHeadValid = false;
  validateDepartmentHead(){
    //var deptHead = event.target.value;
    const regex = /^\S.*[a-zA-Z\s]*$/;
    if(this.addDepartment.departmentHead === ''|| this.addDepartment.departmentHead.trim()==="" || regex.exec(this.addDepartment.departmentHead)===null){
      this.departmentHeadErrorInfo = 'Department head is required.';
      this.isDepartmentHeadValid = false;
    }else if(this.addDepartment.departmentHead.length < 3){
        this.departmentHeadErrorInfo = 'Department head should have minimum of 3 characters.';
        this.isDepartmentHeadValid = false;
    }else if(this.addDepartment.departmentHead.length > 50){
        this.departmentHeadErrorInfo = 'Department head should not exceed more than 50 characters';
        this.isDepartmentHeadValid = false; 
    }else{
      this.isDepartmentHeadValid = true;
      this.departmentHeadErrorInfo = '';
    }
    return this.isDepartmentHeadValid;
  }

  /**
   * 
   */
  departmentCodeErrorInfo:string = '';
  isDepartmentCodeValid = false;
  validateDepartmentCode(){
    //var deptCode = event.target.value;
    const regex = /^\S.*[a-zA-Z\s]*$/;
    if(this.addDepartment.departmentCode === ''|| this.addDepartment.departmentCode.trim()==="" || regex.exec(this.addDepartment.departmentCode)===null){
      this.departmentCodeErrorInfo = 'Department code is required.';
      this.isDepartmentCodeValid = false;
    }else if(this.addDepartment.departmentCode.length < 2){
      this.departmentCodeErrorInfo = 'Department code should be minimum of 2 characters.';
      this.isDepartmentCodeValid = false;
    }else if(this.addDepartment.departmentCode.length > 10){
      this.departmentCodeErrorInfo = 'Department code should not exceed more than 10 characters.';
      this.isDepartmentCodeValid = false;
    }
    else{
      this.isDepartmentCodeValid = true;
      this.departmentCodeErrorInfo = '';
    }
    return this.isDepartmentCodeValid;
  }

  /**
   * 
   */
  departmentLocationErrorInfo: string= '';
  isDepartmentLocationValid = false;
  validateDepartmentLocation(){
   // var deptLocation = event.target.value;
   const regex = /^\S.*[a-zA-Z\s]*$/;
   const regex2=/^[A-Za-z ]+$/;
    if(this.addDepartment.departmentAddress === ''|| this.addDepartment.departmentAddress.trim()==="" || regex.exec(this.addDepartment.departmentAddress)===null){
      this.departmentLocationErrorInfo = 'Department location is required.';
      this.isDepartmentLocationValid = false;
    }else if(regex2.test(this.addDepartment.departmentAddress) === false){
      this.departmentLocationErrorInfo = 'Department location cannot have special characters or numbers.';
      this.isDepartmentLocationValid = false;
     }
    else if(this.addDepartment.departmentAddress.length < 3){
      this.departmentLocationErrorInfo = 'Department location should be minimum of 3 characters.';
      this.isDepartmentLocationValid = false;
    }else if(this.addDepartment.departmentAddress.length > 20){
      this.departmentLocationErrorInfo = 'Department location should not exceed more than 20 characters.';
      this.isDepartmentLocationValid = false;
    }
    else{
      this.isDepartmentLocationValid = true;
      this.departmentLocationErrorInfo = '';
    }
    return this.isDepartmentLocationValid;
  }

  /**
   * delete a department
   * @param departmentId 
   */
  removeDepartment(departmentId: number){
   // document.getElementById('deleteConfirmModal').click();
   var isConfirmed = window.confirm('Are you sure, you really want to delete this department?')
   if(isConfirmed){
    this.departmentService.deleteDepartment(departmentId).subscribe({
      next:(response) => {
        console.log('exuected')
        if(response.status === HttpStatusCode.Ok){
          var result = response.body;
          this.toastr.success('Department '+departmentId+' deleted successfully.')
          setTimeout(()=>{
            window.location.reload();
          },1000)
        }
      },error: (error) => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout')
        }
        else if(error.status === HttpStatusCode.ImUsed){
          this.toastr.error("Department is already in usage by an employee, cannot be deleted.");
        }
        else{
          this.toastr.error('Error occured while deleting department ' + departmentId  +'. Please try again !')
        }
      }
   })
   }else{
    this.toastr.warning('Department '+departmentId+' not deleted.')
   }
  }

  /**
   * 
   * @param departmentId 
   */
  existingDepartment = {
    departmentId:0,
    departmentName: '',
    departmentCode: '',
    departmentAddress: '',
    departmentHead: '',
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
  fetchOneDepartment(departmentId: number){
    console.log(departmentId)
    this.departmentService.getDepartment(departmentId).subscribe({
      next: (response)=>{
        if(response.status === HttpStatusCode.Ok){
         this.existingDepartment = response.body;
         console.log(this.existingDepartment)
        }
      },error: (error) => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout')
        }
      }
    })
  }


  /**
   * update an existing department
   */
  modifyDepartment(){
    var flag = 0;
    let isNameValid = true;
    let isHeadValid = true;
    let isCodeValid = true;
    let isLocationValid = true;
    
    if(this.isUpdatedDepartmentNameValid === false){
      var valid = this.validateUpdatedDepartmentName();
      isNameValid = valid;
      flag = 1;
    }
    if(this.isUpdatedDepartmentCodeValid === false){
     var valid = this.validateUpdatedDepartmentCode();
      isCodeValid = valid;
      flag = 1;
    }
    if(this.isUpdatedDepartmentHeadValid === false){
     var valid = this.validateUpdatedDepartmentHead();
     isHeadValid = valid;
     flag = 1;
    }
    if(this.isUpdatedDepartmentLocationValid === false){
      var valid = this.validateUpdatedDepartmentLocation();
      isLocationValid = valid;
      flag = 1;
    }
    // if(flag===1){
    //   this.toastr.error('Please fill the required fields')
    // }
    if(isNameValid === true && isCodeValid === true
     &&isHeadValid === true && isLocationValid === true){

      this.existingDepartment.departmentName = this.transformToTitleCase(this.existingDepartment.departmentName);
      this.existingDepartment.departmentAddress = this.transformToTitleCase(this.existingDepartment.departmentAddress);
      this.existingDepartment.createdBy = this.transformToTitleCase(this.existingDepartment.createdBy);
      this.existingDepartment.departmentCode = this.existingDepartment.departmentCode.toUpperCase();


    this.existingDepartment.modifiedBy =this.transformToTitleCase(localStorage.getItem('firstName')+' '+localStorage.getItem('lastName'));
    console.log(this.existingDepartment)
    this.departmentService.updateDepartment(this.existingDepartment).subscribe({
      next: (response) => {
        console.log('exec')
        if(response.status === HttpStatusCode.Created){
          this.toastr.success("Department "+this.existingDepartment.departmentId +" updated successfully.")
          document.getElementById('closeUpdateModal').click();
          setTimeout(()=>{
            window.location.reload();
          },1000)
        }
      },error: (error) => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout')
        }
        else if(error.status === HttpStatusCode.Found){
          console.log(error)
          this.toastr.error("Department name '" +this.existingDepartment.departmentName+ "' already exists.")
      }
      }
     })
     }
  }

  //validations for update department
  /**
   * 
   */
  updatedDepartmentNameErrorInfo: string = ''
  isUpdatedDepartmentNameValid = false;
  validateUpdatedDepartmentName(){
    // var deptName=  event.target.value;
    const regex = /^\S.*[a-zA-Z\s]*$/;
    const regex2=/^[A-Za-z ]+$/;
     if(this.existingDepartment.departmentName === ''|| this.existingDepartment.departmentName.trim()==="" || regex.exec(this.existingDepartment.departmentName)===null){
       this.updatedDepartmentNameErrorInfo = 'Department name is required.';
       this.isUpdatedDepartmentNameValid = false;
     }else if(regex2.test(this.existingDepartment.departmentName) === false){
      this.updatedDepartmentNameErrorInfo = 'Department name cannot have special characters or numbers.';
      this.isUpdatedDepartmentNameValid = false;
     }
     else if(this.existingDepartment.departmentName.length < 3){
       this.updatedDepartmentNameErrorInfo = 'Department name should have minimum of 3 characters.';
       this.isUpdatedDepartmentNameValid = false;
     }else if(this.existingDepartment.departmentName.length > 50){
       this.updatedDepartmentNameErrorInfo = 'Department name should not exceed more than 50 characters.';
       this.isUpdatedDepartmentNameValid = false;
     }else{
       this.isUpdatedDepartmentNameValid = true;
       this.updatedDepartmentNameErrorInfo = '';
     }
     return this.isUpdatedDepartmentNameValid;
   }

   /**
    * 
    */
  updatedDepartmentHeadErrorInfo: string = ''
  isUpdatedDepartmentHeadValid = false;
  validateUpdatedDepartmentHead(){
    //var deptHead = event.target.value;
    const regex = /^\S.*[a-zA-Z\s]*$/;
    if(this.existingDepartment.departmentHead === '' || this.existingDepartment.departmentHead.trim()==="" || regex.exec(this.existingDepartment.departmentHead)===null){
      this.updatedDepartmentHeadErrorInfo = 'Department head is required.';
      this.isUpdatedDepartmentHeadValid=false;
    }else if(this.existingDepartment.departmentHead.length < 3){
      this.updatedDepartmentHeadErrorInfo = 'Department head should have minimum of 3 characters.';
      this.isUpdatedDepartmentHeadValid=false;
    }else if(this.existingDepartment.departmentHead.length > 50){
      this.updatedDepartmentHeadErrorInfo = 'Department head should not exceed more than 50 characters.'; 
      this.isUpdatedDepartmentHeadValid=false;
    }else{
      this.isUpdatedDepartmentHeadValid = true;
      this.updatedDepartmentHeadErrorInfo = '';
    }
    return this.isUpdatedDepartmentHeadValid;
  }

  /**
   * 
   */
  updatedDepartmentCodeErrorInfo: string = ''
  isUpdatedDepartmentCodeValid = false;
  validateUpdatedDepartmentCode(){
    //var deptCode = event.target.value;
    const regex = /^\S.*[a-zA-Z\s]*$/;
    if(this.existingDepartment.departmentCode === '' || this.existingDepartment.departmentCode.trim()==="" || regex.exec(this.existingDepartment.departmentCode)===null){
      this.updatedDepartmentCodeErrorInfo = 'Department code is required.';
      this.isUpdatedDepartmentCodeValid=false;
    }else if(this.existingDepartment.departmentCode.length < 1){
      this.updatedDepartmentCodeErrorInfo = 'Department code should be minimum of 1 characters.';
      this.isUpdatedDepartmentCodeValid=false;
    }else if(this.existingDepartment.departmentCode.length > 10){
      this.updatedDepartmentCodeErrorInfo = 'Department code should not exceed more than 10 characters.';
      this.isUpdatedDepartmentCodeValid=false;
    }
    else{
      this.isUpdatedDepartmentCodeValid = true;
      this.updatedDepartmentCodeErrorInfo = '';
    }
    return this.isUpdatedDepartmentCodeValid;
  }

  /**
   * 
   */
  updatedDepartmentLocationErrorInfo: string = ''
  isUpdatedDepartmentLocationValid = false;
  validateUpdatedDepartmentLocation(){
    // var deptLocation = event.target.value;
    const regex = /^\S.*[a-zA-Z\s]*$/;
    const regex2=/^[A-Za-z .,]+$/;
     if(this.existingDepartment.departmentAddress === '' || this.existingDepartment.departmentAddress.trim()==="" || regex.exec(this.existingDepartment.departmentAddress)===null){
       this.updatedDepartmentLocationErrorInfo = 'Department location is required.';
       this.isUpdatedDepartmentLocationValid = false;
     }else if(regex2.test(this.existingDepartment.departmentAddress) === false){
      this.updatedDepartmentLocationErrorInfo = 'Department location cannot have special characters or numbers.';
      this.isUpdatedDepartmentLocationValid = false;
     }
     else if(this.existingDepartment.departmentAddress.length < 3){
       this.updatedDepartmentLocationErrorInfo = 'Department location should be minimum of 3 characters.';
       this.isUpdatedDepartmentLocationValid = false;
     }else if(this.existingDepartment.departmentAddress.length > 20){
       this.updatedDepartmentLocationErrorInfo = 'Department location should not exceed more than 20 characters.';
       this.isUpdatedDepartmentLocationValid = false;
     }
     else{
       this.isUpdatedDepartmentLocationValid = true;
       this.updatedDepartmentLocationErrorInfo = '';
     }
     return this.isUpdatedDepartmentLocationValid;
   }

  checkSubCheckBoxes(){
      if($('#mainCheckBox').is(':checked')){
        $('.subCheckBox').prop('checked', true);
      }else{
        $('.subCheckBox').prop('checked', false);
      }
   }

   /**
    * 
    */
   clearErrorMessages(){
   // $(".modal-body input").val("")
    this.departmentNameErrorInfo = '';
    this.departmentCodeErrorInfo = '';
    this.departmentHeadErrorInfo = '';
    this.departmentLocationErrorInfo = '';

    this.updatedDepartmentNameErrorInfo = '';
    this.updatedDepartmentCodeErrorInfo = '';
    this.updatedDepartmentHeadErrorInfo = '';
    this.updatedDepartmentLocationErrorInfo = '';

    this.isDepartmentNameValid = false;
    this.isDepartmentHeadValid = false; 
    this.isDepartmentCodeValid = false;
    this.isDepartmentLocationValid = false;

    this.addDepartment.departmentName = '';
    this.addDepartment.departmentHead = '';
    this.addDepartment.departmentCode = '';
    this.addDepartment.departmentAddress = '';
  }

  /*
  closeDepartmentModal(){
    this.addDepartment.departmentName= '';
    this.addDepartment.departmentCode = '';
    this.addDepartment.departmentHead = '';
    this.addDepartment.departmentAddress = '';
  }
  */

  /**
   * remove multiple departments
   */
  departmentIdsToBeDeleted = [];
  removeAllSelectedDepartments(){
    //initialize to empty array on clikck from second time
    this.departmentIdsToBeDeleted = [];
   var subCheckBoxes = document.getElementsByClassName('subCheckBox') as HTMLCollectionOf<HTMLInputElement>;
   for(var i=0; i<subCheckBoxes.length; i++){
    if(subCheckBoxes[i].checked){
      this.departmentIdsToBeDeleted.push(subCheckBoxes[i].value);
      console.log(this.departmentIdsToBeDeleted);
    }
   }
   //delete the selected departments
   if(this.departmentIdsToBeDeleted.length>0){
    var isconfirmed = window.confirm('Are you sure, you really want to delete selected departments ?')
    if(isconfirmed){
      this.departmentService.deleteSelectedDepartmentsById(this.departmentIdsToBeDeleted).subscribe({
        next:(response) => {
          if(response.status === HttpStatusCode.Ok){
            var isAllDeleted = response.body    
            if(this.departmentIdsToBeDeleted.length > 1){
              this.toastr.success('Departments deleted sucessfully.') 
            } else{
              this.toastr.success('Department '+this.departmentIdsToBeDeleted+' is deleted.') 
            }
            setTimeout(()=>{
              window.location.reload();
            },1000)  
          }else{
            this.toastr.error('Error occured while deleting departments. Please try again !');
          }
        },error: (error) => {
          if(error.status === HttpStatusCode.Unauthorized){
            this.router.navigateByUrl('/session-timeout')
          }
        }
      })
    }else{
      this.toastr.warning('Departments not deleted.')
    }
   }else{
    this.toastr.error('Please select atleast one department to delete.')
   }
   
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
    console.log(anyUnchecked);
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
      const response =  await lastValueFrom(this.menuItemService.findMenuItemByName('Departments')).then(response => {
        if (response.status === HttpStatusCode.Ok) {
          this.currentMenuItem = response.body;
          console.log(this.currentMenuItem)
        }else if(response.status === HttpStatusCode.Unauthorized){
          console.log('eit')
          this.router.navigateByUrl('/session-timeout');
        }
      },reason => {
        if(reason.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout')
        }
      }
      )
    console.log(this.currentMenuItem);
    return this.currentMenuItem;
  }

}
