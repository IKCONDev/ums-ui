import { Component, Output } from '@angular/core';
import { Designation } from '../model/Designation.model';
import { DesignationService } from './service/designation.service';
import { ToastrService } from 'ngx-toastr';
import { HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-designation',
  templateUrl: './designation.component.html',
  styleUrls: ['./designation.component.css']
})
export class DesignationComponent {

  @Output() title:string='Designations';
  designationList: Designation[];
  addDesignation = {
    designationName: '',
    createdBy:'',
    createdByEmailId: ''
  }
  updateDesignation: Designation;

  constructor(private designationService: DesignationService,
    private toastr: ToastrService){
    //get all departments List on component initialization
    this.getAllDesignations();
    
  }

  /**
   * ngOnInit() executes on component initialization everytime
   */
  ngOnInit(): void {
      
  }


  /**
   * get list of all departments from Database and display to admin in UI
   */
  getAllDesignations(){
    this.designationService.getDesignationList().subscribe(
      (response)=>{
        this.designationList = response.body;
        console.log(this.designationList)
      }
    )
  }

  
  /**
   * create a new department
   */
  createdDesignation: Designation;
  createDesignation(){
    let isNameValid = true;
    let isHeadValid = true;
    let isCodeValid = true;
    let isLocationValid = true;
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
    this.addDesignation.createdBy = localStorage.getItem('firstName')+' '+localStorage.getItem('lastName');
    this.addDesignation.createdByEmailId = localStorage.getItem('email');
    this.designationService.createDesignation(this.addDesignation).subscribe(
      (response)=> {
        if(response.status === HttpStatusCode.Created){
          this.createdDesignation = response.body;
        this.toastr.success('Department added successfully.')
        document.getElementById('closeAddModal').click();
          setTimeout(()=>{
            window.location.reload();
          },1000)
        }
      }
    )
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
    if(this.addDesignation.designationName === ''){
      this.designationNameErrorInfo = 'Designation name is required';
    }else if(this.addDesignation.designationName.length < 5){
      this.designationNameErrorInfo = 'Designation name should have minimum of 5 chars.';
    }else if(this.addDesignation.designationName.length > 40){
      this.designationNameErrorInfo = 'Designation name should not exceed more than 40 chars';
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
    var isConfirmed = window.confirm('Are you sure, you really want to delete this record?')
   if(isConfirmed){
    this.designationService.deleteDesignation(designationId).subscribe(
      (response) => {
        console.log('exuected')
        if(response.status === HttpStatusCode.Ok){
          var result = response.body;
          this.toastr.success('Department '+designationId+' deleted successfully.')
          setTimeout(()=>{
            window.location.reload();
          },1000)
        }
      }
    )
   }else{
    this.toastr.warning('Designation '+ designationId+ ' not deleted.')
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
    console.log(designationId)
    this.designationService.getDesignation(designationId).subscribe(
      (response=>{
        if(response.status === HttpStatusCode.Ok){
         this.existingDesignation = response.body;
         console.log(this.existingDesignation)
        }
      })
    )
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
      this.existingDesignation.modifiedBy = localStorage.getItem('firstName')+' '+localStorage.getItem('lastName');
    console.log(this.existingDesignation)
    this.designationService.updateDesignation(this.existingDesignation).subscribe(
      (response) => {
        console.log('exec')
        if(response.status === HttpStatusCode.PartialContent){
          this.toastr.success('Designation '+this.existingDesignation.id+' details updated')
          document.getElementById('closeUpdateModal').click();
          setTimeout(()=>{
            window.location.reload();
          },1000)
        }
      }
    )
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
     if(this.existingDesignation.designationName === ''){
       this.updatedDesignationNameErrorInfo = 'Department name is required';
     }else if(this.existingDesignation.designationName.length < 5){
       this.updatedDesignationNameErrorInfo = 'department name should have minimum of 5 chars.';
     }else if(this.existingDesignation.designationName.length>40){
       this.updatedDesignationNameErrorInfo = 'department name should not exceed more than 20 chars';
     }else{
       this.isUpdatedDesignationNameValid = true;
       this.updatedDesignationNameErrorInfo = '';
     }
     return this.isUpdatedDesignationNameValid;
   }

   /**
    * 
    */
   checkSubCheckBoxes(mainCheckBox: any){
    //  var subCheckBoxesRow = document.querySelector('dataRow');
    //  var subCheckBoxes = subCheckBoxesRow.querySelector("input[type='checkbox']") as HTMLInputElement;
    //  subCheckBoxes.forEach( subCheckBox => {
      
    //  });
    var departmentsToBeDeleted = [];
   // var table = document.getElementById("myTable1")
   // console.log(table)
    //for(var i=0; i<tables.length; i++){
    var rows = document.getElementsByTagName("tr");
    //var subCheckBoxes = rows
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      console.log("the value is" + rows[i]);
      var subCheckbox = row.querySelector("input[type='checkbox']") as HTMLInputElement;
      subCheckbox.checked = mainCheckBox.checked;
      subCheckbox.click();
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
      console.log(this.designationIdsToBeDeleted);
    }
   }
   //delete the selected departments
   if(this.designationIdsToBeDeleted.length>0){
    var isconfirmed = window.confirm('Are yopu sure, you really want to delete these records ?')
    if(isconfirmed){
      console.log(this.designationIdsToBeDeleted)
      this.designationService.deleteAllSelectedDesignationsById(this.designationIdsToBeDeleted).subscribe(
        (response => {
          if(response.status === HttpStatusCode.Ok){
            var isAllDeleted = response.body    
            this.toastr.success('Designations deleted sucessfully')  
            setTimeout(()=>{
              window.location.reload();
            },1000)  
          }else{
            this.toastr.error('Error while deleting designations... Please try again !');
          }
        })
      )
    }else{
      this.toastr.warning('Designations not deleted')
    }
   }else{
    this.toastr.error('Please select atleast one record to delete.')
   }
   
  }

  

   /**
    * 
    */
   clearErrorMessages(){
    this.designationNameErrorInfo = '';
    this.updatedDesignationNameErrorInfo = '';
  
  }

  /**
   * 
   * @param index Uncheck the main checkbox when any of its child/subcheckbox is checked
   */
  toggleMainCheckBox(index: number){
    if(!$('#subCheckBox'+index).is(':checked')){
      $('#mainCheckBox').prop('checked',false);
    }
  }



}
