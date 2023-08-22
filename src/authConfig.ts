import { LogLevel, PublicClientApplication } from '@azure/msal-browser';  // Import the necessary modules

const msalConfig = {
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
                    case LogLevel.Error:  // Use LogLevel from the imported module
                        console.error(message);
                        return;
                    case LogLevel.Info:   // Use LogLevel from the imported module
                        console.info(message);
                        return;
                    case LogLevel.Verbose:  // Use LogLevel from the imported module
                        console.debug(message);
                        return;
                    case LogLevel.Warning:  // Use LogLevel from the imported module
                        console.warn(message);
                        return;
                }
            },
        },
    },
};

const loginRequest = {
    scopes: ["User.Read"]
};

/**
 * Add here the scopes to request when obtaining an access token for MS Graph API. For more information, see:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/resources-and-scopes.md
 */
const tokenRequest = {
    scopes: ["User.Read", "Mail.Read"],
    forceRefresh: true// Set this to "true" to skip a cached token and go to the server to get a new token
};


// Create an instance of PublicClientApplication
const myMSALObj = new PublicClientApplication(msalConfig);

// Rest of your code...
