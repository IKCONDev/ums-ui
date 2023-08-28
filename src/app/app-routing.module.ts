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

const routes: Routes = [
  {path: '', redirectTo:'/login', pathMatch: 'full'},
  {path:"",component:LoginComponent},
  {path:"home",component:HomeComponent},
  {path:"login", component: LoginComponent},
  {path:"verify-email", component:ForgotPasswordEmailVerificationComponent},
  {path:"verify-otp", component: ForgotPasswordOtpValidationComponent},
  {path:"reset-password", component: ForgotPasswordResetComponent},
  {path:"not-found", component:PageNotFoundComponent},
  {path:"two-step", component:TwofactorAuthenticationComponent},
  {path:"verify-twostep", component: TwofactorOtpValidationComponent},
  { path: 'lazy', loadChildren: () => import('./lazy/lazy.module').then(m => m.LazyModule) },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{useHash:true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
