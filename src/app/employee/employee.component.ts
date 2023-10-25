import { Component, Output ,OnInit,AfterViewInit,OnDestroy } from '@angular/core';
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
export class EmployeeComponent implements OnInit,OnDestroy, AfterViewInit{
  
  @Output() title:string='Employees';

  private table: any;

  ngAfterViewInit(): void {
    $(document).ready(() => {
      this.table = $('#table').DataTable({
        paging: true,
        searching: true, // Enable search feature
        pageLength: 7,
        // Add other options here as needed
      });
    });
  }

  ngOnDestroy(): void {
    if (this.table) {
      this.table.destroy();
    }
  }



 addEmployee ={

    id: 0,
    employeeOrgId:'',
    teamsUserId: '',
    firstName: '',
    lastName: '',
    email: '',
    empDesignation :{
       id:0,
       designationName:''
    },
    designation : '',
    departmentId: 0,
    createdDateTime: '',
    modifiedDateTime: '',
    createdBy: '',
    modifiedBy: '',
    createdByEmailId: '',
    modifiedByEmailId: '',
  }

  employeeData :Employee[];

  constructor( private employeeservice : EmployeeService, private toastr : ToastrService,
     private departmentservice : DepartmentService, private router: Router, private designationService : DesignationService) {}
  ngOnInit(): void {

     this.getAllEmployees(); 
    /*setTimeout(() =>{this.employeeData.map (emp =>{
      this.departmentList.map(dept =>{
         if(emp.department.departmentId == dept.departmentId){
           emp.department.departmentName = dept.departmentName;
           console.log(emp.department.departmentName);
         }
      })},2000)})*/
      // this.employeeData.forEach( empdata =>{
      //    console.log(empdata);
      // })
  } 
 
  /**
   *  get all employees in DB
   */

  departmentList: Department[]
  getAllEmployees(){

    this.employeeservice.getAll().subscribe({
      next : response =>{
        this.employeeData = response.body;
        console.log(this.employeeData);
      /*if(this.departmentList != null)
      {
        this.employeeData.map(emp =>{
          for(let i=0; i< this.departmentList.length; i++){
            console.log("loop entered")
            if(emp.department.departmentId == this.departmentList[i].departmentId){
  
               emp.department.departmentName = this.departmentList[i].departmentName;
               console.log(emp.department.departmentName);
            }
         }
       })
      }*/
    }
     
    })
  }
   
  
/***
 * 
 *  create employee
 */
 createdEmployee : Employee;
  
  createEmployee(){

    let isFirstNameValid = true;
    let isLastNameValid = true;
    let isEmailIdValid = true;
    let isDepartmentValid = true;
    let isDesignationValid = true;

    if(!this.isEmployeeFirstNameValid){

      var valid = this.validateEmployeeFirstName();
      isFirstNameValid = valid;
    }
    if(!this.isEmployeeLasttNameValid){
      var valid = this.validateEmployeeLastName();
      isLastNameValid = valid;
    }
    if(!this.isEmployeeEmailIdValid){
      var valid = this.validateEmployeeEmailId();
      isEmailIdValid =valid;

    }
    if(!this.isEmployeeDepartmentValid){
      var valid = this.validateEmployeeDepartment();
      isDepartmentValid = valid;

    }
    if(!this.isEmployeeDesignationtValid){
       var valid = this.validateEmployeeDesignation();
       isDesignationValid = valid;
    }
    
    if(isFirstNameValid == true && isLastNameValid == true && isEmailIdValid == true && isDepartmentValid == true && isDesignationValid == true){
      
      console.log(this.addEmployee);
      this.addEmployee.createdBy = localStorage.getItem('firstName')+' '+localStorage.getItem('lastName');
      this.addEmployee.createdByEmailId = localStorage.getItem('email');
      this.employeeservice.createEmployee(this.addEmployee).subscribe(
       response =>{
        if(response.status == HttpStatusCode.Created){

          this.createdEmployee = response.body;
          this.toastr.success("Employee created successfully");
          document.getElementById('closeAddModal').click();
        }
       }
     );
    }

    
  }

  existingEmployee ={

    id: 0,
    employeeOrgId:'',
    teamsUserId: '',
    firstName: '',
    lastName: '',
    email: '',
    designation : '',
    departmentId :0,
    createdDateTime: '',
    modifiedDateTime: '',
    createdBy: '',
    modifiedBy: '',
    createdByEmailId: '',
    modifiedByEmailId: '',
  }
  
