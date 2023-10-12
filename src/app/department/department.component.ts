import { Component,Output } from '@angular/core';
import { Department } from '../model/Department.model';
import { DepartmentService } from './service/department.service';
import { OnInit } from '@angular/core';
import { HttpStatusCode } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.css']
})
export class DepartmentComponent implements OnInit {

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

  constructor(private departmentService: DepartmentService,
    private toastr: ToastrService){
    //get all departments List on component initialization
    this.getAllDepartments();
    
  }

  /**
   * ngOnInit() executes on component initialization everytime
   */
  ngOnInit(): void {
      
  }


  /**
   * get list of all departments from Database and display to admin in UI
   */
  getAllDepartments(){
    this.departmentService.getDepartmentList().subscribe(
      (response)=>{
        this.departmentList = response.body;
        console.log(this.departmentList)
      }
    )
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
    this.addDepartment.createdBy = localStorage.getItem('firstName')+' '+localStorage.getItem('lastName');
    this.addDepartment.createdByEmailId = localStorage.getItem('email');
    this.departmentService.saveDepartment(this.addDepartment).subscribe(
      (response)=> {
        if(response.status === HttpStatusCode.Created){
          this.createdDepartment = response.body;
        this.toastr.success('Department added successfully.')
          setTimeout(()=>{
            window.location.reload();
          },2000)
        }
      }
    )
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
    if(this.addDepartment.departmentName === ''){
      this.departmentNameErrorInfo = 'Department name is required';
    }else if(this.addDepartment.departmentName.length < 3){
      this.departmentNameErrorInfo = 'department name should have minimum of 3 chars.';
    }else if(this.addDepartment.departmentName.length>20){
      this.departmentNameErrorInfo = 'department name should not exceed more than 40 chars';
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
    if(this.addDepartment.departmentHead === ''){
      this.departmentHeadErrorInfo = 'Department head is required';
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
    if(this.addDepartment.departmentCode === ''){
      this.departmentCodeErrorInfo = 'Department code is required';
    }else if(this.addDepartment.departmentCode.length < 2){
      this.departmentCodeErrorInfo = 'Department code should be minimum of 2 chars.';
    }else if(this.addDepartment.departmentCode.length > 4){
      this.departmentCodeErrorInfo = 'Department code should not exceed 4 chars.';
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
    if(this.addDepartment.departmentAddress === ''){
      this.departmentLocationErrorInfo = 'Department location is required';
    }else if(this.addDepartment.departmentAddress.length < 3){
      this.departmentLocationErrorInfo = 'Department location should be minimum of 3 chars.';
    }else if(this.addDepartment.departmentAddress.length > 20){
      this.departmentLocationErrorInfo = 'Department location should not exceed 20 chars.';
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
    this.departmentService.deleteDepartment(departmentId).subscribe(
      (response) => {
        console.log('exuected')
        if(response.status === HttpStatusCode.Ok){
          var result = response.body;
          this.toastr.success('Department '+departmentId+' deleted successfully.')
          setTimeout(()=>{
            window.location.reload();
          },2000)
        }
      }
    )
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
    this.departmentService.getDepartment(departmentId).subscribe(
      (response=>{
        if(response.status === HttpStatusCode.Ok){
         this.existingDepartment = response.body;
         console.log(this.existingDepartment)
        }
      })
    )
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
      this.existingDepartment.modifiedBy = localStorage.getItem('firstName')+' '+localStorage.getItem('lastName');
    console.log(this.existingDepartment)
    this.departmentService.updateDepartment(this.existingDepartment).subscribe(
      (response) => {
        console.log('exec')
        if(response.status === HttpStatusCode.Created){
          this.toastr.success('Department details updated')
          setTimeout(()=>{
            window.location.reload();
          },2000)
        }
      }
    )
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
     if(this.existingDepartment.departmentName === ''){
       this.updatedDepartmentNameErrorInfo = 'Department name is required';
     }else if(this.existingDepartment.departmentName.length < 3){
       this.updatedDepartmentNameErrorInfo = 'department name should have minimum of 3 chars.';
     }else if(this.existingDepartment.departmentName.length>20){
       this.updatedDepartmentNameErrorInfo = 'department name should not exceed more than 20 chars';
     }else{
       this.isDepartmentNameValid = true;
       this.updatedDepartmentNameErrorInfo = '';
     }
     return this.isDepartmentNameValid;
   }

   /**
    * 
    */
  updatedDepartmentHeadErrorInfo: string = ''
  isUpdatedDepartmentHeadValid = false;
  validateUpdatedDepartmentHead(){
    //var deptHead = event.target.value;
    if(this.existingDepartment.departmentHead === ''){
      this.updatedDepartmentHeadErrorInfo = 'Department head is required';
    }else{
      this.isDepartmentHeadValid = true;
      this.updatedDepartmentHeadErrorInfo = '';
    }
    return this.isDepartmentHeadValid;
  }

  /**
   * 
   */
  updatedDepartmentCodeErrorInfo: string = ''
  isUpdatedDepartmentCodeValid = false;
  validateUpdatedDepartmentCode(){
    //var deptCode = event.target.value;
    if(this.existingDepartment.departmentCode === ''){
      this.updatedDepartmentCodeErrorInfo = 'Department code is required';
    }else if(this.existingDepartment.departmentCode.length < 2){
      this.updatedDepartmentCodeErrorInfo = 'Department code should be minimum of 2 chars.';
    }else if(this.existingDepartment.departmentCode.length > 4){
      this.updatedDepartmentCodeErrorInfo = 'Department code should not exceed 4 chars.';
    }
    else{
      this.isDepartmentCodeValid = true;
      this.updatedDepartmentCodeErrorInfo = '';
    }
    return this.isDepartmentCodeValid;
  }

  /**
   * 
   */
  updatedDepartmentLocationErrorInfo: string = ''
  isUpdatedDepartmentLocationValid = false;
  validateUpdatedDepartmentLocation(){
    // var deptLocation = event.target.value;
     if(this.existingDepartment.departmentAddress === ''){
       this.updatedDepartmentLocationErrorInfo = 'Department location is required';
     }else if(this.existingDepartment.departmentAddress.length < 3){
       this.updatedDepartmentLocationErrorInfo = 'Department location should be minimum of 3 chars.';
     }else if(this.existingDepartment.departmentAddress.length > 20){
       this.updatedDepartmentLocationErrorInfo = 'Department location should not exceed 20 chars.';
     }
     else{
       this.isDepartmentLocationValid = true;
       this.updatedDepartmentLocationErrorInfo = '';
     }
     return this.isDepartmentLocationValid;
   }

   /**
    * 
    */
   clearErrorMessages(){
    this.departmentNameErrorInfo = '';
    this.departmentCodeErrorInfo = '';
    this.departmentHeadErrorInfo = '';
    this.departmentLocationErrorInfo = '';

    this.updatedDepartmentNameErrorInfo = '';
    this.updatedDepartmentCodeErrorInfo = '';
    this.updatedDepartmentHeadErrorInfo = '';
    this.updatedDepartmentLocationErrorInfo = '';
  }

  /*
  closeDepartmentModal(){
    this.addDepartment.departmentName= '';
    this.addDepartment.departmentCode = '';
    this.addDepartment.departmentHead = '';
    this.addDepartment.departmentAddress = '';
  }
  */

}
