import { Component, OnInit, Output } from '@angular/core';
import { OrganizationService } from './service/organization.service';
import { Organization } from '../model/Organization.model';
import { HttpStatusCode } from '@angular/common/http';
import { Toast, ToastrModule, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.css']
})
export class OrganizationComponent implements OnInit {

  @Output() title: string = 'Organization';

  constructor(private orgService: OrganizationService, private toast: ToastrService) {}
  

  ngOnInit(): void {
    this.getOrganization();
  }

  org: Organization
  getOrganization() {
    //returns null if no org details are present in DB.
    this.orgService.getOrganization(5).subscribe(
      (response => {
        if (response.status === HttpStatusCode.Ok) {
          console.log(response.body)
          this.org = response.body;
        }
      })
    )
  }

  isDisable: boolean = false
  editInfo() {
    this.isDisable = true
    console.log(this.isDisable)
  }

  cancelCompanyDetails() {
    this.isDisable = false;
  }

  saveOrUpdateOrg() {
    var flag = 0;
    var isOrgNameValid = true;
    var isWebsiteNameValid = true;
    var isOrgFunctionValid = true;
    var isOrgContactPersonNameValid = true;
    var isOrgContactPersonNumberValid = true;
    var isOrgAddressValid = true;
    var isOrgCountryValid = true;
    var isOrgContactNumberValid = true;
    var isOrgContactPersonEmailValid = true;
    var isOrgSuperAdminEmailValid = true;
    var isCompanyEmailValid = true;


    if (this.isUpdateorgNameValid === false) {
      var valid = this.validateOrgName();
      isOrgNameValid = valid;
      flag = 1;
    }
    if (this.isUpdateWebsiteNameValid === false) {
      var valid = this.validateWebsite();
      isWebsiteNameValid = valid;
      flag = 1;
    }
    if (this.isUpdateOrgFunctionValid === false) {
      var valid = this.validateOrgFunction();
      isOrgFunctionValid = valid;
      flag = 1;
    }
    if (this.isUpdateOrgContactPersonNameValid === false) {
      var valid = this.validateOrgContactPersonNameFunction();
      isOrgContactPersonNameValid = valid;
      flag = 1;
    }
    if (this.isUpdateOrgContactPersonNumberValid === false) {
      var valid = this.validateOrgContactPersonNumber();
      isOrgContactPersonNumberValid = valid;
      flag = 1;
    }
    if (this.isUpdateOrgAddressValid === false) {
      var valid = this.validateOrgAddress();
      isOrgAddressValid = valid;
      flag = 1;
    }
    if (this.isupdatedOrgCountryValid === false) {
      var valid = this.validateOrgCountry();
      isOrgCountryValid = valid;
      flag = 1;
    }
    if (this.isupdatedOrgContactNumberValid === false) {
      var valid = this.validateOrgContactNumber();
      isOrgContactNumberValid = valid;
      flag = 1;
    }
    if (this.isUpdateOrgContactPersonEmailValid === false) {
      var valid = this.validateOrgContactPersonEmail();
      isOrgContactPersonEmailValid = valid;
      flag = 1;
    }
    if (this.isUpdateOrgSuperAdminEmailValid === false) {
      var valid = this.validateSuperAdminEmail();
      isOrgSuperAdminEmailValid = valid;
      flag = 1;
    }
    if (this.isUpdateCompanyEmailValid === false) {
      var valid = this.validateCompanyEmail();
      isCompanyEmailValid = valid;
      flag = 1;
    }
    if (isOrgNameValid === true && isWebsiteNameValid === true && isOrgFunctionValid === true && isOrgContactPersonNameValid === true &&
      isOrgContactPersonNumberValid === true && isOrgAddressValid === true && isOrgCountryValid === true && isOrgContactNumberValid === true
      && isOrgContactPersonEmailValid === true && isOrgSuperAdminEmailValid === true && isCompanyEmailValid === true) {
      this.isDisable = false;
      console.log(isOrgFunctionValid)
      if (this.org.orgId === null) {
        console.log('save')
        this.orgService.saveOrganization(this.org).subscribe(
          (response => {
            this.org = response.body;
            setTimeout(()=>{
              window.location.reload();
            },1000)
          })
        )
      }
      else if (this.org.orgId != 0) {
        console.log('update')
        this.orgService.updateOrganization(this.org).subscribe(
          (response => {
            this.org = response.body;
            setTimeout(()=>{
              window.location.reload();
            },1000)
          })
        )

      }
    }
    else {
      this.isDisable = true;
    }

  }

