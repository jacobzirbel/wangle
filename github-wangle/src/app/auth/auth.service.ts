import { Injectable } from '@angular/core';
import {
    UserManager,
    User,
    UserManagerSettings,
    WebStorageStateStore,
} from 'oidc-client';
import { Subject } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private userManager: UserManager;
    private user: User;
    private loginChangedSubject = new Subject<boolean>();

    loginChanged = this.loginChangedSubject.asObservable();

    loggedIn: boolean;
    constructor() {
        const stsAuthority = 'xx';
        const clientId = 'xx';
        const clientRoot = `${window.location.protocol}//${window.location.host}/`;

        const stsSettings: UserManagerSettings = {
            authority: stsAuthority, //stsAuthority
            client_id: clientId,
            redirect_uri: `${clientRoot}signin-callback`,
            scope: 'openid profile',
            response_type: 'code',
            userStore: new WebStorageStateStore({ store: window.localStorage }),
            metadata: {
                issuer: stsAuthority,
                authorization_endpoint: `${stsAuthority}authorize?audience=https://prowaypoint.azurewebsites.net`,
                jwks_uri: `${stsAuthority}.well-known/jwks.json`,
                token_endpoint: `${stsAuthority}oauth/token`,
                userinfo_endpoint: `${stsAuthority}userinfo`,
                end_session_endpoint: `${stsAuthority}v2/logout?client_id=${clientId}&returnTo=${encodeURI(
                    clientRoot
                )}signout-callback`,
            },
        };
        this.userManager = new UserManager(stsSettings);
    }

    login() {
        return this.userManager.signinRedirect();
    }

    isLoggedIn(): Promise<boolean> {
        return this.userManager.getUser().then((user) => {
            const userCurrent = !!user && !user.expired;
            if (this.user !== user) {
                this.loggedIn = userCurrent;
                this.loginChangedSubject.next(userCurrent);
            }
            this.user = user;
            return userCurrent;
        });
    }
    completeLogin() {
        return this.userManager.signinRedirectCallback().then((user) => {
            this.user = user;
            this.loggedIn = !!user && !user.expired;
            this.loginChangedSubject.next(!!user && !user.expired);
            return user;
        });
    }

    logout() {
        this.userManager.signoutRedirect();
    }

    completeLogout() {
        this.user = null;
        return this.userManager.signoutRedirectCallback();
    }

    getAccessToken() {
        return this.userManager.getUser().then((user) => {
            if (!!user && !user.expired) {
                return user.access_token;
            } else {
                return null;
            }
        });
    }
}
