import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { UmsLogoComponent } from './ums-logo/ums-logo.component';
import * as $ from 'jquery';
import { ForgotPasswordEmailVerificationComponent } from './forgot-password-email-verification/forgot-password-email-verification.component';
import { RouterModule } from '@angular/router';
import { ForgotPasswordOtpValidationComponent } from './forgot-password-otp-validation/forgot-password-otp-validation.component';
import { ForgotPasswordResetComponent } from './forgot-password-reset/forgot-password-reset.component';
import { LoginNavbarComponent } from './login-navbar/login-navbar.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { SideMenubarComponent } from './side-menubar/side-menubar.component';
import { TwofactorAuthenticationComponent } from './twofactor-authentication/twofactor-authentication.component';
import { TwofactorOtpValidationComponent } from './twofactor-otp-validation/twofactor-otp-validation.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import {MyProfileComponent  } from './my-profile/my-profile.component';
import { MeetingsComponent } from './meetings/meetings.component';
import { OverviewComponent } from './overview/overview.component';
import { ActionItemComponent } from './action-item/action-item.component';
import { TaskComponent } from './task/task.component';
import { ReportComponent } from './report/report.component';
import { MeetingActionitemsComponent } from './meeting-actionitems/meeting-actionitems.component';
import { NgSelectModule } from '@ng-select/ng-select';

//import  '../../fonts/general-sans/css/general-sans.css';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    UmsLogoComponent,
    ForgotPasswordEmailVerificationComponent,
    ForgotPasswordOtpValidationComponent,
    ForgotPasswordResetComponent,
    LoginNavbarComponent,
    PageNotFoundComponent,
    HeaderComponent,
    SideMenubarComponent,
    TwofactorAuthenticationComponent,
    TwofactorOtpValidationComponent,
    MyProfileComponent,
    MeetingsComponent,
    OverviewComponent,
    ActionItemComponent,
    TaskComponent,
    ReportComponent,
    MeetingActionitemsComponent   
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ToastrModule.forRoot(),
    BrowserAnimationsModule,
    NgSelectModule
  ],
  providers: [{provide: LocationStrategy, useClass: HashLocationStrategy}],
  bootstrap: [AppComponent]
})
export class AppModule { }
