import { Component, ElementRef, Inject, Renderer2 } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { LoginService } from './service/login.service';
import { NavigationExtras } from '@angular/router';
import { HttpStatusCode } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { InteractionRequiredAuthError, LogLevel, PublicClientApplication } from '@azure/msal-browser'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {

  constructor(private router: Router, private elementRef: ElementRef, private renderer: Renderer2,
    @Inject(LoginService) private loginService: LoginService, private toastr: ToastrService) { 
     this.myMSALObj = new PublicClientApplication(this.msalConfig);
     
  }

  // ngDoCheck(){
  //   var username = document.getElementById('email');
  //   var password = document.getElementById('password');

  //   username.addEventListener("keypress", function(event) {
  //     // If the user presses the "Enter" key on the keyboard
  //     if (event.key === "Enter") {
  //       // Cancel the default action, if needed
  //       event.preventDefault();
  //       // Trigger the button element with a click
  //       document.getElementById("myBtn").click();
  //     }
  //   });
    
  // }

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
  console.log(this.router.url);
  this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#emailLabel'), 'display', 'none');
  this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#passwordLabel'), 'display', 'none');
  this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#passwordEye'), 'display','none');

  await this.initializeMSAL(); // Initialize MSAL first

  try {
      await this.myMSALObj.handleRedirectPromise();
      console.log("MSAL initialized.");
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
        console.log(this.username+" "+this.accessToken)
        localStorage.setItem('jwtToken',this.accessToken);
        this.router.navigateByUrl("/home");
        this.toastr.success('Login', 'login success')
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
  loginIfEnterButtonIsClicked(event: KeyboardEvent){
    //if enter button is clicked submit the form
    if(event.key === 'Enter'){
      this.login();
    }
  }

  /**
   * Custom login method of UMS application
   */
  login() {
    console.log('submitted')
    this.loginService.logUserIfValid(this.user).subscribe({
      next: response => {
        this.loginInfo.token = response.headers.get('token')
        this.loginInfo.userId = response.headers.get('userId')
        this.loginInfo.userRole = response.headers.get('userRole')
        this.loginInfo.firstName = response.headers.get('firstName')
        this.loginInfo.lastName = response.headers.get('lastName')
        this.loginInfo.email = response.headers.get('email')
        this.loginInfo.twoFactorAuth = response.headers.get('twoFactorAuth')
        this.loginInfo.jwtExpiry = response.headers.get('jwtExpiry').toString()
        console.log('Jwt expiry : '+ this.loginInfo.jwtExpiry);


        if (response.status == HttpStatusCode.Ok && this.loginInfo.twoFactorAuth === 'false') {
          //login success popup
          this.toastr.success('Login Success')
          this.errorInfo = ''
          localStorage.setItem('jwtToken', this.loginInfo.token);
          console.log(response.headers.get('token'));
          localStorage.setItem('userRole', this.loginInfo.userRole);
          localStorage.setItem('email', this.loginInfo.email);
          localStorage.setItem('firstName', this.loginInfo.firstName);
          localStorage.setItem('lastName', this.loginInfo.lastName);
          localStorage.setItem('userId', this.loginInfo.userId);
          localStorage.setItem('twofactorAuth', this.loginInfo.twoFactorAuth);
          localStorage.setItem('jwtExpiry',this.loginInfo.jwtExpiry)
          //set default tabs for meetings
          localStorage.setItem('tabOpened', 'OrganizedMeeting');
          //set default tabs for tasks
          localStorage.setItem('taskTabOpened', 'OrganizedTask');
          console.log(localStorage.getItem('userRole'))
          let navigationExtras: NavigationExtras = {
            state: {
              loginInfo: this.loginInfo
            }
          }
          this.router.navigate(['home'], {
            //queryParams: {
              //'user_token': localStorage.getItem('jwtToken')
            //}
          })
          console.log(navigationExtras + ' extras')
        }else if(response.status == HttpStatusCode.Ok && this.loginInfo.twoFactorAuth === 'true'){
          this.errorInfo = ''
          localStorage.setItem('jwtToken', this.loginInfo.token);
          console.log(response.headers.get('token'));
          localStorage.setItem('userRole', this.loginInfo.userRole);
          localStorage.setItem('email', this.loginInfo.email);
          localStorage.setItem('firstName', this.loginInfo.firstName);
          localStorage.setItem('lastName', this.loginInfo.lastName);
          localStorage.setItem('userId', this.loginInfo.userId);
          localStorage.setItem('twofactorAuth', this.loginInfo.twoFactorAuth);
          localStorage.setItem('jwtExpiry',this.loginInfo.jwtExpiry)
          let navigationExtras: NavigationExtras = {
            state: {
              loginInfo: this.loginInfo
            }
          }
          this.router.navigate(['two-step'], navigationExtras)
          console.log(navigationExtras + ' extras')
        }
      },error: error => {
        if (error.status === HttpStatusCode.ServiceUnavailable || error.status === HttpStatusCode.NotFound) {
          this.router.navigate(['/service-unavailable'])
        } else if (error.status === HttpStatusCode.Unauthorized) {
          this.errorInfo = 'Invalid Credentials'
          this.toastr.error('Incorrect username or password', 'Login Failure')
        }else if(error.status === HttpStatusCode.InternalServerError && error.error.trace.includes('UserInactiveException')){
          //dont even generate a jwt token for inactive user.
          this.toastr.error('Provided user account is inactive','Account Disabled')
        }
      }
   })
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
        this.renderer.setAttribute(emailInput, 'placeholder', 'Email Id');
        console.log('Focus is outside the textbox');
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
    this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#passwordEye'), 'display','block');
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
  showHidePassword(){
    this.inputField = document.getElementById("password") as HTMLInputElement;
    this.eyeIcon = document.getElementById('passwordEye') as HTMLElement;
    if(this.inputField.type === "password"){
      this.inputField.type = "text";
      this.eyeIcon.classList.add('fa-eye');
      this.eyeIcon.classList.remove('fa-eye-slash')
    }else{
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
}



