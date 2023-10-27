import { Component, OnInit, Output } from '@angular/core';
import { OrganizationService } from './service/organization.service';
import { Organization } from '../model/Organization.model';
import { HttpStatusCode } from '@angular/common/http';
import { Toast, ToastrModule, ToastrService } from 'ngx-toastr';
import { error } from 'jquery';
import { Router } from '@angular/router';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.css']
})
export class OrganizationComponent implements OnInit {

  @Output() title: string = 'Organization';
  org: Organization;
  isDisable: boolean = false;

  //error validation properties
  updatedOrgNameErrorInfo: string = '';
  isUpdateorgNameValid: boolean = false;
  updatedOrgWebsiteErrorInfo: string = ''
  isUpdateWebsiteNameValid: boolean = false;
  updatedorgFunctionalTypeErrorInfo: string = ''
  isUpdateOrgFunctionValid: boolean = false;
  updatedorgContactPersonNameErrorInfo: string = ''
  isUpdateOrgContactPersonNameValid: boolean = false;
  updatedorgContactPersonNumberErrorInfo: string = '';
  isUpdateOrgContactPersonNumberValid: boolean = false;
  updatedOrgAddressErrorInfo: string = '';
  isUpdateOrgAddressValid: boolean = false;
  updatedOrgContactNumberErrorInfo: string = '';
  isupdatedOrgContactNumberValid: boolean = false;
  updatedOrgCountryErrorInfo: string = '';
  isupdatedOrgCountryValid: boolean = false;
  updatedorgContactPersonEmailErrorInfo: string = '';
  isUpdateOrgContactPersonEmailValid: boolean = false;
  updatedOrgSuperAdminEmailErrorInfo: string = '';
  isUpdateOrgSuperAdminEmailValid: boolean = false;
  updatedCompanyEmailErrorInfo: string = '';
  isUpdateCompanyEmailValid: boolean = false;

  /**
   * 
   * @param orgService 
   * @param toast 
   * @param router 
   */
  constructor(private orgService: OrganizationService, private toast: ToastrService,
    private router: Router) { }


    /**
     * 
     */
  ngOnInit(): void {
    this.getOrganization();
  }

  /**
   * 
   */
  getOrganization() {
    //returns null if no org details are present in DB.
    this.orgService.getOrganization(10).subscribe({
      next: (response) => {
        if (response.status === HttpStatusCode.Ok) {
          console.log(response.body)
          this.org = response.body;
        }
      }, error: error => {
        if (error.status === HttpStatusCode.Unauthorized) {
          this.router.navigateByUrl('/session-timeout')
        }
      }
    })
  }

  /**
   * 
   */
  editInfo() {
    this.isDisable = true
    console.log(this.isDisable)
  }

  /**
   * 
   */
  cancelCompanyDetails() {
    this.isDisable = false;
  }

  /**
   * 
   */
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
        this.orgService.saveOrganization(this.org).subscribe({
          next: (response) => {
            this.org = response.body;
            setTimeout(() => {
              window.location.reload();
            }, 1000)
          }, error: error => {
            if (error.status === HttpStatusCode.Unauthorized) {
              this.router.navigateByUrl('/session-timeout')
            }
          }
        })
      }
      else if (this.org.orgId != 0) {
        console.log('update')
        this.orgService.updateOrganization(this.org).subscribe({
          next: (response) => {
            this.org = response.body;
            setTimeout(() => {
              window.location.reload();
            }, 1000)
          }, error: error => {
            if (error.status === HttpStatusCode.Unauthorized) {
              this.router.navigateByUrl('/session-timeout')
            }
          }
        })
      }
    }
    else {
      this.isDisable = true;
    }
  }


  /**
   * 
   * @returns 
   */
  validateOrgName() {
    // var deptName=  event.target.value;
    if (this.org.orgName === null) {
      this.isUpdateorgNameValid = false;
      this.updatedOrgNameErrorInfo = 'Organization name is required';
    }else if(this.org.orgName=== ''){
      this.isUpdateorgNameValid = false;
      this.updatedOrgNameErrorInfo = 'Organization name is required';
    }
    else if (this.org.orgName.length < 3) {
      this.updatedOrgNameErrorInfo = 'Organisation name should have minimum of 3 chars.';
    } else if (this.org.orgName.length > 40) {
      this.updatedOrgNameErrorInfo = 'Organisation name should not exceed more than 40 chars';
    } else if (this.org.orgName.length > 40) {
      this.updatedOrgNameErrorInfo = 'Organisation name should not exceed more than 40 chars';
    } else {
      this.isUpdateorgNameValid = true;
      this.updatedOrgNameErrorInfo = '';
    }
    return this.isUpdateorgNameValid;
  }

