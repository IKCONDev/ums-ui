import { Component, OnInit, Output } from '@angular/core';
import { OrganizationService } from './service/organization.service';
import { Organization } from '../model/Organization.model';
import { HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.css']
})
export class OrganizationComponent implements OnInit {

  @Output() title:string='Organization';

  constructor(private orgService: OrganizationService){

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
  isDisable:boolean=true
  editInfo(){
    this.isDisable=false
  }



}
