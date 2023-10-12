import { Component, OnInit, Output } from '@angular/core';
import { RoleService } from './service/role.service';
import { Role } from '../model/Role.model';
import { ToastrService } from 'ngx-toastr';
import { HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit {

  @Output() title:string='Roles';

  ngOnInit(): void {
    this.getRoleList();
  }

  addRoleObj = {
    roleId:0,
    roleName:''
  }

  constructor ( private roleService: RoleService , private toastr: ToastrService){

  }

  /**
   * create a new role
   */
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

  /**
   * get all roles
   */
  roleList: Role[];
  getRoleList(){
    this.roleService.getAllRoles().subscribe(
      (response=>{
        if(response.status === HttpStatusCode.Ok){
          this.roleList = response.body;
          console.log(response.body)
        }
      })
    )
  }


}
