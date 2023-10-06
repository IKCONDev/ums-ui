import { Component, EventEmitter, Output } from '@angular/core';
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

  setActive(type: string){
    if(type === 'meetings'){
      document.getElementById('meetingsActive').style.backgroundColor = 'black';
    }
  }

}