  updatedOrgNameErrorInfo: string = '';
  isUpdateorgNameValid: boolean = false;
  validateOrgName() {
    // var deptName=  event.target.value;
    if(this.org.orgName.length == 0){
      this.isUpdateorgNameValid = true;
      this.updatedOrgNameErrorInfo = '';
    }
     else if (this.org.orgName.length < 3) {
      this.updatedOrgNameErrorInfo = 'Organisation name should have minimum of 3 chars.';
    } else if (this.org.orgName.length > 40) {
      this.updatedOrgNameErrorInfo = 'Organisation name should not exceed more than 40 chars';
    }else if (this.org.orgName.length > 40) {
      this.updatedOrgNameErrorInfo = 'Organisation name should not exceed more than 40 chars';
    } else {
      this.isUpdateorgNameValid = true;
      this.updatedOrgNameErrorInfo = '';
    }
    return this.isUpdateorgNameValid;
  }

  updatedOrgWebsiteErrorInfo: string = ''
  isUpdateWebsiteNameValid: boolean = false;
  validateWebsite() {
    if(this.org.orgWebsite.length===0){
      this.isUpdateWebsiteNameValid = true;
      this.updatedOrgWebsiteErrorInfo = '';
    }
    else if (this.org.orgWebsite.length < 6) {
      this.updatedOrgWebsiteErrorInfo = 'Website should have minimum of 6 chars.';
    } else if (this.org.orgWebsite.length > 50) {
      this.updatedOrgWebsiteErrorInfo = 'Website should not exceed more than 50 chars';
    } else {
      this.isUpdateWebsiteNameValid = true;
      this.updatedOrgWebsiteErrorInfo = '';
    }
    return this.isUpdateWebsiteNameValid;
  }

  updatedorgFunctionalTypeErrorInfo: string = ''
  isUpdateOrgFunctionValid: boolean = false;
  validateOrgFunction() {
    if(this.org.orgFunctionalType.length==0){
      this.isUpdateOrgFunctionValid = true;
      this.updatedorgFunctionalTypeErrorInfo = '';
    }
    else if (this.org.orgFunctionalType.length < 6) {
      this.updatedorgFunctionalTypeErrorInfo = 'Functional Type should have minimum of 6 chars.';
    } else if (this.org.orgFunctionalType.length > 50) {
      this.updatedorgFunctionalTypeErrorInfo = 'Functional Type should not exceed more than 50 chars';
    } else {
      this.isUpdateOrgFunctionValid = true;
      this.updatedorgFunctionalTypeErrorInfo = '';
    }
    return this.isUpdateOrgFunctionValid;
  }
  updatedorgContactPersonNameErrorInfo: string = ''
  isUpdateOrgContactPersonNameValid: boolean = false;
  validateOrgContactPersonNameFunction() {
    if(this.org.orgContactPersonName.length===0){
      this.isUpdateOrgContactPersonNameValid = true;
      this.updatedorgContactPersonNameErrorInfo = '';
    }
     else if (this.org.orgContactPersonName.length < 3) {
      this.updatedorgContactPersonNameErrorInfo = 'Organisation Contact person Name should have minimum of 3 chars.';
    } else if (this.org.orgContactPersonName.length > 50) {
      this.updatedorgContactPersonNameErrorInfo = 'Organisation Contact person should not exceed more than 50 chars';
    } else {
      this.isUpdateOrgContactPersonNameValid = true;
      this.updatedorgContactPersonNameErrorInfo = '';
    }
    return this.isUpdateOrgContactPersonNameValid;
  }


  // validate org contact person number
  updatedorgContactPersonNumberErrorInfo: string = '';
  isUpdateOrgContactPersonNumberValid: boolean = false;
  validateOrgContactPersonNumber() {
    if(this.org.orgContactPersonNumber.length===0){
      this.isUpdateOrgContactPersonNumberValid = true;
      this.updatedorgContactPersonNumberErrorInfo = '';
    }
      else if (this.org.orgContactPersonNumber.length < 10) {
      this.updatedorgContactPersonNumberErrorInfo = 'Organisation Contact person Number should have minimum of 10 digits.';
    } else if (this.org.orgContactPersonNumber.length > 10) {
      this.updatedorgContactPersonNumberErrorInfo = 'Organisation Contact person Number should not exceed more than 10 digits';
    } else {
      this.isUpdateOrgContactPersonNumberValid = true;
      this.updatedorgContactPersonNumberErrorInfo = '';
    }
    return this.isUpdateOrgContactPersonNumberValid;
  }

  //ValidateOrgAdddress

  updatedOrgAddressErrorInfo: string = '';
  isUpdateOrgAddressValid: boolean = false;
  validateOrgAddress() {
    if (this.org.orgAddress.length === 0) {
      this.updatedOrgAddressErrorInfo = '';
      this.isUpdateOrgAddressValid = true;
    }
    else if (this.org.orgAddress.length < 50) {
      this.updatedOrgAddressErrorInfo = 'Organisation Address should have minimum of 50 chars';
    }
    else if (this.org.orgAddress.length > 250) {
      this.updatedOrgAddressErrorInfo = 'Organisation address should not exceed more than 250 chars';
    }
    else {
      this.isUpdateOrgAddressValid = true;
      this.updatedOrgAddressErrorInfo = '';
    }
    return this.isUpdateOrgAddressValid;
  }
  //validateOrgContact

