import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-sigin-redirect-callback',
    template: `<div></div>`,
})
export class SigninRedirectCallbackComponent implements OnInit {
    constructor(private auth: AuthService, private router: Router) {}

    ngOnInit(): void {
        this.auth
            .completeLogin()
            .then((user) => {
                this.router.navigate(['/'], { replaceUrl: true });
            })
            .catch(() => {
                console.log('redirect callback');
            });
    }
}
