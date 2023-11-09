import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  title: string = 'Settings';
  loggedInUserRole = localStorage.getItem('userRole');


  /**
   * 
   */
  constructor(private router: Router){
    
  }

  /**
   * 
   */
  ngOnInit(): void {
    if(this.loggedInUserRole != 'ADMIN' && this.loggedInUserRole != 'SUPER_ADMIN'){
      this.router.navigateByUrl('/unauthorized');
    }
  }



}
