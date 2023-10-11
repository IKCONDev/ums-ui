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
  savedDepartment: Department;
  createDepartment(){
    var flag = 0;
    if(this.addDepartment.departmentName === ''){
      flag = 1;
      this.departmentNameErrorInfo = 'Department name is required'
    }else{
      this.departmentNameErrorInfo = ''
    }
    if(this.addDepartment.departmentCode === ''){
      flag = 1;
      this.departmentCodeErrorInfo = 'Department code is required'
    }else{
      this.departmentCodeErrorInfo = ''
    }
    if(this.addDepartment.departmentHead === ''){
      flag = 1;
      this.departmentHeadErrorInfo = 'Department head is required'
    }else{
      this.departmentHeadErrorInfo = ''
    }
    if(this.addDepartment.departmentAddress === ''){
      flag = 1;
      this.departmentLocationErrorInfo = 'Department location is required'
    }else{
      this.departmentLocationErrorInfo = ''
    }
    if(flag==1){
      this.toastr.error('Please fill required fields')
    }
    if(this.departmentNameErrorInfo === '' && this.departmentCodeErrorInfo === ''
     &&this.departmentHeadErrorInfo === '' && this.departmentLocationErrorInfo=== ''){
    //set createdBy
    this.addDepartment.createdBy = localStorage.getItem('firstName')+' '+localStorage.getItem('lastName');
    this.addDepartment.createdByEmailId = localStorage.getItem('email');
    this.departmentService.saveDepartment(this.addDepartment).subscribe(
      (response)=> {
        if(response.status === HttpStatusCode.Created){
          this.savedDepartment = response.body;
        this.toastr.success('Department added successfully.')
          setTimeout(()=>{
            window.location.reload();
          },2000)
        }
      }
    )
     }
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
    if(this.existingDepartment.departmentName === ''){
      flag = 1;
      this.departmentNameErrorInfo = 'Department name is required'
    }else{
      this.departmentNameErrorInfo = ''
    }
    if(this.existingDepartment.departmentCode === ''){
      flag = 1;
      this.departmentCodeErrorInfo = 'Department code is required'
    }else{
      this.departmentCodeErrorInfo = ''
    }
    if(this.existingDepartment.departmentHead === ''){
      flag = 1;
      this.departmentHeadErrorInfo = 'Department head is required'
    }else{
      this.departmentHeadErrorInfo = ''
    }
    if(this.existingDepartment.departmentAddress === ''){
      flag = 1;
      this.departmentLocationErrorInfo = 'Department location is required'
    }else{
      this.departmentLocationErrorInfo = ''
    }
    if(flag==1){
      this.toastr.error('Please fill required fields')
    }
    if(this.departmentNameErrorInfo === '' && this.departmentCodeErrorInfo === ''
     &&this.departmentHeadErrorInfo === '' && this.departmentLocationErrorInfo=== ''){
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

  /*
  closeDepartmentModal(){
    this.addDepartment.departmentName= '';
    this.addDepartment.departmentCode = '';
    this.addDepartment.departmentHead = '';
    this.addDepartment.departmentAddress = '';
  }
  */

  //validations for updateDepartment
  departmentNameErrorInfo: string = ''
  validateDepartmentName(event: any){
    var deptName=  event.target.value;
    if(deptName === ''){
      this.departmentNameErrorInfo = 'Department name is required';
    }else if(deptName.length < 3){
      this.departmentNameErrorInfo = 'department name should have minimum of 3 chars.';
    }else if(deptName.length>20){
      this.departmentNameErrorInfo = 'department name should not exceed more than 20 chars';
    }else{
      this.departmentNameErrorInfo = '';
    }
  }

  departmentHeadErrorInfo: string = ''
  validateDepartmentHead(event: any){
    var deptHead = event.target.value;
    if(deptHead === ''){
      this.departmentHeadErrorInfo = 'Department head is required';
    }else{
      this.departmentHeadErrorInfo = '';
    }
  }

  departmentCodeErrorInfo:string = '';
  validateDepartmentCode(event: any){
    var deptCode = event.target.value;
    if(deptCode === ''){
      this.departmentCodeErrorInfo = 'Department code is required';
    }else if(deptCode.length < 2){
      this.departmentCodeErrorInfo = 'Department code should be minimum of 2 chars.';
    }else if(deptCode.length > 4){
      this.departmentCodeErrorInfo = 'Department code should not exceed 4 chars.';
    }
    else{
      this.departmentCodeErrorInfo = '';
    }
  }

  departmentLocationErrorInfo: string= '';
  validateDepartmentLocation(event: any){
    var deptLocation = event.target.value;
    if(deptLocation === ''){
      this.departmentLocationErrorInfo = 'Department location is required';
    }else if(deptLocation.length < 3){
      this.departmentLocationErrorInfo = 'Department location should be minimum of 3 chars.';
    }else if(deptLocation.length > 20){
      this.departmentLocationErrorInfo = 'Department location should not exceed 20 chars.';
    }
    else{
      this.departmentLocationErrorInfo = '';
    }
  }

  // //validations for add department
  // validateDepartmentName(event: any){
  //   if(event.target.value === ''){
  //     //this.existingDepartmentNameErrorInfo = ''
  //   }
  // }

  // validateDepartmentHead(){

  // }

  // validateDepartmentCode(){

  // }

  // validateDepartmentLocation(){

  // }

}
