import { Component, ElementRef, Inject, Output, Renderer2 } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject, first, fromEvent, lastValueFrom } from 'rxjs';
import { LoginService } from './service/login.service';
import { NavigationExtras } from '@angular/router';
import { HttpStatusCode } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { InteractionRequiredAuthError, LogLevel, PublicClientApplication } from '@azure/msal-browser';
import { NotificationService } from '../notifications/service/notification.service';
import { UserRoleMenuItemPermissionMap } from '../model/UserRoleMenuItemPermissionMap.model';
import { UserRoleMenuItemPermissionService } from '../user-role-menuitem-permission/service/user-role-menuitem-permission.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {
  subscription: any;

  constructor(private router: Router, private elementRef: ElementRef, private renderer: Renderer2,
    @Inject(LoginService) private loginService: LoginService, private toastr: ToastrService,
    private notificationService: NotificationService, private userRoleMenuItemPermissionMapService: UserRoleMenuItemPermissionService) {
    this.myMSALObj = new PublicClientApplication(this.msalConfig);
    history.pushState(null,null,location.href)
    this.subscription = fromEvent(window, 'popstate').subscribe(_ => {
      history.pushState(null, null, location.href);
   });
  }

  /**
 * MICROSOFT AUTH LOGIN STARTS HERE
 */
  msalConfig = {
    auth: {
      clientId: "20acd1bc-5533-4aaa-a77c-91d2600abea3",
      authority: "https://login.microsoftonline.com/07c65ba0-ad88-46c0-bee7-90912bc21e8e",
      redirectUri: "http://localhost:4200", // Your Angular app's URL
    },
    cache: {
      cacheLocation: "localStorage",
      storeAuthStateInCookie: false,
    },
    system: {
      loggerOptions: {
        loggerCallback: (level, message, containsPii) => {
          if (containsPii) {
            return;
          }
          switch (level) {
            case LogLevel.Error:
              console.error(message);
              return;
            case LogLevel.Info:
              console.info(message);
              return;
            case LogLevel.Verbose:
              console.debug(message);
              return;
            case LogLevel.Warning:
              console.warn(message);
              return;
          }
        },
      },
    },
  };

  loginRequest = {
    scopes: ["User.Read"]
  };

  /**
   * Add here the scopes to request when obtaining an access token for MS Graph API. For more information, see:
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/resources-and-scopes.md
   */
  tokenRequest = {
    scopes: ["User.Read", "Mail.Read"],
    forceRefresh: true// Set this to "true" to skip a cached token and go to the server to get a new token
  };

  username = "";
  accessToken = "";
  myMSALObj;
  disableLoginButton:boolean=false;

  /**
   * initializes the MicrosoftAuthLibraryObject
   */
  async initializeMSAL() {
    await this.myMSALObj.initialize();
  }

  /**
   * asyncNOnInit - executes whenever the component is initialized
   */
  async ngOnInit() {
    //check if user is logged in
    if (localStorage.getItem('jwtToken') != null) {
      this.router.navigateByUrl('/home')
      //   //this.toastr.warning('You are already logged in. Please logout to login again')
    }
    this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#emailLabel'), 'display', 'none');
    this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#passwordLabel'), 'display', 'none');
    this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#passwordEye'), 'display', 'none');

    await this.initializeMSAL(); // Initialize MSAL first

    try {
      await this.myMSALObj.handleRedirectPromise();
    } catch (error) {
      console.error("MSAL initialization error:", error);
    }
  }

  /**
   * 
   * @returns 
   */
  selectAccount() {
    const currentAccounts = this.myMSALObj.getAllAccounts();
    if (currentAccounts.length === 0) {
      // this.toastr.error('Bad Credentials', 'Login Failure')
      return;
    } else if (currentAccounts.length > 1) {
      // Add choose account code here
      console.warn("Multiple accounts detected.");
    } else if (currentAccounts.length === 1) {
      this.username = currentAccounts[0].username;
      //showWelcomeMessage(username);
    }
  }

  /**
   * 
   * @param response 
   */
  handleResponse(response) {
    if (response !== null) {
      this.username = response.account.username;
      this.accessToken = response.accessToken;
      console.log(this.username + " " + this.accessToken)
      localStorage.setItem('jwtToken', this.accessToken);
      this.router.navigateByUrl("/home");
      this.toastr.success('Login', 'Logged in successfully')
    } else {
      this.selectAccount();
    }
  }

  /**
   * Sign in to Microsoft Account
   */
  async signIn() {
    await this.initializeMSAL(); // Initialize MSAL first
    this.myMSALObj.loginPopup(this.loginRequest)
      .then(response => this.handleResponse(response),)
      .catch(error => {
        console.error(error);
      });
  }

  /**
   * Signout method - optional
   */
  signOut() {
    const logoutRequest = {
      account: this.myMSALObj.getAccountByUsername(this.username),
      postLogoutRedirectUri: this.msalConfig.auth.redirectUri,
      mainWindowRedirectUri: this.msalConfig.auth.redirectUri
    };

    this.myMSALObj.logoutPopup(logoutRequest);
  }

  /**
   * Shows the token popup to login to application
   * @param request 
   * @returns 
   */
  getTokenPopup(request) {

    /**
     * See here for more info on account retrieval: 
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
     */
    request.account = this.myMSALObj.getAccountByUsername(this.username);

    return this.myMSALObj.acquireTokenSilent(request)
      .catch(error => {
        console.warn("silent token acquisition fails. acquiring token using popup");
        if (error instanceof InteractionRequiredAuthError) {
          // fallback to interaction when silent call fails
          return this.myMSALObj.acquireTokenPopup(request)
            .then(tokenResponse => {
              console.log(tokenResponse);
              return tokenResponse;
            }).catch(error => {
              console.error(error);
            });
        } else {
          console.warn(error);
          return null;
        }
      });
  }

  /**
   * CUSTOM LOGIN IMPL STARTS HERE
   */
  user = {
    email: '',
    password: ''
  }

  loginInfo = {
    token: '',
    userId: '',
    userRole: '',
    firstName: '',
    lastName: '',
    email: '',
    twoFactorAuth: '',
    jwtExpiry: ''
  }

  errorInfo: String = ''
  inputField: HTMLInputElement;
  eyeIcon: HTMLElement;
  private destroy$: Subject<void> = new Subject<void>();


  /**
   * sets the input text field value to user object
   * @param username 
   */
  setUsername(username: any) {
    this.user.email = username.target.value;
  }

  /**
   * sets the input password value to user object
   * @param password 
   */
  setPassword(password: any) {
    this.user.password = password.target.value;
  }

  /**
   * Login to application when Enter button is clicked
   * @param event 
   */
  loginIfEnterButtonIsClicked(event: KeyboardEvent) {
    //if enter button is clicked submit the form
    if (event.key === 'Enter') {
      this.login();
    }
  }

  /**
   * Custom login of UMS application
   */
  async login(): Promise<void> {
    this.disableLoginButton=true;
    setTimeout(()=>{
      this.disableLoginButton=false;
    },2000)
    if(this.user.email===null||this.user.email===""||this.user.password===null||this.user.password===""){
       if(this.user.email===null&&this.user.password===null || this.user.email===""&&this.user.password===""){
      this.toastr.error("Enter email ID and password");
       }
       else if(this.user.email===null||this.user.email===""){
        this.toastr.error("Enter email ID");
       }
       else if(this.user.password===null||this.user.password===""){
        this.toastr.error("Enter password");
       }
    }
    else{
    console.log('Login Process Started')
    if (localStorage.getItem('jwtToken') === null || localStorage.getItem('jwtToken') === "") {
      this.checkLogin();
      this.loginService.logUserIfValid(this.user).subscribe({
        next: response => {
          this.loginInfo.token = response.headers.get('token');
          this.loginInfo.userId = response.headers.get('userId');
          this.loginInfo.userRole = response.headers.get('userRole');
          this.loginInfo.firstName = response.headers.get('firstName');
          this.loginInfo.lastName = response.headers.get('lastName');
          this.loginInfo.email = response.headers.get('email');
          this.loginInfo.twoFactorAuth = response.headers.get('twoFactorAuth');
          this.loginInfo.jwtExpiry = response.headers.get('jwtExpiry').toString();
          const userRPMJSONMap = response.headers.get('userRoleMenuItemsPermissionMap');
          // var userRoleMenuItemPermissionMap = response.headers.get('userRoleMenuItemsPermissionMap');
          // const map = new Map(Object.entries(JSON.parse(userRoleMenuItemPermissionMap)));
          setTimeout(() => {
            var firstName = response.headers.get('firstName');
            var lastName = response.headers.get('lastName');
            if (firstName != null && lastName != null || firstName != "" && lastName != "") {
              document.title = "UMS - " + this.loginInfo.firstName + " " + this.loginInfo.lastName;
            }
            else {
              document.title = "UMS";
            }
          },1000)
          if (response.status == HttpStatusCode.Ok && this.loginInfo.twoFactorAuth === 'false') {

            //login success popup
            localStorage.setItem('count1',String(1))
            this.errorInfo = ''
            localStorage.setItem('jwtToken', this.loginInfo.token);
            localStorage.setItem('userRole', this.loginInfo.userRole);
            localStorage.setItem('email', this.loginInfo.email);
            localStorage.setItem('firstName', this.loginInfo.firstName);
            localStorage.setItem('lastName', this.loginInfo.lastName);
            localStorage.setItem('userId', this.loginInfo.userId);
            localStorage.setItem('twofactorAuth', this.loginInfo.twoFactorAuth);
            localStorage.setItem('jwtExpiry', this.loginInfo.jwtExpiry)
            localStorage.setItem('userRoleMenuItemPermissionMap', userRPMJSONMap);
            this.disableLoginButton=false;
            //set default tabs for meetings
            localStorage.setItem('tabOpened', 'OrganizedMeeting');
            //set default tabs for tasks
            localStorage.setItem('taskTabOpened', 'OrganizedTask');

            //set default values for reportees data
            localStorage.setItem('selectedReporteeOrganizedActionItem', '');
            localStorage.setItem('selectedReporteeOrganizedMeeting', '');
            localStorage.setItem('selectedReporteeAssignedMeeting', '');
            localStorage.setItem('selectedReporteeOrganized', '');
            localStorage.setItem('selectedReporteeAssigned', '');
            console.log(localStorage.getItem('jwtToken'));
            //set default values for organized meeting filters
            localStorage.setItem('organizedMeetingTitleFilter', '');
            localStorage.setItem('organizedMeetingOganizerFilter', '');
            localStorage.setItem('organizedMeetingStartDateFilter', '');
            localStorage.setItem('organizedMeetingEndDateFilter', '');

            //set default values for attended filters
            localStorage.setItem('attendedMeetingTitleFilter', '');
            localStorage.setItem('attendedMeetingOganizerFilter', '');
            localStorage.setItem('attendedMeetingStartDateFilter', '');
            localStorage.setItem('attendedMeetingEndDateFilter', '');

            //set default values for action item filters
            localStorage.setItem("actionItemNameFilter", '');
            localStorage.setItem("actionItemOwnerFilter", '');
            localStorage.setItem("actionItemStartDateFilter", '');
            localStorage.setItem("actionItemEndDateFilter", '');

            //set default table size for meetings table and action items table
            localStorage.setItem('actionItemTableSize', "10");
            localStorage.setItem('meetingTableSize', "10");

            localStorage.setItem('selectedUser', localStorage.getItem('email'));

            let navigationExtras: NavigationExtras = {
              state: {
                loginInfo: this.loginInfo
              }
            }
            var loginAttempts = response.headers.get('loginAttempts');
            var active = response.headers.get('userActive');
            if(parseInt(loginAttempts) > 3 || active === 'false'){
              this.router.navigateByUrl('/login')
              this.toastr.error('Provided user account is inactive', 'Account Disabled')
              localStorage.clear();
              return;
            }else{
              this.toastr.success('','Logged in successfully')
              this.router.navigate(['home'], {
                //queryParams: {
                //'user_token': localStorage.getItem('jwtToken')
                //}
              })
            }    
            //this.getNotificationCount(this.loginInfo.email);
          } else if (response.status == HttpStatusCode.Ok && this.loginInfo.twoFactorAuth === 'true') {
            this.errorInfo = ''
           // localStorage.setItem('jwtToken', this.loginInfo.token);
            localStorage.setItem('userRole', this.loginInfo.userRole);
            localStorage.setItem('email', this.loginInfo.email);
            localStorage.setItem('firstName', this.loginInfo.firstName);
            localStorage.setItem('lastName', this.loginInfo.lastName);
            localStorage.setItem('userId', this.loginInfo.userId);
            localStorage.setItem('twofactorAuth', this.loginInfo.twoFactorAuth);
            localStorage.setItem('jwtExpiry', this.loginInfo.jwtExpiry)
           localStorage.setItem('userRoleMenuItemPermissionMap', userRPMJSONMap);
            this.disableLoginButton=false;
            //set default tabs for meetings
            localStorage.setItem('tabOpened', 'OrganizedMeeting');
            //set default tabs for tasks
            localStorage.setItem('taskTabOpened', 'OrganizedTask');

            //set default values for reportees data
            localStorage.setItem('selectedReporteeOrganizedActionItem', '');
            localStorage.setItem('selectedReporteeOrganizedMeeting', '');
            localStorage.setItem('selectedReporteeAssignedMeeting', '');
            localStorage.setItem('selectedReporteeOrganized', '');
            localStorage.setItem('selectedReporteeAssigned', '');

            //set default values for filters
            localStorage.setItem('organizedMeetingTitleFilter', '');
            localStorage.setItem('organizedMeetingOganizerFilter', '');
            localStorage.setItem('organizedMeetingStartDateFilter', '');
            localStorage.setItem('organizedMeetingEndDateFilter', '');

            //set default values for attended filters
            localStorage.setItem('attendedMeetingTitleFilter', '');
            localStorage.setItem('attendedMeetingOganizerFilter', '');
            localStorage.setItem('attendedMeetingStartDateFilter', '');
            localStorage.setItem('attendedMeetingEndDateFilter', '');

            localStorage.setItem("actionItemNameFilter", '');
            localStorage.setItem("actionItemOwnerFilter", '');
            localStorage.setItem("actionItemStartDateFilter", '');
            localStorage.setItem("actionItemEndDateFilter", '');

             //set default table size for meetings table and action items table
            localStorage.setItem('actionItemTableSize', "10");
            localStorage.setItem('meetingTableSize', "10");

            localStorage.setItem('selectedUser', localStorage.getItem('email'));

            let navigationExtras: NavigationExtras = {
              state: {
                loginInfo: this.loginInfo
              }
            }
            var loginAttempts = response.headers.get('loginAttempts');
            var active = response.headers.get('userActive');
            if(parseInt(loginAttempts) > 3 || active === 'false'){
              this.router.navigateByUrl('/login')
              this.toastr.error('Provided user account is inactive', 'Account Disabled')
              localStorage.clear();
              return;
            }
            else{
              this.router.navigate(['two-step'], navigationExtras);
            }
            //this.getNotificationCount(this.loginInfo.email);
          }
        }, error: error => {
          if (error.status === HttpStatusCode.ServiceUnavailable || error.status === HttpStatusCode.NotFound) {
            this.router.navigate(['/service-unavailable'])
            setTimeout(()=>{
              this.disableLoginButton=false;
            },1200)
          }else if(error.status == HttpStatusCode.InternalServerError){
            this.toastr.error('Incorrect username or passoword.','Login Failure');
          }
           else if (error.status === HttpStatusCode.Unauthorized) {

            var loginAttempts = error.headers.get('loginAttempts');
            console.log(loginAttempts)
            var active = error.headers.get('userActive');
            if(loginAttempts ===null &&error.status === HttpStatusCode.Unauthorized){
              this.toastr.error('Invalid username or password')
            }
            else if(parseInt(loginAttempts) === 2){
              this.toastr.error('Incorrect username or password. '+(3-loginAttempts)+' attempt remaining', 'Login Failure')
            }
            else if(parseInt(loginAttempts) === 1 ){
              this.errorInfo = 'Invalid Credentials'
              this.toastr.error('Incorrect username or password. '+(3-loginAttempts)+' attempts remaining', 'Login Failure')
            }
            else if(parseInt(loginAttempts) === 3 ){
              this.errorInfo = 'Invalid Credentials'
              this.toastr.error('Incorrect username or password. No attempts remaining', 'Login Failure')
            }
            else if(parseInt(loginAttempts) > 3 || active === 'false'){
              this.toastr.error('Provided user account is inactive', 'Account Disabled')
            }
            // setTimeout(()=>{
            //   this.disableLoginButton=false;
            // },1200)
          }
          // on error clear localstorage
          window.localStorage.clear();
        }
      })
    } else {
      this.toastr.error('Another session is already running, please navigate to the already opened UMS application tab');
      setTimeout(()=>{
        this.disableLoginButton=false;
      },1200)
    }
  }
}

  /**
   * set the email input place holder
   */
  setupEmailInputPlaceholder(): void {
    const emailInput = this.elementRef.nativeElement.querySelector('#email');

    // On click, set the placeholder to an empty string
    this.renderer.setAttribute(emailInput, 'placeholder', '');
    this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#emailLabel'), 'display', 'block');
    this.renderer.addClass(this.elementRef.nativeElement.querySelector('#emailDiv'), 'group');

    // Add a click event listener to the body
    this.renderer.listen('body', 'click', (event: MouseEvent) => {
      if (!emailInput.contains(event.target)) {
        // Execute when the focus is outside the textbox
        this.renderer.setAttribute(emailInput, 'placeholder', 'Email ID');
        //this.renderer.removeClass(this.elementRef.nativeElement.querySelector('#emailDiv'), 'group');
        //this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#emailLabel'), 'display', 'none');
      }
    });
  }

  /**
   * set the password input place holder
   * @param event 
   */
  setupPasswordInputPlaceholder(event: any) {
    const passwordInput = this.elementRef.nativeElement.querySelector('#password');

    // On click, set the placeholder to an empty string
    this.renderer.setAttribute(passwordInput, 'placeholder', '');
    this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#passwordLabel'), 'display', 'block');
    this.renderer.addClass(this.elementRef.nativeElement.querySelector('#passwordDiv'), 'group');

    // Add a click event listener to the body
    this.renderer.listen('body', 'click', (event: MouseEvent) => {
      if (!passwordInput.contains(event.target)) {
        // Execute when the focus is outside the textbox
        this.renderer.setAttribute(passwordInput, 'placeholder', 'Password');
        //this.renderer.removeClass(this.elementRef.nativeElement.querySelector('#passwordDiv'), 'group');
        //this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#passwordLabel'), 'display', 'none');
      }
    });
    this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#passwordEye'), 'display', 'block');
    /*
    this.renderer.listen('body', 'click', (event: MouseEvent) => {
      if (!passwordInput.contains(event.target)) {
        this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#passwordEye'), 'display','none');
      }
    });
    */
    /*
    if(event.target.value === ''){
     this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#passwordEye'), 'display','none');
    }
    */
  }

  /**
   * show / hide the password on eye button click
   */
  showHidePassword() {
    this.inputField = document.getElementById("password") as HTMLInputElement;
    this.eyeIcon = document.getElementById('passwordEye') as HTMLElement;
    if (this.inputField.type === "password") {
      this.inputField.type = "text";
      this.eyeIcon.classList.add('fa-eye');
      this.eyeIcon.classList.remove('fa-eye-slash')
    } else {
      this.inputField.type = "password";
      this.eyeIcon.classList.remove('fa-eye');
      this.eyeIcon.classList.add('fa-eye-slash')
    }
  }


  /**
   * executes when the component is destroyed/uninitialized
   */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkLogin(){
    var emailRegExp=/^[A-Za-z0-9._]{2,30}[0-9]{0,9}@[A-Za-z]{3,12}[.]{1}[A-Za-z.]{3,6}$/;
    if(emailRegExp.test(this.user.email)===false){
      this.errorInfo = 'Invalid Credentials'
      //this.toastr.error('Incorrect username or password', 'Login Failure')
      setTimeout(()=>{
        this.disableLoginButton=false;
      },1200)
    }
  }
}



