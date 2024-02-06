import { Component } from '@angular/core';
import {LocationStrategy} from '@angular/common';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ums-ui';
  constructor(private Location: LocationStrategy ) {
     if(environment.production){
      console.log('PRODUCTION')
      console.log(environment.apiURL)
     }else{
      console.log('DEVELOPMENT')
      console.log(environment.apiURL)
     }
    }
}
