import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordEmailVerificationComponent } from './forgot-password-email-verification/forgot-password-email-verification.component';
import { ForgotPasswordOtpValidationComponent } from './forgot-password-otp-validation/forgot-password-otp-validation.component';
import { ForgotPasswordResetComponent } from './forgot-password-reset/forgot-password-reset.component';
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
import { EmployeeComponent } from './employee/employee.component';
import { SessionTimeoutComponent } from './session-timeout/session-timeout.component';
import { ServiceUnavailableComponent } from './service-unavailable/service-unavailable.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { HelpcenterComponent } from './helpcenter/helpcenter.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { TaskCategoryComponent } from './task-category/task-category.component';
import { PermissionComponent } from './permission/permission.component';
import { ReportSettingsComponent } from './report-settings/report-settings.component';
import { AppMenuItemsComponent } from './app-menu-item/app-menu-item.component';
import { MeetingReportsComponent } from './meeting-reports/meeting-reports.component';
import { TaskReportsComponent } from './task-reports/task-reports.component';
import { ActionItemsReportsComponent } from './action-item-reports/action-item-reports.component';
import { RoleMenuitemsMapComponent } from './role-menuitems-map/role-menuitems-map.component';
import { TaskcategoryReportComponent } from './taskcategory-report/taskcategory-report.component';
import { UserRoleMenuitemPermissionComponent } from './user-role-menuitem-permission/user-role-menuitem-permission.component';


/**
 * escribe the routes for the required components of UMS application
 */
const routes: Routes = [
  {path:"",component:LoginComponent},
  {path:"home",component:HomeComponent},
  {path:"login", component: LoginComponent},
  {path:"verify-email", component:ForgotPasswordEmailVerificationComponent},
  {path:"verify-otp", component: ForgotPasswordOtpValidationComponent},
  {path:"reset-password", component: ForgotPasswordResetComponent},
  {path:"two-step", component:TwofactorAuthenticationComponent},
  {path:"verify-twostep", component: TwofactorOtpValidationComponent},
  {path:"meetings", component: MeetingsComponent},
  {path:"actions",component:ActionItemComponent},
  {path:"task",component:TaskComponent},
  {path:"my-profile",component:MyProfileComponent},
  {path:"reports",component:ReportComponent},
  {path:"batch-report",component:BatchDetailsComponent},
  {path:"settings",component:SettingsComponent},
  {path:"departments",component: DepartmentComponent},
  {path:"designations", component: DesignationComponent},
  {path:"users", component: UsersComponent},
  {path:'organization', component: OrganizationComponent},
  {path:'roles', component: RoleComponent},
  {path: 'employee',component:EmployeeComponent},
  {path: 'session-timeout', component: SessionTimeoutComponent},
  {path: 'service-unavailable', component:ServiceUnavailableComponent},
  {path: 'help',component:HelpcenterComponent},
  {path: 'task-category', component: TaskCategoryComponent},
  {path: 'unauthorized', component: UnauthorizedComponent},
  {path: 'permission', component: PermissionComponent},
  {path :'report-settings',component :ReportSettingsComponent},
  {path: 'menu-item', component: AppMenuItemsComponent},
  {path: 'meeting-report', component: MeetingReportsComponent},
  {path: 'task-reports', component: TaskReportsComponent},
  {path: 'actionitem-reports', component: ActionItemsReportsComponent},
  {path:'role-menuitems-map', component:RoleMenuitemsMapComponent},
  {path :'taskcategory-report', component:TaskcategoryReportComponent},
  {path: 'modify-permissions', component: UserRoleMenuitemPermissionComponent},
  //{path:"overview", component: OverviewComponent},
  {path: 'lazy', loadChildren: () => import('./lazy/lazy.module').then(m => m.LazyModule) },
  {path: '**', component:PageNotFoundComponent},
  {path: '',redirectTo:'/login', pathMatch: 'full'}
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{useHash:true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
