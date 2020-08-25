import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { lists as findLists } from './welcome/find/find-lists';
import { WaypointList, Waypoint, Permits } from './models/';

@Injectable({
    providedIn: 'root',
})
export class SharedService {
    private manageSubject = new Subject<Permits>();
    manage$ = this.manageSubject.asObservable();
    nextManage(permits: Permits): void {
        this.manageSubject.next(permits);
    }

    private permitSubject = new Subject<Permits>();
    permits$ = this.permitSubject.asObservable();
    nextPermits(permits: Permits): void {
        this.permitSubject.next(permits);
    }

    private selectedListSubject = new Subject<WaypointList>();
    selectedList$ = this.selectedListSubject.asObservable();
    nextSelectedList(list: WaypointList): void {
        this.selectedListSubject.next(list);
        this.nextWaypoints(list.waypoints);
    }

    private waypointsSubject = new BehaviorSubject<Waypoint[]>([]);
    waypoints$ = this.waypointsSubject.asObservable();
    nextWaypoints(waypoints: Waypoint[]): void {
        this.waypointsSubject.next(waypoints);
    }

    private listsSubject = new Subject<WaypointList[]>();
    allLists$ = this.listsSubject.asObservable();
    nextLists(lists: WaypointList[]): void {
        this.listsSubject.next(lists);
    }

    private uploadSubject = new Subject<FileList>();
    upload$ = this.uploadSubject.asObservable();
    nextUpload(files: FileList): void {
        this.uploadSubject.next(files);
    }

    getInit(route: string): { lists: WaypointList[]; permits: Permits; route: string } {
        let lists: WaypointList[];
        let permits: Permits;

        if (route.includes('find')) {
            lists = findLists;
            permits = {
                listEdit: false,
                wpEdit: false,
                download: true,
                upload: false,
            };
        }
        if (route.includes('view')) {
            lists = this.getView();

            permits = {
                listEdit: false,
                wpEdit: false,
                download: false,
                upload: true,
            };
        }
        if (route.includes('create')) {
            lists = this.getCreate();

            permits = {
                listEdit: false,
                wpEdit: true,
                download: true,
                upload: false,
            };
        }
        return { lists, permits, route };
    }

    getView(): WaypointList[] {
        let waypoints: Waypoint[];
        let fromStorage;
        try {
            fromStorage = JSON.parse(localStorage.getItem('viewWaypoints'));
            if (typeof fromStorage == 'object' && fromStorage?.length) waypoints = fromStorage;
        } catch (err) {
            console.error(err);
        }
        const list: WaypointList = {
            waypointListId: '0',
            name: 'My upload',
            waypoints: waypoints || [
                {
                    name: 'Default',
                    latitude: 45,
                    longitude: -90,
                    symbol: 'Waypoint',
                    waypointId: '0',
                },
            ],
            deviceId: '0',
        };
        return [list];
    }

    getCreate(): WaypointList[] {
        const newWp: Waypoint = {
            name: 'My Waypoint',
            latitude: 44.00377418163695,
            longitude: -88.52163791579243,
            symbol: 'Waypoint',
            waypointId: '1',
        };
        const singleWaypointList = {
            waypointListId: '1',
            name: 'My Created List',
            deviceId: '0',
            waypoints: [newWp],
        };
        const fromStorage = JSON.parse(localStorage.getItem('createWaypoints'));
        if (typeof fromStorage == 'object' && fromStorage?.length)
            singleWaypointList.waypoints = fromStorage;
        return [singleWaypointList];
    }
}
