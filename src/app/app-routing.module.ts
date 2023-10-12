import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordEmailVerificationComponent } from './forgot-password-email-verification/forgot-password-email-verification.component';
import { ForgotPasswordOtpValidationComponent } from './forgot-password-otp-validation/forgot-password-otp-validation.component';
import { ForgotPasswordResetComponent } from './forgot-password-reset/forgot-password-reset.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { TwofactorAuthenticationComponent } from './twofactor-authentication/twofactor-authentication.component';
import { TwofactorOtpValidationComponent } from './twofactor-otp-validation/twofactor-otp-validation.component';
import { MeetingsComponent } from './meetings/meetings.component';
import { OverviewComponent } from './overview/overview.component';
import { ActionItemComponent } from './action-item/action-item.component';
import { TaskComponent } from './task/task.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { ReportComponent } from './report/report.component';
import { SettingsComponent } from './settings/settings.component';
import { BatchDetailsComponent } from './batch-details/batch-details.component';
import { DepartmentComponent } from './department/department.component';
import { DesignationComponent } from './designation/designation.component';
import { UsersComponent } from './users/users.component';
import { OrganizationComponent } from './organization/organization.component';
import { RoleComponent } from './role/role.component';


/**
 * 
 */
const routes: Routes = [
  {path:"",component:LoginComponent},
  {path:"home",component:HomeComponent},
  {path:"login", component: LoginComponent},
  {path:"verify-email", component:ForgotPasswordEmailVerificationComponent},
  {path:"verify-otp", component: ForgotPasswordOtpValidationComponent},
  {path:"reset-password", component: ForgotPasswordResetComponent},
  {path:"not-found", component:PageNotFoundComponent},
  {path:"two-step", component:TwofactorAuthenticationComponent},
  {path:"verify-twostep", component: TwofactorOtpValidationComponent},
  {path:"meetings", component: MeetingsComponent},
  {path:"actions",component:ActionItemComponent},
  {path:"task",component:TaskComponent},
  {path:"my-profile",component:MyProfileComponent},
  {path:"reports",component:ReportComponent},
  {path:"batch-details",component:BatchDetailsComponent},
  {path:"settings",component:SettingsComponent},
  {path:"departments",component: DepartmentComponent},
  {path:"designations", component: DesignationComponent},
  {path:"users", component: UsersComponent},
  {path:'organization', component: OrganizationComponent},
  {path:'role', component: RoleComponent},
 
  //{path:"overview", component: OverviewComponent},
  {path: 'lazy', loadChildren: () => import('./lazy/lazy.module').then(m => m.LazyModule) },
  {path: '',redirectTo:'/login', pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{useHash:true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
