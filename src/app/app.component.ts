import { Component } from '@angular/core';
import {LocationStrategy} from '@angular/common';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ums-ui';
  constructor(private Location: LocationStrategy ) {

    }
}
