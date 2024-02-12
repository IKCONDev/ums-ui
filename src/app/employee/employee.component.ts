import { Component, Output, OnInit, AfterViewInit, OnDestroy, numberAttribute, AfterViewChecked } from '@angular/core';
import { EmployeeService } from './service/employee.service';
import { Employee } from '../model/Employee.model';
import { HttpStatusCode } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { DepartmentService } from '../department/service/department.service';
import { Department } from '../model/Department.model';
import { error } from 'jquery';
import { Router } from '@angular/router';
import { DesignationService } from '../designation/service/designation.service';
import { Designation } from '../model/Designation.model';
import { MenuItem } from '../model/MenuItem.model';
import { count, lastValueFrom } from 'rxjs';
import { AppMenuItemService } from '../app-menu-item/service/app-menu-item.service';
import { EmployeeVO } from '../model/EmployeeVO.model';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit, OnDestroy, AfterViewChecked {

  loggedInUserRole = localStorage.getItem('userRole');
  @Output() title: string = 'Employees';

  private table: any;

  addEmployee = {
    id: 0,
    employeeOrgId: '',
    teamsUserId: '',
    firstName: '',
    lastName: '',
    gender: '',
    email: '',
    empDesignation: {
      id: 0,
      designationName: ''
    },
    reportingManager: '',
    designation: '',
    departmentId: 0,
    createdDateTime: '',
    modifiedDateTime: '',
    createdBy: '',
    modifiedBy: '',
    createdByEmailId: '',
    modifiedByEmailId: '',
    dateOfJoining: '',
  }

  employeeData: Employee[];
  reportingManagerName: string;
  isComponentLoading: boolean = false;
  isEmployeeDataText: boolean = false;

  constructor(private employeeservice: EmployeeService, private toastr: ToastrService,
    private departmentservice: DepartmentService, private router: Router, private designationService: DesignationService,
    private menuItemService: AppMenuItemService,private chRef: ChangeDetectorRef) { }

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
    //   this.router.navigateByUrl('/unauthorized')
    // }

    if (localStorage.getItem('jwtToken') === null) {
      this.router.navigateByUrl('/session-timeout');
    }

    if (localStorage.getItem('userRoleMenuItemPermissionMap') != null) {
      this.userRoleMenuItemsPermissionMap = new Map(Object.entries(JSON.parse(localStorage.getItem('userRoleMenuItemPermissionMap'))));
    }
    //get menu item  details of home page
    var currentMenuItem = await this.getCurrentMenuItemDetails();
    if (this.userRoleMenuItemsPermissionMap.has(currentMenuItem.menuItemId.toString().trim())) {
      //this.noPermissions = false;
      //provide permission to access this component for the logged in user if view permission exists
      //get permissions of this component for the user
      var menuItemPermissions = this.userRoleMenuItemsPermissionMap.get(this.currentMenuItem.menuItemId.toString().trim());
      if (menuItemPermissions.includes('View')) {
        this.viewPermission = true;
        this.getAllEmployees();
        this.getAllDepartments();
        this.Date();
      } else {
        this.viewPermission = false;
      }
      if (menuItemPermissions.includes('Create')) {
        this.createPermission = true;
      } else {
        this.createPermission = false;
        this.addButtonColor = 'lightgrey'
      }
      if (menuItemPermissions.includes('Update')) {
        this.updatePermission = true;
        this.updateButtonColor = '#5590AA';
      } else {
        this.updatePermission = false;
        this.updateButtonColor = 'lightgray';
      }
      if (menuItemPermissions.includes('Delete')) {
        this.deletePermission = true;
      } else {
        this.deletePermission = false;
        this.deleteButtonColor = 'lightgray';
      }
    } else {
      //this.noPermissions = true;
      this.router.navigateByUrl('/unauthorized');
    }

  }

  dataTableInitialized:boolean=false;
  ngAfterViewChecked(): void {
   if(this.employeeDataLoaded&&!this.dataTableInitialized){
        this.table = $('#table').DataTable({
          paging: true,
          searching: true, // Enable search feature
          pageLength: 10,
          stateSave:true,
          order: [[1, 'asc']],
          lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]]
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


  /**
   *  get all employees in DB
   */

  departmentList: Department[] = [];
  employeeCopyData : Employee[]
  employeeDataLoaded:boolean=false;
  getAllEmployees() {
    this.isEmployeeDataText = true;
    this.isComponentLoading = true;
    setTimeout(() => {
      this.isEmployeeDataText = false;
      this.isComponentLoading = false;
    }, 200)
    this.employeeservice.getAll().subscribe({
      next: response => {
          this.employeeData = response.body;
          this.chRef.detectChanges()
          this.employeeCopyData = this.employeeData;
          this.employeeData.map(employee =>{
           for(var i=0; i< this.employeeCopyData.length; i++){
               if(employee.reportingManager === this.employeeCopyData[i].email){
                  employee.reportingManager = this.employeeCopyData[i].firstName+" "+this.employeeCopyData[i].lastName
                }
          }
          this.employeeDataLoaded=true
          })
          this.getAllDepartments()
          this.isEmployeeDataText = false;
          this.isComponentLoading = false;
      },
      error: error => {
        if (error.status === HttpStatusCode.Unauthorized) {
          this.router.navigateByUrl('/session-timeout');
        }
      }
    })
  }


  /***
   * 
   *  create employee
   */
  createdEmployee: Employee;

  createEmployee() {

    let isFirstNameValid = true;
    let isLastNameValid = true;
    let isGenderValid = true;
    let isEmailIdValid = true;
    let isReportingManagerValid = true;
    let isDepartmentValid = true;
    let isDesignationValid = true;
    let isDateofJoining = true;
    let isEmployeeID = true;

    if (!this.isEmployeeFirstNameValid) {

      var valid = this.validateEmployeeFirstName();
      isFirstNameValid = valid;
    }
    if (!this.isEmployeeLasttNameValid) {
      var valid = this.validateEmployeeLastName();
      isLastNameValid = valid;
    }
    if (!this.isEmployeeEmailIdValid) {
      var valid = this.validateEmployeeEmailId();
      isEmailIdValid = valid;

    }
    //if (!this.isEmployeeReportingManagerValid) {
    //  var valid = this.validateEmployeeReportingManager();
    //  isReportingManagerValid = valid;
    //}
    if (!this.isEmployeeDepartmentValid) {
      var valid = this.validateEmployeeDepartment();
      isDepartmentValid = valid;

    }
    if (!this.isEmployeeDesignationtValid) {
      var valid = this.validateEmployeeDesignation();
      isDesignationValid = valid;
    }

    if (!this.isEmployeeGenderValid) {
      var valid = this.validateEmployeeGender();
      isGenderValid = valid;
    }
    if (!this.isEmployeeDateofJoinValid) {
      var valid = this.validateEmployeeDateofJoining();
      isDateofJoining = valid;
    }
    if (!this.isEmployeeIDValid) {
      var valid = this.validateEmployeeID();
      isEmployeeID = valid;
    }


    if (isFirstNameValid == true && isLastNameValid == true && isGenderValid == true
      && isEmailIdValid == true && isReportingManagerValid == true
      && isDepartmentValid == true && isDesignationValid == true && isEmployeeID == true && isDateofJoining == true) {
      this.addEmployee.firstName = this.transformToTitleCase(this.addEmployee.firstName);
      this.addEmployee.lastName = this.transformToTitleCase(this.addEmployee.lastName);
      this.addEmployee.employeeOrgId = this.addEmployee.employeeOrgId.toUpperCase();
      this.addEmployee.email = this.addEmployee.email.toLowerCase();
      this.addEmployee.createdBy = this.transformToTitleCase(localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName'));
      this.addEmployee.createdByEmailId = localStorage.getItem('email').toLowerCase();
      this.employeeservice.createEmployee(this.addEmployee).subscribe({
        next: response => {
          if (response.status == HttpStatusCode.Created) {
            this.createdEmployee = response.body;
            this.toastr.success("Employee added successfully.");
            document.getElementById('closeAddModal').click();
            setTimeout(() => {
              window.location.reload();
            }, 1000)
          }
        },
        error: error => {
          if (error.status === HttpStatusCode.Unauthorized) {
            this.router.navigateByUrl('/session-timeout');
          } else if (error.status === HttpStatusCode.Found) {
            this.toastr.error("Employee email ID '"+ this.addEmployee.email +"' already exists.");
            //document.getElementById('closeAddModal').click();
          } else if (error.status === HttpStatusCode.NotAcceptable) {
            this.toastr.error("Employee '"+ this.addEmployee.employeeOrgId +"' already exists.");
          }else if(error.status === HttpStatusCode.ImUsed){
            this.toastr.error("EmployeeID '"+ this.addEmployee.employeeOrgId +"' is already assigned to another employee.");
          }

          else {
            this.toastr.error('Error occured while creating employee. Please try again !')
          }
        }
      });
    }


  }

  existingEmployee = {

    id: 0,
    employeeOrgId: '',
    teamsUserId: '',
    firstName: '',
    lastName: '',
    gender: '',
    email: '',
    empDesignation: {
      id: 0,
      designationName: ''
    },
    reportingManager: '',
    designation: '',
    departmentId: 0,
    createdDateTime: '',
    modifiedDateTime: '',
    createdBy: '',
    modifiedBy: '',
    createdByEmailId: '',
    modifiedByEmailId: '',
    dateOfJoining: ''
  }

  /**
   * 
   * @param employeeid 
   */
  fetchoneEmployeewithDepartment(employeeid: number) {
    this.employeeservice.getEmployeeWithDepartment(employeeid).subscribe({
      next: response => {
        this.existingEmployee = response.body;
      },
      error: error => {
        if (error.status === HttpStatusCode.Unauthorized) {
          this.router.navigateByUrl('/session-timeout');
        }
      }
    });
    /* for(let employee of this.employeeData){
      for(let department of this.departmentList){
        if(employee.department.departmentId == department.departmentId ){
             employee.department.departmentName = department.departmentName;
        }
      }
    } */
  }

  /**
   *  get all departmentList
   */

  getAllDepartments() {
    var deptId;
    this.departmentservice.getDepartmentList().subscribe(
      response => {
        this.departmentList = response.body;
        this.employeeData = this.employeeCopyData;
        this.employeeData.forEach(employee => {
          this.departmentList.forEach(department => {
            if (employee.departmentId === department.departmentId) {
              employee.departmentName = department.departmentName
            }
          })
        })
      })
  }

  designationList: Designation[];
  /**
   * 
   */
  getAllDesignations() {
    this.designationService.getDesignationList().subscribe({
      next: (response) => {

        if (response.status === HttpStatusCode.Ok) {
          this.designationList = response.body;
        }
      }
    });
  }

  /**
   * remove employee
   */

  removeEmployee(employeeOrgId:string,employeeId : number, user : boolean,email:string ) {
   if(user === true){
      this.toastr.warning("Please delete user with '"+ email+"' to delete employee")
   }else{
    var isconfirmed = window.confirm('Are you sure, you really want to delete the employee ?');

    if (isconfirmed) {

      this.employeeservice.deleteEmployee(employeeId).subscribe({
        next: response => {
          if (response.status == HttpStatusCode.Ok) {
            this.toastr.success("Employee '" + employeeOrgId + "' deleted successfully.");
            setTimeout(() => {
              window.location.reload();
            }, 1000)
          }
        },
        error: error => {
          this.toastr.error("Error occured while deleting employee '" + employeeOrgId+ "'. Please try again !");
        }
      }
      );
    }
    else {
     // this.toastr.warning("Employee '" + employeeOrgId + "' not deleted.");
    }
  }

  }
  /**
   *  update employee
   */

  updateEmployee(employee: any) {

    let isFirstNameValid = true;
    let isLastNameValid = true;
    let isGenderValid = true;
    let isEmailIdValid = true;
    let isReportingManagerValid = true;
    let isDepartmentValid = true;
    let isDesignationValid = true;
    let isEmployeeIDValid = true;
    let isDateofJoiningValid = true;

    if (!this.isUpdateFirstNameValid) {

      var valid = this.validateUpdateFirstName();
      isFirstNameValid = valid;
    }
    if (!this.isUpdateLastNameValid) {
      var valid = this.validateUpdateLastName();
      isLastNameValid = valid;
    }

    if (!this.isUpdateEmployeeGenderValid) {
      var valid = this.validateUpdateEmployeeGender();
      isGenderValid = valid;
    }

    if (!this.isUpdateEmailIdValid) {
      var valid = this.validateUpdateEmailId();
      isEmailIdValid = valid;

    }
    //if (!this.isUpdateReportingManagerValid) {
    //  var valid = this.validateUpdateReportingManager();
    //  isReportingManagerValid = valid;
    //}
    if (!this.isUpdateDepartmentValid) {
      var valid = this.validateUpdateDepartment();
      isDepartmentValid = valid;

    }
    if (!this.isUpdateDesignationValid) {
      var valid = this.validateUpdateDesignation();
      isDesignationValid = valid;
    }
    if (!this.isUpdateEmployeeIDValid) {
      var valid = this.validateUpdateEmployeeID();
      isEmployeeIDValid = valid;
    }
    if (!this.isUpdateDateofJoin) {
      var valid = this.validateUpdateDateofJoining();
      isDateofJoiningValid = valid;
    }

    if (isEmailIdValid == true && isFirstNameValid == true && isReportingManagerValid == true
      && isLastNameValid == true && isDepartmentValid == true && isGenderValid == true &&
      isDesignationValid == true && isDateofJoiningValid == true && isEmployeeIDValid == true) {

      this.existingEmployee.firstName = this.transformToTitleCase(this.existingEmployee.firstName);
      this.existingEmployee.lastName = this.transformToTitleCase(this.existingEmployee.lastName);
      this.existingEmployee.employeeOrgId = this.existingEmployee.employeeOrgId.toUpperCase();

      this.existingEmployee.modifiedBy = localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName');
      this.employeeservice.updateEmployee(this.existingEmployee).subscribe({
        next: response => {
          var employeerecord = response.body;
          if (response.status == HttpStatusCode.Created) {
            this.toastr.success("Employee '"+ this.existingEmployee.employeeOrgId +"' updated successfully.");
            document.getElementById('closeUpdateModal').click();
            setTimeout(() => {
              window.location.reload();
            }, 1000)
          }
          else if (response.status == HttpStatusCode.NotAcceptable) {
            this.toastr.error("Employee '"+ this.existingEmployee.employeeOrgId +"' already exists.");
          }
          else {
            this.toastr.error("Error occured while updating employee '" + this.existingEmployee.id+"'. Please try again !");
          }
        },
        error: error => {
          if(error.status === HttpStatusCode.ImUsed){
            this.toastr.error("EmployeeID '"+ this.existingEmployee.employeeOrgId +"' is already assigned to another employee.");
          }
        }
      })
    }
  }

  /**
   * 
   * validations for create Employee
   * 
   */
  isEmployeeFirstNameValid = false;
  isEmployeeLasttNameValid = false;
  isEmployeeEmailIdValid = false;
  isEmployeeReportingManagerValid = false;
  isEmployeeDepartmentValid = false;
  isEmployeeDesignationtValid = false;

  employeeFirstNameErrorInfo = '';
  validateEmployeeFirstName() {
    const regex = /^\S.*[a-zA-Z\s]*$/;
    const regex2 = /^[A-Za-z ]+$/;

    if (this.addEmployee.firstName == '' || this.addEmployee.firstName.trim() === "" || regex.exec(this.addEmployee.firstName) === null) {
      this.employeeFirstNameErrorInfo = "First Name is required.";
      this.isEmployeeFirstNameValid = false;
    } else if (regex2.test(this.addEmployee.firstName) === false) {
      this.employeeFirstNameErrorInfo = "First Name cannot have special characters or numbers.";
      this.isEmployeeFirstNameValid = false;
    }
    else if (this.addEmployee.firstName.length < 4) {
      this.employeeFirstNameErrorInfo = "First Name should have min of 4 characters.";
      this.isEmployeeFirstNameValid = false;

    }
    else if (this.addEmployee.firstName.length > 30) {
      this.employeeFirstNameErrorInfo = "First Name should not exceed more than 30 characters.";
      this.isEmployeeFirstNameValid = false;

    }
    else {
      this.employeeFirstNameErrorInfo = "";
      this.isEmployeeFirstNameValid = true;
    }
    return this.isEmployeeFirstNameValid;

  }
  employeeLastNameErrorInfo = "";
  validateEmployeeLastName() {
    const regex = /^\S.*[a-zA-Z\s]*$/;
    const regex2 = /^[A-Za-z ]+$/;

    if (this.addEmployee.lastName == '' || this.addEmployee.lastName.trim() === "" || regex.exec(this.addEmployee.lastName) === null) {
      this.employeeLastNameErrorInfo = "Last Name is required.";
      this.isEmployeeLasttNameValid = false;
    } else if (regex2.test(this.addEmployee.lastName) === false) {
      this.employeeLastNameErrorInfo = "Last Name cannot have special characters or numbers.";
      this.isEmployeeLasttNameValid = false;
    }
    else if (this.addEmployee.lastName.length > 30) {
      this.employeeLastNameErrorInfo = "Last Name should not exceed more than 30 characters.";
      this.isEmployeeFirstNameValid = false;

    }
    else if (this.addEmployee.lastName.length == 0) {
      this.employeeLastNameErrorInfo = "Last Name should have min of 1 character.";
      this.isEmployeeLasttNameValid = false;

    }
    else {
      this.employeeLastNameErrorInfo = "";
      this.isEmployeeLasttNameValid = true;
    }

    return this.isEmployeeLasttNameValid;
  }

  employeeGenderErrorInfo = '';
  isEmployeeGenderValid = false;

  validateEmployeeGender() {
    if (this.addEmployee.gender === '') {
      this.isEmployeeGenderValid = false;
      this.employeeGenderErrorInfo = 'Gender is required.';
    } else {
      this.isEmployeeGenderValid = true;
      this.employeeGenderErrorInfo = ''
    }
    return this.isEmployeeGenderValid;
  }

  employeeEmailIdErrorInfo = "";
  validateEmployeeEmailId() {
    var emailRegExp = /^[A-Za-z0-9._]{2,30}[0-9]{0,9}@[A-Za-z]{3,12}[.]{1}[A-Za-z.]{2,6}$/;
    if (this.addEmployee.email == '' || emailRegExp.test(this.addEmployee.email) === false) {
      this.employeeEmailIdErrorInfo = "Email ID is required.";
      this.isEmployeeEmailIdValid = false;
    }
    else {
      this.employeeEmailIdErrorInfo = "";
      this.isEmployeeEmailIdValid = true;
    }
    return this.isEmployeeEmailIdValid;
  }

  employeeReportingManagerErrorInfo = "";
  //validateEmployeeReportingManager() {

  // if (this.addEmployee.reportingManager == '' || this.addEmployee.reportingManager===null) {
  //   this.employeeReportingManagerErrorInfo = "Reporting Manager is required";
  //    this.isEmployeeReportingManagerValid = false;
  // }
  // else {
  //   this.employeeReportingManagerErrorInfo = "";
  //  this.isEmployeeReportingManagerValid = true;
  // }
  // return this.isEmployeeReportingManagerValid;
  //}

  employeeDepartmentErrorInfo = "";
  validateEmployeeDepartment() {
    if (this.addEmployee.departmentId < 1) {
      this.employeeDepartmentErrorInfo = "Department is required."
      this.isEmployeeDepartmentValid = false;

    }
    else {
      this.employeeDepartmentErrorInfo = "";
      this.isEmployeeDepartmentValid = true;
    }
    return this, this.isEmployeeDepartmentValid;

  }

  employeeDesignationErrorInfo = "";

  validateEmployeeDesignation() {

    if (this.addEmployee.empDesignation.id == 0) {
      this.employeeDesignationErrorInfo = "Designation is required."
      this.isEmployeeDesignationtValid = false;
    }
    else {
      this.employeeDesignationErrorInfo = "";
      this.isEmployeeDesignationtValid = true;
    }
    return this.isEmployeeDesignationtValid;
  }

  /**
   * clear Error Message
   */

  clearErrorMessages() {

    $(".modal-body input").val("")
    this.employeeFirstNameErrorInfo = '';
    this.employeeLastNameErrorInfo = '';
    this.employeeEmailIdErrorInfo = '';
    this.employeeDepartmentErrorInfo = '';
    this.employeeDesignationErrorInfo = '';
    this.employeeReportingManagerErrorInfo = '';
    this.employeeGenderErrorInfo = '';
    this.isEmployeeDateofJoinErrorInfo = '';
    this.isEmployeeIDErrorInfo = '';

    this.isEmployeeFirstNameValid = false;
    this.isEmployeeLasttNameValid = false;
    this.isEmployeeEmailIdValid = false;
    this.isEmployeeDepartmentValid = false;
    this.isEmployeeDesignationtValid = false;
    this.isEmployeeGenderValid = false;
    this.isEmployeeReportingManagerValid = false;


    this.addEmployee.firstName = '';
    this.addEmployee.lastName = '';
    this.addEmployee.gender = '';
    this.addEmployee.email = '';
    this.addEmployee.reportingManager = '';
    this.addEmployee.departmentId = 0;
    this.addEmployee.empDesignation.id = 0;
    this.addEmployee.dateOfJoining = '';
    this.addEmployee.employeeOrgId = '';

  }
  clearUpdateErrorMessages() {
    this.updateFirstNameErrorInfo = "";
    this.updateLastNameErrorInfo = "";
    this.updateEmailIdErrorInfo = "";
    this.updateReportingManagerErrorInfo = '';
    this.updateDepartmentErrorInfo = "";
    this.updateDesignationErrorInfo = "";
    this.isUpdateDateofJoinErrorInfo = "";
    this.isUpdateEmployeeIDErrorInfo = "";
  }
  /**
   * update employee Validations
   */

  isUpdateFirstNameValid = false;
  isUpdateLastNameValid = false;
  isUpdateEmailIdValid = false;
  isUpdateReportingManagerValid = false;
  isUpdateDepartmentValid = false;
  isUpdateDesignationValid = false;

  updateFirstNameErrorInfo = "";

  validateUpdateFirstName() {
    const regex = /^\S.*[a-zA-Z\s]*$/;
    const regex2 = /^[A-Za-z ]+$/;

    if (this.existingEmployee.firstName == '' || this.existingEmployee.firstName.trim() === "" || regex.exec(this.existingEmployee.firstName) === null) {
      this.updateFirstNameErrorInfo = "First Name is required.";
      this.isUpdateFirstNameValid = false;
    } else if (regex2.test(this.existingEmployee.firstName) === false) {
      this.updateFirstNameErrorInfo = "First Name cannot have special characters or numbers.";
      this.isUpdateFirstNameValid = false;
    }
    else if (this.existingEmployee.firstName.length < 4) {
      this.updateFirstNameErrorInfo = "First Name should have min of 4 characters.";
      this.isUpdateFirstNameValid = false;
    }
    else if (this.existingEmployee.firstName.length > 30) {
      this.updateFirstNameErrorInfo = "First Name should not exceed more than 30 characters.";
      this.isUpdateFirstNameValid = false;

    }
    else {
      this.updateFirstNameErrorInfo = "";
      this.isUpdateFirstNameValid = true;
    }
    return this.isUpdateFirstNameValid;
  }
  updateLastNameErrorInfo = "";
  validateUpdateLastName() {
    const regex = /^\S.*[a-zA-Z\s]*$/;
    const regex2 = /^[A-Za-z ]+$/;

    if (this.existingEmployee.lastName == '' || this.existingEmployee.lastName.trim() === "" || regex.exec(this.existingEmployee.lastName) === null) {
      this.updateLastNameErrorInfo = "Last Name is required.";
      this.isUpdateLastNameValid = false;
    } else if (regex2.test(this.existingEmployee.lastName) === false) {
      this.updateLastNameErrorInfo = "Last Name cannot have special characters or numbers.";
      this.isUpdateLastNameValid = false;
    }
    else if (this.existingEmployee.lastName.length == 0) {
      this.updateLastNameErrorInfo = "Last Name should have min of 1 character.";
      this.isUpdateLastNameValid = false;
    }
    else if (this.existingEmployee.lastName.length > 30) {
      this.updateLastNameErrorInfo = "First Name should not exceed more than 30 characters.";
      this.isUpdateLastNameValid = false;

    }
    else {
      this.updateLastNameErrorInfo = "";
      this.isUpdateLastNameValid = true;
    }
    return this.isUpdateLastNameValid;
  }

  updateGenderErrorInfo = '';
  isUpdateEmployeeGenderValid = false;
  validateUpdateEmployeeGender() {
    if (this.existingEmployee.gender === '') {
      this.isUpdateEmployeeGenderValid = false;
      this.updateGenderErrorInfo = 'Gender is required.';
    } else {
      this.isUpdateEmployeeGenderValid = true;
      this.updateGenderErrorInfo = ''
    }
    return this.isUpdateEmployeeGenderValid;
  }

  updateEmailIdErrorInfo = "";
  validateUpdateEmailId() {
    var emailRegExp = /^[A-Za-z0-9._]{2,30}[0-9]{0,9}@[A-Za-z]{3,12}[.]{1}[A-Za-z.]{2,6}$/;
    if (this.existingEmployee.email == '' || emailRegExp.test(this.existingEmployee.email) === false) {
      this.updateEmailIdErrorInfo = "Email ID is required.";
      this.isUpdateEmailIdValid = false;
    }
    else if (this.existingEmployee.email.length < 10) {
      this.updateEmailIdErrorInfo = "Email ID is required.";
      this.isUpdateEmailIdValid = false;
    }
    else {
      this.updateEmailIdErrorInfo = "";
      this.isUpdateEmailIdValid = true;
    }
    return this.isUpdateEmailIdValid;

  }
  updateReportingManagerErrorInfo = "";
  //  validateUpdateReportingManager() {

  //    if (this.existingEmployee.reportingManager === '') {
  //      this.updateReportingManagerErrorInfo = "Reporting Manager is required";
  //     this.isUpdateReportingManagerValid = false;
  //    }
  //  else {
  //    this.updateReportingManagerErrorInfo = "";
  //   this.isUpdateReportingManagerValid = true;

  // }
  //  return this.isUpdateReportingManagerValid;
  //  }
  updateDepartmentErrorInfo = "";
  validateUpdateDepartment() {
    if (this.existingEmployee.departmentId <= 0) {
      this.updateDepartmentErrorInfo = "Department is required.";
      this.isUpdateDepartmentValid = false;
    }
    else {
      this.updateDepartmentErrorInfo = "";
      this.isUpdateDepartmentValid = true;
    }
    return this.isUpdateDepartmentValid;


  }
  updateDesignationErrorInfo = "";
  validateUpdateDesignation() {

    if (this.existingEmployee.empDesignation.id <= 0) {
      this.updateDesignationErrorInfo = "Designation is required.";
      this.isUpdateDesignationValid = false;
    }
    else {
      this.updateDesignationErrorInfo = "";
      this.isUpdateDesignationValid = true;
    }
    return this.isUpdateDesignationValid;

  }

  /** check the selected checkboxes to delete */

  /**
   * 
   */
  checkCheckBoxes() {
    var employeeIdsToBeDeleted = [];
    var table = document.getElementById("table");
    //for(var i=0; i<tables.length; i++){
    var rows = table.getElementsByClassName("trbody");
    var value: number[];
    // Loop through each row
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var checkbox = row.querySelector("input[type='checkbox']") as HTMLInputElement;
      // Check if the checkbox exists in the row
      if (checkbox) {
        // Check the 'checked' property to get the state (true or false)
        if (checkbox.checked) {
          employeeIdsToBeDeleted.push(checkbox.value);
        }
      }

    }
    this.deleteEmployeesById(employeeIdsToBeDeleted);
  }

  /**
   * 
   * @param employee 
   */
  employeeDataView : EmployeeVO;
  employeeDataView1 : any[] = []
  employeeRecordCount : number =0;
  data : any =0;
  count1 : any;
  countedData : any =0;
  async deleteEmployeesById(ids: any[]): Promise<void> {
    if(ids.length<1){
      this.toastr.error("Please select atleast one employee to delete")
    }
    else{
    const isConfirmed = window.confirm("Are you sure, you really want to delete selected employees?");
    if (isConfirmed) {
      this.countedData =0;
      try {
        const promises: Promise<void>[] = ids.map(async (id) => {
          const response = await this.employeeservice.getEmployeeWithDepartment(id).toPromise();
          const employeeDataView = response.body;
          if (employeeDataView.user === true) {
            this.countedData = this.countedData + 1;
          }
        });
   
        await Promise.all(promises);
        if(this.countedData >0){
          this.toastr.warning("Please delete user profile of the employees before you delete employee");
        }
        else{
          this.employeeservice.deleteAllEmployee(ids).subscribe(
              response => {
                if (response.status == HttpStatusCode.Ok) {
                  this.toastr.success('Employees deleted successfully.');
                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                } else {
                  this.toastr.error("Error occurred while deleting employees. Please try again !");
                }
              }
            );
        }
      } catch (error) {
        console.error("Error occurred:", error);
      }
    } else {
      //this.toastr.warning("Employees not deleted.");
    }
  }
  }
  
  getCountOfUsersActive(value : boolean){
    if(value === true){
      this.countedData = this.countedData+1;
    }
    return this.countedData

  }

  /**
   * 
   */
  checkSubCheckBoxes() {
    if ($('#mainCheckBox').is(':checked')) {
      $('.subCheckBox').prop('checked', true);
    } else {
      $('.subCheckBox').prop('checked', false);
    }
  }

  /**
   * 
   * @param index 
   */
  toggleMainCheckBox(index: number) {
    if (!$('#ac-check' + index).is(':checked')) {
      $('.mainCheckBox').prop('checked', false);
    }
    const anyUnchecked = $('.subCheckBox:not(:checked)').length > 0;
    $('#mainCheckBox').prop('checked', !anyUnchecked);

  }
  isEmployeeIDValid = false;
  isEmployeeIDErrorInfo = '';
  validateEmployeeID() {
    const regex = /^\S.*[a-zA-Z\s]*$/;
    const regex2 = /[a-zA-Z0-9]+/;
    if (this.addEmployee.employeeOrgId == '' || this.addEmployee.employeeOrgId.trim() === "" || regex.exec(this.addEmployee.employeeOrgId) === null || regex2.exec(this.addEmployee.employeeOrgId) === null) {
      this.isEmployeeIDValid = false;
      this.isEmployeeIDErrorInfo = 'Employee ID is required.';
    } else if (this.addEmployee.employeeOrgId.length < 1) {
      this.isEmployeeIDValid = false;
      this.isEmployeeIDErrorInfo = 'Employee ID should have min of 1 characters.';
    } else if (this.addEmployee.employeeOrgId.length > 20) {
      this.isEmployeeIDValid = false;
      this.isEmployeeIDErrorInfo = 'Employee ID should not  exceed  20 characters.';
    }
    else {
      this.isEmployeeIDValid = true;
      this.isEmployeeIDErrorInfo = '';
    }
    return this.isEmployeeIDValid;

  }
  isEmployeeDateofJoinValid = false;
  isEmployeeDateofJoinErrorInfo = '';
  validateEmployeeDateofJoining() {
    const selectedDate = new Date(this.addEmployee.dateOfJoining);
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 30);
    const maxDate = new Date();
    maxDate.setMonth(11);
    maxDate.setDate(31);

    if (this.addEmployee.dateOfJoining == '' || this.addEmployee.dateOfJoining == null) {
      this.isEmployeeDateofJoinValid = false;
      this.isEmployeeDateofJoinErrorInfo = 'Date of Joining is required.';
    } else if (selectedDate < minDate || selectedDate > maxDate) {
      this.isEmployeeDateofJoinErrorInfo = 'Set correct date or month.';
      this.isEmployeeDateofJoinValid = false;
    } else {
      this.isEmployeeDateofJoinValid = true;
      this.isEmployeeDateofJoinErrorInfo = '';
    }
    return this.isEmployeeDateofJoinValid;

  }
  isUpdateEmployeeIDValid = false;
  isUpdateEmployeeIDErrorInfo = '';
  validateUpdateEmployeeID() {
    const regex = /^\S.*[a-zA-Z\s]*$/;
    const regex2 = /[a-zA-Z0-9]+/;
    if (this.existingEmployee.employeeOrgId == '' || this.existingEmployee.employeeOrgId.trim() === "" || regex.exec(this.existingEmployee.employeeOrgId) === null || regex2.exec(this.existingEmployee.employeeOrgId) === null) {
      this.isUpdateEmployeeIDValid = false;
      this.isUpdateEmployeeIDErrorInfo = 'Employee ID is required.';
    } else if (this.existingEmployee.employeeOrgId.length < 1) {
      this.isUpdateEmployeeIDValid = false;
      this.isUpdateEmployeeIDErrorInfo = 'Employee ID should have min of 1 characters.';
    } else if (this.existingEmployee.employeeOrgId.length > 20) {
      this.isUpdateEmployeeIDValid = false;
      this.isUpdateEmployeeIDErrorInfo = 'Employee ID should not  exceed  20 characters.';
    }
    else {
      this.isUpdateEmployeeIDValid = true;
      this.isUpdateEmployeeIDErrorInfo = '';
    }
    return this.isUpdateEmployeeIDValid;


  }
  isUpdateDateofJoin = false;
  isUpdateDateofJoinErrorInfo = '';
  validateUpdateDateofJoining() {
    const selectedDate = new Date(this.existingEmployee.dateOfJoining);
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 30);
    const maxDate = new Date();
    maxDate.setMonth(11);
    maxDate.setDate(31);

    if (this.existingEmployee.dateOfJoining == '' || this.existingEmployee.dateOfJoining == null) {
      this.isUpdateDateofJoin = false;
      this.isUpdateDateofJoinErrorInfo = 'Date of Joining is required.';
    } else if (selectedDate < minDate || selectedDate > maxDate) {
      this.isUpdateDateofJoinErrorInfo = 'Set correct date or month.';
      this.isUpdateDateofJoin = false;
    } else {
      this.isUpdateDateofJoin = true;
      this.isUpdateDateofJoinErrorInfo = '';
    }
    return this.isUpdateDateofJoin;

  }

  Date() {
    const datePicker = document.getElementById('datePicker');

    // Calculate the minimum date (30 years ago)
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 30);

    // Calculate the maximum date (end of the current year)
    const maxDate = new Date();
    maxDate.setMonth(11); // December
    maxDate.setDate(31); // Last day of the month

    datePicker.setAttribute('min', minDate.toISOString().split('T')[0]);
    datePicker.setAttribute('max', maxDate.toISOString().split('T')[0]);
  }

  transformToTitleCase(text: string): string {
    return text.toLowerCase().split(' ').map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  }

  currentMenuItem: MenuItem;
  async getCurrentMenuItemDetails(): Promise<MenuItem> {
    const response = await lastValueFrom(this.menuItemService.findMenuItemByName('Employees')).then(response => {
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

}
