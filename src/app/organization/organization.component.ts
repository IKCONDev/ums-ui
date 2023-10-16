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
    this.orgService.getOrganization(1).subscribe(
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
  }
  cancelCompanyDetails(){
    this.isDisable=false;
  }

  saveOrUpdateOrg(){
  this.isDisable=false;
  if(this.org.orgId===null){
  this.orgService.saveOrganization(this.org).subscribe(
    (response=>{
      this.org=response.body;
    })
    )
  } 
  else if(this.org.orgId!=0){
    this.orgService.updateOrganisation(this.org).subscribe(
      (response=>{
        this.org=response.body;
      })
    )

    }
  }



}
