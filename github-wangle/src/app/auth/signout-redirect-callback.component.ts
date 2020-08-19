import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-signout-redirect-callback',
    template: `<div></div>`,
})
export class SignoutRedirectCallbackComponent implements OnInit {
    constructor(private auth: AuthService, private router: Router) {}

    ngOnInit(): void {
        this.auth.completeLogout().then(() => {
            this.router.navigate(['/'], { replaceUrl: true });
        });
    }
}
