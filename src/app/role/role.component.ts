import { Component, OnInit, Output } from '@angular/core';
import { RoleService } from './service/role.service';
import { Role } from '../model/Role.model';
import { ToastrService } from 'ngx-toastr';
import { HttpStatus } from '@azure/msal-common';
import { HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit {

  @Output() title:string='Roles';

  ngOnInit(): void {
    
  }

  addRoleObj = {
    roleId:0,
    roleName:''
  }

  constructor ( private roleService: RoleService , private toastr: ToastrService){

  }

  createdRole: Role
  createRole(){
    this.roleService.createRole(this.addRoleObj).subscribe(
      (response=>{ 
        
        if (response.status == HttpStatusCode.Created) {
          this.createdRole = response.body;
          this.toastr.success ("Role Created Sucessfully !")
        }else {
          this.toastr.error ("Role not created. Please try again.")
        }
      })
    )
  }


}