  /**
   * 
   * @param employeeid 
   */
  fetchoneEmployeewithDepartment(employeeid : number){

     this.employeeservice.getEmployeeWithDepartment(employeeid).subscribe({
       next: response =>{
          this.existingEmployee = response.body;
          console.log(this.existingEmployee);
     },
     error: error => {
      if(error.status === HttpStatusCode.Unauthorized){
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

   getAllDepartments(){

      this.departmentservice.getDepartmentList().subscribe(
      response=>{
      this.departmentList = response.body;
      console.log(this.departmentList); 
      })
  
  }
  designationList : Designation[];
  getAllDesignations(){
    this.designationService.getDesignationList().subscribe({
      next : response =>{
        this.designationList = response.body;
        console.log(this.designationList);

      }
    }
    );
     
  }

  /**
   * remove employee
   */
  
  removeEmployee(employeeId : number){
    var isconfirmed = window.confirm('Are you sure, you really want to delete the record ?');

    if(isconfirmed){

      this.employeeservice.deleteEmployee(employeeId).subscribe({
         next : response =>{
            if(response.status == HttpStatusCode.Ok){
                this.toastr.success("Employee deleted successfully");
            }
         },
         error: error => {
            this.toastr.error("Error occured while deleting employee");
             console.log("error occured");
         }
        }
     );
    }
    else{
        this.toastr.warning("Employee not Deleted");
    }

  }
  /**
   *  update employee
   */
  
  updateEmployee(employee : any){

    let isFirstNameValid = true;
    let isLastNameValid = true;
    let isEmailIdValid = true;
    let isDepartmentValid = true;
    let isDesignationValid = true;

    if(!this.isUpdateFirstNameValid){

      var valid = this.validateUpdateFirstName();
      isFirstNameValid = valid;
    }
    if(!this.isUpdateLastNameValid){
      var valid = this.validateUpdateLastName();
      isLastNameValid = valid;
    }
    if(!this.isUpdateEmailIdValid){
      var valid = this.validateUpdateEmailId();
      isEmailIdValid =valid;

    }
    if(!this.isUpdateDepartmentValid){
      var valid = this.validateUpdateDepartment();
      isDepartmentValid = valid;

    }
    if(!this.isUpdateDesignationtValid){
       var valid = this.validateUpdateDesignation();
       isDesignationValid = valid;
    }
     
    if(isEmailIdValid == true && isFirstNameValid == true && isLastNameValid == true && isDepartmentValid == true &&
      isDesignationValid == true){
       
        this.employeeservice.updateEmployee(employee).subscribe(
          response=>{
            var employeerecord = response.body;
            if(response.status == HttpStatusCode.Created){
                this.toastr.success("updated employee successfully");
                document.getElementById('closeUpdateModal').click();
            }
            else{
               this.toastr.error("Error occured while updating employee");
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
  isEmployeeDepartmentValid = false;
  isEmployeeDesignationtValid = false;
  
  employeeFirstNameErrorInfo = '';
  validateEmployeeFirstName(){

    if(this.addEmployee.firstName == ''){
        this.employeeFirstNameErrorInfo = "First Name is required";
        this.isEmployeeFirstNameValid = false;
    }
    else if(this.addEmployee.firstName.length < 4){
      this.employeeFirstNameErrorInfo = "First Name is required";
      this.isEmployeeFirstNameValid = false;
   
    }
    else{
       this.employeeFirstNameErrorInfo = "";
       this.isEmployeeFirstNameValid = true;
    }
    return this.isEmployeeFirstNameValid;

  }
  employeeLastNameErrorInfo ="";
  validateEmployeeLastName(){

  if(this.addEmployee.lastName == ''){
      this.employeeLastNameErrorInfo = "Last Name is required";
     this. isEmployeeLasttNameValid = false;
  }
  else if(this.addEmployee.lastName.length >5){
    this.employeeFirstNameErrorInfo = "";
    this. isEmployeeLasttNameValid = true;

  }
  else{
     this.employeeFirstNameErrorInfo = "";
     this. isEmployeeLasttNameValid = true;
  }
     
  return this.isEmployeeLasttNameValid;
  
  
  }

  employeeEmailIdErrorInfo = "";
  validateEmployeeEmailId(){
     if(this.addEmployee.email == ''){
      this.employeeEmailIdErrorInfo = "EmailId is required";
      this.isEmployeeEmailIdValid = false;
     }
     else{
      this.employeeFirstNameErrorInfo = "";
      this.isEmployeeEmailIdValid = true;
     }
     return this.isEmployeeEmailIdValid;  
  }
  employeeDepartmentErrorInfo = "";
  validateEmployeeDepartment(){
     if(this.addEmployee.departmentId < 1 ){
       this.employeeDepartmentErrorInfo = "Department is required"
       this.isEmployeeDepartmentValid = false;

     }
     else{
       this.employeeDepartmentErrorInfo ="";
       this.isEmployeeDepartmentValid = true;
     }
     return this,this.isEmployeeDepartmentValid;

  }

  employeeDesignationErrorInfo = "";

  validateEmployeeDesignation(){

    if(this.addEmployee.designation == ''){
      this.employeeDesignationErrorInfo = "Designation is required"
      this.isEmployeeDesignationtValid = false;

    }
    else{
      this.employeeDesignationErrorInfo ="";
      this.isEmployeeDesignationtValid = true;
    }
    return this.isEmployeeDesignationtValid;
  }

  /**
   * clear Error Message
   */

  clearErrorMessages(){
     this.employeeFirstNameErrorInfo = '';
     this.employeeLastNameErrorInfo = '';
     this.employeeEmailIdErrorInfo = '';
     this.employeeDepartmentErrorInfo = '';
     this.employeeDesignationErrorInfo ='';
    
     this.updateFirstNameErrorInfo ="";
     this.updateLastNameErrorInfo ="";
     this.updateEmailIdErrorInfo ="";
     this.updateDepartmentErrorInfo ="";
     this.updateDesignationErrorInfo ="";
  
  }
  /**
   * update employee Validations
   */
   
  isUpdateFirstNameValid = false;
  isUpdateLastNameValid = false;
  isUpdateEmailIdValid = false;
  isUpdateDepartmentValid = false;
  isUpdateDesignationtValid = false;

  updateFirstNameErrorInfo ="";

  validateUpdateFirstName(){

    if(this.existingEmployee.firstName == ''){
      this.updateFirstNameErrorInfo = "First Name is required";
      this.isUpdateFirstNameValid = false;
    }
    else if(this.existingEmployee.firstName.length < 5){
      this.updateFirstNameErrorInfo = "First Name is required";
      this.isUpdateFirstNameValid = false;
    }
    else{
       this.updateFirstNameErrorInfo = "";
       this.isUpdateFirstNameValid = true;
     }
     return this.isUpdateFirstNameValid;
  }
  updateLastNameErrorInfo ="";
  validateUpdateLastName(){

   if(this.existingEmployee.lastName == ''){
      this.updateLastNameErrorInfo = "Last Name is required";
      this.isUpdateLastNameValid = false;
    }
    else if(this.existingEmployee.lastName.length < 5){
      this.updateLastNameErrorInfo = "Last Name is required";
      this.isUpdateLastNameValid = false;
    }
    else{
      this.updateLastNameErrorInfo = "";
      this.isUpdateLastNameValid = true;
    }
    return this.isUpdateLastNameValid;
  }
  updateEmailIdErrorInfo = "";
  validateUpdateEmailId(){

    if(this.existingEmployee.email == ''){
      this.updateEmailIdErrorInfo = "EmailId is required";
      this.isUpdateEmailIdValid = false;
    }
    else if(this.existingEmployee.email.length < 10){
      this.updateEmailIdErrorInfo = "EmailId is required";
      this.isUpdateEmailIdValid = false;
    }
    else{
      this.updateEmailIdErrorInfo = "";
      this.isUpdateEmailIdValid = true;
    }
    return this.isUpdateLastNameValid;

  }
  updateDepartmentErrorInfo ="";
  validateUpdateDepartment(){
    if(this.existingEmployee.departmentId <1){
      this.updateDepartmentErrorInfo = "Department is required";
      this.isUpdateDepartmentValid  = false;
    }
    else{
      this.updateDepartmentErrorInfo = "";
      this.isUpdateDepartmentValid  = true;
    }
    return this.isUpdateDepartmentValid;


  }
  updateDesignationErrorInfo ="";
  validateUpdateDesignation(){

    if(this.existingEmployee.designation == ''){
      this.updateDesignationErrorInfo = "Designation is required";
      this.isUpdateEmailIdValid = false;
    }
    else if(this.existingEmployee.designation.length < 5){
      this.updateDesignationErrorInfo = "Designation is required";
      this.isUpdateEmailIdValid = false;
    }
    else{
      this.updateDesignationErrorInfo = "";
      this.isUpdateEmailIdValid = true;
    }
    return this.isUpdateLastNameValid;

  }

  /** check the selected checkboxes to delete */

  
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
  deleteEmployeesById(employee : any[]){
    var isconfirmed = window.confirm("Are you sure, you really want to delete these records?");
    if(isconfirmed){

      this.employeeservice.deleteAllEmployee(employee).subscribe(
        response=>{
           if(response.status == HttpStatusCode.Ok){
              this.toastr.success("Employee deleted successfully");
           }
           else{
               this.toastr.error("Error while deleting employee... Please try again !"); 
           }
        }
     )

    }
    else{
      this.toastr.warning("Employees not Deleted");

    }
  }

  /**
   * 
   * @param mainCheckBox 
   */
  checkAllCheckBoxes(mainCheckBox: any) {
   // var checkbox = event.target.value;
   // console.log("the value is:" + checkbox);
      console.log("checked");
      var table = document.getElementById('table');
      var rows = document.getElementsByClassName('trbody')
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var ischeckbox = row.querySelector("input[type='checkbox']") as HTMLInputElement
        if(ischeckbox){
          ischeckbox.checked = mainCheckBox.checked;
          ischeckbox.click();
        }
       
      
      }

}
  toggleMainCheckBox(index : number){

    if(!$('#ac-check'+index).is(':checked')){
      $('.mainCheckBox').prop('checked',false);
    }

  }

}
