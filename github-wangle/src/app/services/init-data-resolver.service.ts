import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { SharedService } from '../shared.service';
import { Observable, from } from 'rxjs';
import { StateService } from '../state.service';
import { InitData } from '../models/InitData';
@Injectable({
    providedIn: 'root',
})
export class InitDataResolver implements Resolve<InitData> {
    constructor(private sharedService: SharedService) {}
    resolve(route: ActivatedRouteSnapshot): Observable<InitData> {
        const data = this.sharedService.getInit(route.url[0].path);
        const observable = Observable.create((observer) => {
            observer.next(data);
            observer.complete();
        });
        return observable;
    }
}
@Injectable({
    providedIn: 'root',
})
export class FullDataResolver implements Resolve<InitData> {
    constructor(private stateService: StateService) {}
    resolve(route: ActivatedRouteSnapshot): Observable<InitData> {
        if (route.url[0].path !== 'full') console.warn('this might be a problem');
        const initData: Promise<InitData> = this.stateService.initialize();
        return from(initData);
    }
}
