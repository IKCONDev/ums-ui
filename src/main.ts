import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { bootstrapApplication } from '@angular/platform-browser';


platformBrowserDynamic().bootstrapModule(AppModule).then(() => {
  var firstName = localStorage.getItem('firstName')
  var lastName = localStorage.getItem('lastName');
  if (firstName != null && lastName != null) {
    document.title = "UMS - " + firstName + " " + lastName;
  }
  else {
    document.title = "UMS";
  }
})
  .catch(err => console.error(err))