  updatedOrgContactNumberErrorInfo: string = '';
  isupdatedOrgContactNumberValid: boolean = false;
  validateOrgContactNumber() {
    if (this.org.orgContactNumber.length === 0) {
      this.updatedOrgContactNumberErrorInfo = '';
      this.isupdatedOrgContactNumberValid = true;
    }
    else if (this.org.orgContactNumber.length < 10) {
      this.updatedOrgContactNumberErrorInfo = 'Contact number should have minimum of 10 digits.';
    } else if (this.org.orgContactNumber.length > 10) {
      this.updatedOrgContactNumberErrorInfo = 'Contact number should not exceed more than 10 digits';
    }else {
      this.isupdatedOrgContactNumberValid = true;
      this.updatedOrgContactNumberErrorInfo = '';
    }
    return this.isupdatedOrgContactNumberValid;
  }

  //validate Country 

  updatedOrgCountryErrorInfo: string = '';
  isupdatedOrgCountryValid: boolean = false;

  validateOrgCountry() {
    if (this.org.orgCountry.length === 0) {
      this.updatedOrgCountryErrorInfo = '';
      this.isupdatedOrgCountryValid = true;
    }
    else if (this.org.orgCountry.length < 4) {
      this.updatedOrgCountryErrorInfo = 'Organisation Country should have minimum of 4 chars.';
    } else if (this.org.orgCountry.length > 30) {
      this.updatedOrgCountryErrorInfo = 'Organisation Country should not exceed more than 30 chars.';
    } else {
      this.isupdatedOrgCountryValid = true;
      this.updatedOrgCountryErrorInfo = '';
    }
    return this.isupdatedOrgCountryValid;
  }

  //validate Org Contact Person Email
  updatedorgContactPersonEmailErrorInfo: string = '';
  isUpdateOrgContactPersonEmailValid: boolean = false;
  validateOrgContactPersonEmail() {
    var emailRegExp = /^[A-Za-z0-9._]{2,30}[0-9]{0,9}@[A-Za-z]{3,12}[.]{1}[A-Za-z.]{3,6}$/;
    if (this.org.orgContactPersonEmail.length === 0) {
      this.updatedorgContactPersonEmailErrorInfo = '';
      this.isUpdateOrgContactPersonNumberValid = true;
    }
    else if (emailRegExp.test(this.org.orgContactPersonEmail) === true) {
      this.updatedorgContactPersonEmailErrorInfo = '';
      this.isUpdateOrgContactPersonNumberValid = true;
    }
    else {
      this.isUpdateOrgContactPersonNumberValid = false;
      this.updatedorgContactPersonEmailErrorInfo = 'Please enter correct email ';
    }
    return this.isUpdateOrgContactPersonNumberValid;
  }

  updatedOrgSuperAdminEmailErrorInfo: string = '';
  isUpdateOrgSuperAdminEmailValid: boolean = false;
  validateSuperAdminEmail() {
    var emailRegExp = /^[A-Za-z0-9._]{2,30}[0-9]{0,9}@[A-Za-z]{3,12}[.]{1}[A-Za-z.]{3,6}$/;
    if (this.org.orgSuperAdminEmailId.length === 0) {
      this.updatedOrgSuperAdminEmailErrorInfo = '';
      this.isUpdateOrgSuperAdminEmailValid = true;
    }
    else if (emailRegExp.test(this.org.orgSuperAdminEmailId) === true) {
      this.updatedOrgSuperAdminEmailErrorInfo = '';
      this.isUpdateOrgSuperAdminEmailValid = true;
    }
    else {
      this.isUpdateOrgSuperAdminEmailValid = false;
      this.updatedOrgSuperAdminEmailErrorInfo = 'Please enter correct email ';
    }
    return this.isUpdateOrgSuperAdminEmailValid;
  }
  updatedCompanyEmailErrorInfo: string = '';
  isUpdateCompanyEmailValid: boolean = false;
  validateCompanyEmail() {
    var emailRegExp = /^[A-Za-z0-9._]{2,30}[0-9]{0,9}@[A-Za-z]{3,12}[.]{1}[A-Za-z.]{2,6}$/;
    if (this.org.orgEmailId.length === 0) {
      this.updatedCompanyEmailErrorInfo = '';
      this.isUpdateCompanyEmailValid = true;
    }
    else if (emailRegExp.test(this.org.orgEmailId) === true) {
      this.updatedCompanyEmailErrorInfo = '';
      this.isUpdateCompanyEmailValid = true;
    }
    else {
      this.isUpdateCompanyEmailValid = false;
      this.updatedCompanyEmailErrorInfo = 'Please enter correct email ';
    }
    return this.isUpdateCompanyEmailValid;
  }

}




