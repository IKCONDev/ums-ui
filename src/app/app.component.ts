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
    history.pushState(null, null, window.location.href="http://localhost:4200/#/");
    this.Location.onPopState(() => {
    history.pushState(null, null, window.location.href);
    });
    }
}