/**
 * 
 * @returns 
 */
  validateWebsite() {
    if (this.org.orgWebsite === null) {
      this.isUpdateWebsiteNameValid = true;
      this.updatedOrgWebsiteErrorInfo = '';
    }else if(this.org.orgWebsite === ''){
      this.isUpdateWebsiteNameValid = true;
      this.updatedOrgWebsiteErrorInfo = '';
    }
    else if (this.org.orgWebsite.length < 6) {
      this.isUpdateWebsiteNameValid = false;
      this.updatedOrgWebsiteErrorInfo = 'Website should have minimum of 6 chars.';
    } else if (this.org.orgWebsite.length > 50) {
      this.isUpdateWebsiteNameValid = false;
      this.updatedOrgWebsiteErrorInfo = 'Website should not exceed more than 50 chars';
    } else {
      this.isUpdateWebsiteNameValid = true;
      this.updatedOrgWebsiteErrorInfo = '';
    }
    return this.isUpdateWebsiteNameValid;
  }

  /**
   * 
   * @returns 
   */
  validateOrgFunction() {
    if (this.org.orgFunctionalType === '') {
      this.isUpdateOrgFunctionValid = true;
      this.updatedorgFunctionalTypeErrorInfo = '';
    }else if(this.org.orgFunctionalType === null){
      this.isUpdateOrgFunctionValid = true;
      this.updatedorgFunctionalTypeErrorInfo = '';
    }
    else if (this.org.orgFunctionalType.length < 6) {
      this.isUpdateOrgFunctionValid = false;
      this.updatedorgFunctionalTypeErrorInfo = 'Functional Type should have minimum of 6 chars.';
    } else if (this.org.orgFunctionalType.length > 50) {
      this.isUpdateOrgFunctionValid = false;
      this.updatedorgFunctionalTypeErrorInfo = 'Functional Type should not exceed more than 50 chars';
    } else {
      this.isUpdateOrgFunctionValid = true;
      this.updatedorgFunctionalTypeErrorInfo = '';
    }
    return this.isUpdateOrgFunctionValid;
  }
 
  /**
   * 
   * @returns 
   */
  validateOrgContactPersonNameFunction() {
    if (this.org.orgContactPersonName === '') {
      this.isUpdateOrgContactPersonNameValid = true;
      this.updatedorgContactPersonNameErrorInfo = '';
    }else if(this.org.orgContactPersonName === null){
      this.isUpdateOrgContactPersonNameValid = true;
      this.updatedorgContactPersonNameErrorInfo = '';
    }
    else if (this.org.orgContactPersonName.length < 3) {
      this.isUpdateOrgContactPersonNameValid = false;
      this.updatedorgContactPersonNameErrorInfo = 'Organisation Contact person Name should have minimum of 3 chars.';
    } else if (this.org.orgContactPersonName.length > 50) {
      this.isUpdateOrgContactPersonNameValid = false;
      this.updatedorgContactPersonNameErrorInfo = 'Organisation Contact person should not exceed more than 50 chars';
    } else {
      this.isUpdateOrgContactPersonNameValid = true;
      this.updatedorgContactPersonNameErrorInfo = '';
    }
    return this.isUpdateOrgContactPersonNameValid;
  }


  // validate org contact person number
  /**
   * 
   * @returns 
   */
  validateOrgContactPersonNumber() {
    if (this.org.orgContactPersonNumber === '') {
      this.isUpdateOrgContactPersonNumberValid = true;
      this.updatedorgContactPersonNumberErrorInfo = '';
    }else if(this.org.orgContactPersonNumber === null){
      this.isUpdateOrgContactPersonNumberValid = true;
      this.updatedorgContactPersonNumberErrorInfo = '';
    }
    else if (this.org.orgContactPersonNumber.length < 10) {
      this.updatedorgContactPersonNumberErrorInfo = 'Organisation Contact person Number should have minimum of 10 digits.';
      this.isUpdateOrgContactPersonNumberValid = false;
    } else if (this.org.orgContactPersonNumber.length > 10) {
      this.updatedorgContactPersonNumberErrorInfo = 'Organisation Contact person Number should not exceed more than 10 digits';
      this.isUpdateOrgContactPersonNumberValid = false;
    } else {
      this.isUpdateOrgContactPersonNumberValid = true;
      this.updatedorgContactPersonNumberErrorInfo = '';
    }
    return this.isUpdateOrgContactPersonNumberValid;
  }

  /**
   * 
   * @returns 
   */
  validateOrgAddress() {
    if (this.org.orgAddress === '') {
      this.updatedOrgAddressErrorInfo = '';
      this.isUpdateOrgAddressValid = true;
    }else if (this.org.orgAddress === null){
      this.updatedOrgAddressErrorInfo = '';
      this.isUpdateOrgAddressValid = true;
    }
    else if (this.org.orgAddress.length < 30) {
      this.isUpdateOrgAddressValid = false;
      this.updatedOrgAddressErrorInfo = 'Organisation Address should have minimum of 30 chars';
    }
    else if (this.org.orgAddress.length > 300) {
      this.isUpdateOrgAddressValid = false;
      this.updatedOrgAddressErrorInfo = 'Organisation address should not exceed more than 300 chars';
    }
    else {
      this.isUpdateOrgAddressValid = true;
      this.updatedOrgAddressErrorInfo = '';
    }
    return this.isUpdateOrgAddressValid;
  }

  /**
   * 
   * @returns 
   */
  validateOrgContactNumber() {
    if (this.org.orgContactNumber === '') {
      this.updatedOrgContactNumberErrorInfo = '';
      this.isupdatedOrgContactNumberValid = true;
    }else if(this.org.orgContactNumber === null){
      this.updatedOrgContactNumberErrorInfo = '';
      this.isupdatedOrgContactNumberValid = true;
    }
    else if (this.org.orgContactNumber.length < 10) {
      this.isupdatedOrgContactNumberValid = false;
      this.updatedOrgContactNumberErrorInfo = 'Contact number should have minimum of 10 digits.';
    } else if (this.org.orgContactNumber.length > 10) {
      this.isupdatedOrgContactNumberValid = false;
      this.updatedOrgContactNumberErrorInfo = 'Contact number should not exceed more than 10 digits';
    } else {
      this.isupdatedOrgContactNumberValid = true;
      this.updatedOrgContactNumberErrorInfo = '';
    }
    return this.isupdatedOrgContactNumberValid;
  }


  /**
   * 
   * @returns 
   */
  validateOrgCountry() {
    if (this.org.orgCountry === '') {
      this.updatedOrgCountryErrorInfo = '';
      this.isupdatedOrgCountryValid = true;
    }else if(this.org.orgCountry === null){
      this.updatedOrgCountryErrorInfo = '';
      this.isupdatedOrgCountryValid = true;
    }
    else if (this.org.orgCountry.length < 4) {
      this.isupdatedOrgCountryValid = false;
      this.updatedOrgCountryErrorInfo = 'Organisation Country should have minimum of 4 chars.';
    } else if (this.org.orgCountry.length > 30) {
      this.isupdatedOrgCountryValid = false;
      this.updatedOrgCountryErrorInfo = 'Organisation Country should not exceed more than 30 chars.';
    } else {
      this.isupdatedOrgCountryValid = true;
      this.updatedOrgCountryErrorInfo = '';
    }
    return this.isupdatedOrgCountryValid;
  }

  /**
   * 
   * @returns 
   */
  validateOrgContactPersonEmail() {
    var emailRegExp = /^[A-Za-z0-9._]{2,30}[0-9]{0,9}@[A-Za-z]{3,12}[.]{1}[A-Za-z.]{3,6}$/;
    if (this.org.orgContactPersonEmail === '') {
      this.updatedorgContactPersonEmailErrorInfo = '';
      this.isUpdateOrgContactPersonEmailValid = true;
    }else if(this.org.orgContactPersonEmail === null){
      this.updatedorgContactPersonEmailErrorInfo = '';
      this.isUpdateOrgContactPersonEmailValid = true;
    }
    else if (emailRegExp.test(this.org.orgContactPersonEmail) === true) {
      this.updatedorgContactPersonEmailErrorInfo = '';
      this.isUpdateOrgContactPersonEmailValid = true;
    }
    else {
      this.isUpdateOrgContactPersonEmailValid = false;
      this.updatedorgContactPersonEmailErrorInfo = 'Please enter correct email ';
    }
    return this.isUpdateOrgContactPersonEmailValid;
  }

  /**
   * 
   * @returns 
   */
  validateSuperAdminEmail() {
    var emailRegExp = /^[A-Za-z0-9._]{2,30}[0-9]{0,9}@[A-Za-z]{3,12}[.]{1}[A-Za-z.]{3,6}$/;
    if (this.org.orgSuperAdminEmailId === '') {
      this.updatedOrgSuperAdminEmailErrorInfo = '';
      this.isUpdateOrgSuperAdminEmailValid = true;
    }else if(this.org.orgSuperAdminEmailId === null){
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

  /**
   * 
   * @returns 
   */
  validateCompanyEmail() {
    var emailRegExp = /^[A-Za-z0-9._]{2,30}[0-9]{0,9}@[A-Za-z]{3,12}[.]{1}[A-Za-z.]{2,6}$/;
    if (this.org.orgEmailId === '') {
      this.updatedCompanyEmailErrorInfo = '';
      this.isUpdateCompanyEmailValid = true;
    }else if(this.org.orgEmailId === null){
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
numberValidation(event: KeyboardEvent) {
  const invalidChars = ['+', '-', '.', 'e'];
  const emailRegExp = /[a-zA-Z]/;
  const inputElement = event.target as HTMLInputElement;
 
  if (
    invalidChars.includes(event.key) ||
    emailRegExp.test(event.key) ||
    (inputElement.value.length >= 10 && event.key !== 'Backspace')
  ) {
    event.preventDefault();
  }
}

}




