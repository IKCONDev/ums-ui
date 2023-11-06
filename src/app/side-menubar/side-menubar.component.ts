
import { style } from '@angular/animations';
import { ElementRef, Output,OnInit } from '@angular/core';
import { Component, EventEmitter, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-menubar',
  templateUrl: './side-menubar.component.html',
  styleUrls: ['./side-menubar.component.css']
})
export class SideMenubarComponent {

  loggedInUserRole = localStorage.getItem('userRole');
  activate='';
  isMenuActive:boolean = false;
  overviewActive:string;

  constructor(private router: Router){

  }


  /**
   * 
   */
  ngOninit(){
    
  }

  /**
   * 
   * @param route 
   * @returns 
   */
  isActive(route:string):boolean{
    this.isMenuActive = this.router.isActive(route,true);
    if(this.isMenuActive){
      this.activate='active';
    }
    return this.isMenuActive
  }
}


