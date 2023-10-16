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

  @Output() title:string='Organization';

  constructor(private orgService: OrganizationService, private toast:ToastrService){

  }

  ngOnInit(): void {
      this.getOrganization();
  }

  org : Organization
  getOrganization(){
    //returns null if no org details are present in DB.
    this.orgService.getOrganization(10).subscribe(
      (response => {
        if(response.status === HttpStatusCode.Ok){
          console.log(response.body)
          this.org = response.body;
        }
      })
    )
  }
  isDisable:boolean=false
  editInfo(){
    this.isDisable=true
    console.log(this.isDisable)
  }
  cancelCompanyDetails(){
    this.isDisable=false;
  }

  saveOrUpdateOrg(){
  this.isDisable=false;
  if(this.org.orgId===null){
    console.log('save')
  this.orgService.saveOrganization(this.org).subscribe(
    (response=>{
      this.org=response.body;
    })
    )
  } 
  else if(this.org.orgId!=0){
    console.log('update')
    this.orgService.updateOrganization(this.org).subscribe(
      (response=>{
        this.org=response.body;
      })
    )

    }
  }



}
