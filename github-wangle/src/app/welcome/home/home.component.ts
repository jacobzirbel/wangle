import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from 'src/app/components/alert-dialog/alert-dialog.component';
import { isMobile } from '../../mobile';
import { Profile } from 'src/app/models/';
@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
    profile: Profile;
    mobile: boolean = isMobile;
    @Output() RoutePress = new EventEmitter<string>();
    constructor(public auth: AuthService, private router: Router, private matDialog: MatDialog) {}

    ngOnInit(): void {
        this.auth.userProfile$.subscribe(
            (res: Profile) => {
                this.profile = res;
            },
            (err) => {
                throw err;
            }
        );
    }
    login(): void {
        const dialogRef = this.matDialog.open(AlertDialogComponent, {
            width: '300px',
            data: {
                content1: 'Email us to join',
                content2: 'wanglewaypoints@gmail.com',
                input: true,
            },
        });
        dialogRef.updatePosition({ top: '23vh' });
        dialogRef.afterClosed().subscribe((entered: number) => {
            if (entered == 1) {
                this.router.navigateByUrl('/full');
            }
            if (entered == 0) this.fullLogout();
        });
    }
    routePress(route?: string): void {
        this.router.navigateByUrl(`/${route}`);
    }
    fullLogout(): void {
        this.deleteCookie('_ga');
        this.deleteCookie('auth0.is.authenticated');
        location.reload();
    }
    deleteCookie(name: string): void {
        const date = new Date();
        date.setTime(date.getTime() + -1 * 24 * 60 * 60 * 1000);
        document.cookie = name + '=; expires=' + date.toUTCString() + '; path=/';
    }
}
