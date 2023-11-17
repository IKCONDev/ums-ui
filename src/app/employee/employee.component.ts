import { Component, Output, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
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

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit, OnDestroy, AfterViewInit {

  loggedInUserRole = localStorage.getItem('userRole');
  @Output() title: string = 'Employees';

  private table: any;

  addEmployee = {
    id: 0,
    employeeOrgId: '',
    teamsUserId: '',
    firstName: '',
    lastName: '',
    gender:'',
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
    dateOfJoining :'',
  }

  employeeData: Employee[];
  reportingManagerName: string;

  constructor(private employeeservice: EmployeeService, private toastr: ToastrService,
    private departmentservice: DepartmentService, private router: Router, private designationService: DesignationService) { }

  ngOnInit(): void {

    if(this.loggedInUserRole != 'ADMIN' && this.loggedInUserRole != 'SUPER_ADMIN'){
      this.router.navigateByUrl('/unauthorized')
    }

    this.getAllEmployees();
    this.getAllDepartments();

  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      $(document).ready(() => {
        this.table = $('#table').DataTable({
          paging: true,
          searching: true, // Enable search feature
          pageLength: 7,
          order: [[1,'asc']]
          // Add other options here as needed
        });
      });
    },100)
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
  getAllEmployees() {
    this.employeeservice.getAll().subscribe({
      next: response => {
        this.employeeData = response.body;
        console.log(this.employeeData);
      },
      error: error => {
        if(error.status === HttpStatusCode.Unauthorized){
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

    if(!this.isEmployeeGenderValid){
      var valid = this.validateEmployeeGender();
      isGenderValid = valid;
    }
    if(!this.isEmployeeDateofJoinValid){
      var valid = this.validateEmployeeDateofJoining();
      isDateofJoining = valid;
    }
    if(!this.isEmployeeIDValid){
      var valid = this.validateEmployeeID();
      isEmployeeID = valid;
    }


    if (isFirstNameValid == true && isLastNameValid == true && isGenderValid == true
      && isEmailIdValid == true && isReportingManagerValid == true 
      && isDepartmentValid == true && isDesignationValid == true && isEmployeeID == true && isDateofJoining == true) {

      console.log(this.addEmployee);
      this.addEmployee.createdBy = localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName');
      this.addEmployee.createdByEmailId = localStorage.getItem('email').toLowerCase();
      this.employeeservice.createEmployee(this.addEmployee).subscribe({
        next: response => {
          if (response.status == HttpStatusCode.Created) {
            this.createdEmployee = response.body;
            this.toastr.success("Employee created successfully");
            document.getElementById('closeAddModal').click();
            setTimeout(() => {
              window.location.reload();
            }, 1000)
          }
        },
        error: error => {
          if(error.status === HttpStatusCode.Unauthorized){
            this.router.navigateByUrl('/session-timeout');
          }else if(error.status === HttpStatusCode.Found){
            this.toastr.error('Employee email ID '+this.addEmployee.email+' already exists');
            document.getElementById('closeAddModal').click();
          }else{
            this.toastr.error('Error while creating employee. please try again !')
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
    gender:'',
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
    dateOfJoining:''
  }

  /**
   * 
   * @param employeeid 
   */
  fetchoneEmployeewithDepartment(employeeid: number) {

    this.employeeservice.getEmployeeWithDepartment(employeeid).subscribe({
      next: response => {
        this.existingEmployee = response.body;
        console.log(this.existingEmployee);
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
             console.log(employee.department.departmentName);
        }
      }
    } */
  }

  /**
   *  get all departmentList
   */

  getAllDepartments() {
    this.departmentservice.getDepartmentList().subscribe(
      response => {
        this.departmentList = response.body;
        console.log(this.departmentList);
      })
      this.employeeservice.getAll().subscribe({
       next: response => {
         var employeeList: Employee[] = response.body;
         this.employeeData = employeeList;
         this.employeeData.forEach(employee => {
          this.departmentList.forEach(department => {
            if(employee.departmentId === department.departmentId){
              console.log(true)
              employee.departmentName = department.departmentName
            }
          })
        })
       } 
      })
  }

  designationList: Designation[];
  /**
   * 
   */
  getAllDesignations() {
    console.log("method started");
    this.designationService.getDesignationList().subscribe({
      next: (response) => {

        if (response.status === HttpStatusCode.Ok) {
          this.designationList = response.body;
          console.log(this.designationList);

        }
      }
    });
  }
  
  /**
   * remove employee
   */

  removeEmployee(employeeId: number) {
    var isconfirmed = window.confirm('Are you sure, you really want to delete the employee ?');

    if (isconfirmed) {

      this.employeeservice.deleteEmployee(employeeId).subscribe({
        next: response => {
          if (response.status == HttpStatusCode.Ok) {
            this.toastr.success('Employee ' +employeeId+' deleted successfully');
            setTimeout(() => {
              window.location.reload();
            }, 1000)
          }
        },
        error: error => {
          this.toastr.error("Error occured while deleting employee "+employeeId);
          console.log("error occured");
        }
      }
      );
    }
    else {
      this.toastr.warning('Employee ' +employeeId+ ' not deleted');
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

    if(!this.isUpdateEmployeeGenderValid){
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
    if(!this.isUpdateEmployeeIDValid){
      var valid = this.validateUpdateEmployeeID();
      isEmployeeIDValid = valid;
    }
    if(!this.isUpdateDateofJoin){
      var valid = this.validateUpdateDateofJoining();
      isDateofJoiningValid = valid;
    }

    if (isEmailIdValid == true && isFirstNameValid == true && isReportingManagerValid == true
       && isLastNameValid == true && isDepartmentValid == true && isGenderValid == true &&
      isDesignationValid == true && isDateofJoiningValid == true && isEmployeeIDValid == true) {
      this.existingEmployee.modifiedBy = localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName');
      this.employeeservice.updateEmployee(this.existingEmployee).subscribe(
        response => {
          var employeerecord = response.body;
          if (response.status == HttpStatusCode.Created) {
            this.toastr.success('Employee '+this.existingEmployee.id+' updated successfully');
            document.getElementById('closeUpdateModal').click();
            setTimeout(() => {
              window.location.reload();
            },1000)
          }
          else {
            this.toastr.error("Error occured while updating employee "+this.existingEmployee.id);
          }
        }
      )

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

    if (this.addEmployee.firstName == '' || this.addEmployee.firstName.trim() === "" || regex.exec(this.addEmployee.firstName) === null) {
      this.employeeFirstNameErrorInfo = "First Name is required";
      this.isEmployeeFirstNameValid = false;
    }
    else if (this.addEmployee.firstName.length < 4) {
      this.employeeFirstNameErrorInfo = "First Name is required";
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

    if (this.addEmployee.lastName == '' || this.addEmployee.lastName.trim() === "" || regex.exec(this.addEmployee.lastName) === null) {
      this.employeeLastNameErrorInfo = "Last Name is required";
      this.isEmployeeLasttNameValid = false;
    }
    else if (this.addEmployee.lastName.length > 1) {
      this.employeeLastNameErrorInfo = "";
      this.isEmployeeLasttNameValid = true;

    }
    else {
      this.employeeLastNameErrorInfo = "";
      this.isEmployeeLasttNameValid = true;
    }

    return this.isEmployeeLasttNameValid;
  }

  employeeGenderErrorInfo = '';
  isEmployeeGenderValid = false;

  validateEmployeeGender(){
    if(this.addEmployee.gender === ''){
      this.isEmployeeGenderValid = false;
      this.employeeGenderErrorInfo = 'Gender is required';
    }else{
      this.isEmployeeGenderValid = true;
      this.employeeGenderErrorInfo = ''
    }
    return this.isEmployeeGenderValid;
  }

  employeeEmailIdErrorInfo = "";
  validateEmployeeEmailId() {
    var emailRegExp = /^[A-Za-z0-9._]{2,30}[0-9]{0,9}@[A-Za-z]{3,12}[.]{1}[A-Za-z.]{2,6}$/;
    if (this.addEmployee.email == '' || emailRegExp.test(this.addEmployee.email) === false) {
      this.employeeEmailIdErrorInfo = "Email ID is required";
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
      this.employeeDepartmentErrorInfo = "Department is required"
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
      this.employeeDesignationErrorInfo = "Designation is required"
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
    this.isEmployeeDateofJoinErrorInfo ='';
    this.isEmployeeIDErrorInfo = '';

    this.isEmployeeFirstNameValid=false;
    this.isEmployeeLasttNameValid=false;
    this.isEmployeeEmailIdValid=false;
    this.isEmployeeDepartmentValid=false;
    this.isEmployeeDesignationtValid=false;
    this.isEmployeeGenderValid=false;
    this.isEmployeeReportingManagerValid=false;
  

    this.addEmployee.firstName = '' ;
    this.addEmployee.lastName ='';
    this.addEmployee.gender='';
    this.addEmployee.email = '';
    this.addEmployee.reportingManager = '';
    this.addEmployee.departmentId=0;
    this.addEmployee.empDesignation.id=0;
    this.addEmployee.dateOfJoining ='';
    this.addEmployee.employeeOrgId = '';

  }
  clearUpdateErrorMessages(){
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

    if (this.existingEmployee.firstName == '' || this.existingEmployee.firstName.trim() === "" || regex.exec(this.existingEmployee.firstName) === null) {
      this.updateFirstNameErrorInfo = "First Name is required";
      this.isUpdateFirstNameValid = false;
    }
    else if (this.existingEmployee.firstName.length < 5) {
      this.updateFirstNameErrorInfo = "First Name is required";
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

    if (this.existingEmployee.lastName == '' || this.existingEmployee.lastName.trim() === "" || regex.exec(this.existingEmployee.lastName) === null) {
      this.updateLastNameErrorInfo = "Last Name is required";
      this.isUpdateLastNameValid = false;
    }
    else if (this.existingEmployee.lastName.length < 1) {
      this.updateLastNameErrorInfo = "Last Name is required";
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
  validateUpdateEmployeeGender(){
    if(this.existingEmployee.gender === ''){
      this.isUpdateEmployeeGenderValid = false;
      this.updateGenderErrorInfo = 'Gender is required';
    }else{
      this.isUpdateEmployeeGenderValid = true;
      this.updateGenderErrorInfo = ''
    }
    return this.isUpdateEmployeeGenderValid;
  }

  updateEmailIdErrorInfo = "";
  validateUpdateEmailId() {
    var emailRegExp = /^[A-Za-z0-9._]{2,30}[0-9]{0,9}@[A-Za-z]{3,12}[.]{1}[A-Za-z.]{2,6}$/;
    if (this.existingEmployee.email == '' || emailRegExp.test(this.existingEmployee.email) === false) {
      this.updateEmailIdErrorInfo = "Email ID is required";
      this.isUpdateEmailIdValid = false;
    }
    else if (this.existingEmployee.email.length < 10) {
      this.updateEmailIdErrorInfo = "Email ID is required";
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
      this.updateDepartmentErrorInfo = "Department is required";
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
      this.updateDesignationErrorInfo = "Designation is required";
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
    console.log(table)
    //for(var i=0; i<tables.length; i++){
    var rows = table.getElementsByClassName("trbody");
    var value: number[];
    // Loop through each row
    for (var i = 0; i < rows.length; i++) {

      var row = rows[i];
      console.log("the value is" + rows[i]);

      var checkbox = row.querySelector("input[type='checkbox']") as HTMLInputElement;
      console.log(checkbox)
      // Check if the checkbox exists in the row
      if (checkbox) {

        console.log("value of checkbox is " + checkbox.value);
        // Check the 'checked' property to get the state (true or false)
        if (checkbox.checked) {
          console.log("the checkbox is selected");
          employeeIdsToBeDeleted.push(checkbox.value);
        }
      }

    }
    console.log(employeeIdsToBeDeleted);
    this.deleteEmployeesById(employeeIdsToBeDeleted);
  }

  /**
   * 
   * @param employee 
   */
  deleteEmployeesById(ids: any[]) {
    var isconfirmed = window.confirm("Are you sure, you really want to delete selected employees?");
    if (isconfirmed) {

      this.employeeservice.deleteAllEmployee(ids).subscribe(
        response => {
          if (response.status == HttpStatusCode.Ok) {
            this.toastr.success('Employees deleted successfully');
            setTimeout(() => {
              window.location.reload();
            }, 1000)
          }
          else {
            this.toastr.error("Error while deleting employees... Please try again !");
          }
        }
      )

    }
    else {
      this.toastr.warning("Employees not deleted");

    }
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
  }
  isEmployeeIDValid = false;
  isEmployeeIDErrorInfo = '';
  validateEmployeeID(){
    if(this.addEmployee.employeeOrgId == ''){
      this.isEmployeeIDValid = false;
      this.isEmployeeIDErrorInfo = 'Employee ID is required';
    }
    else{
      this.isEmployeeIDValid = true;
      this.isEmployeeIDErrorInfo = '';
    }
    return this.isEmployeeIDValid;

  }
  isEmployeeDateofJoinValid = false;
  isEmployeeDateofJoinErrorInfo = '';
  validateEmployeeDateofJoining(){

    if(this.addEmployee.dateOfJoining == '' || this.addEmployee.dateOfJoining == null){
      this.isEmployeeDateofJoinValid = false;
      this.isEmployeeDateofJoinErrorInfo = 'Date of Joining is required';
    }
    else{
      this.isEmployeeDateofJoinValid = true;
      this.isEmployeeDateofJoinErrorInfo = '';
    }
    return this.isEmployeeDateofJoinValid;

  }
  isUpdateEmployeeIDValid = false;
  isUpdateEmployeeIDErrorInfo = '';
  validateUpdateEmployeeID(){
  
    if(this.existingEmployee.employeeOrgId == ''){
      this.isUpdateEmployeeIDValid = false;
      this.isUpdateEmployeeIDErrorInfo = 'Employee ID is required';
    }
    else{
      this.isUpdateEmployeeIDValid = true;
      this.isUpdateEmployeeIDErrorInfo = '';
    }
    return this.isUpdateEmployeeIDValid;


  }
  isUpdateDateofJoin = false;
  isUpdateDateofJoinErrorInfo = '';
  validateUpdateDateofJoining(){

    if(this.existingEmployee.dateOfJoining == '' || this.existingEmployee.dateOfJoining == null){
      this.isUpdateDateofJoin = false;
      this.isUpdateDateofJoinErrorInfo = 'Date of Joining is required';
    }
    else{
      this.isUpdateDateofJoin = true;
      this.isUpdateDateofJoinErrorInfo = '';
    }
    return this.isUpdateDateofJoin;
    
  }


}
