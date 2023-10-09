
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

  //selectedComponent:string;
  //@Output() componentToOpen: EventEmitter<string> = new EventEmitter<string>();

  constructor(private router: Router){

  }

  /*
  openComponent(selectedOption: string){
    this.selectedComponent = selectedOption;
    this.componentToOpen.emit(this.selectedComponent);
  }
  */

  overviewActive:string;
  ngOninit(){
  }


  setActive(type: string){
    if(type === 'meetings'){
      document.getElementById('meetingsActive').style.backgroundColor = 'white';
    }
  }
  activate='';
  isMenuActive:boolean = false;
  isActive(route:string):boolean{
    this.isMenuActive = this.router.isActive(route,true);
    if(this.isMenuActive){
      this.activate='active';
    }
    return this.isMenuActive
  }
    
   


}


