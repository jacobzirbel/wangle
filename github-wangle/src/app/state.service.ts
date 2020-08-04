import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WaypointList, Waypoint, InitData, Device, State, Profile } from './models/';
import { HttpClient } from '@angular/common/http';
import { baseUrl } from 'src/sensitive';
import { WaypointRepoService } from './services/WaypointRepoService';
import { take } from 'rxjs/operators';
import { SharedService } from './shared.service';

@Injectable({
    providedIn: 'root',
})
export class StateService {
    // stateSubject: BehaviorSubject<State>;
    readonly state: State = {};
    constructor(
        private http: HttpClient,
        private waypointService: WaypointRepoService,
        private sharedService: SharedService
    ) {}

    // StateService only handles stuff with database
    initialize(): Promise<InitData> {
        return new Promise((resolve, reject) => {
            if (LOCAL_DB.loaded) {
                resolve({
                    lists: LOCAL_DB.waypointLists,
                    permits: {
                        listEdit: true,
                        wpEdit: true,
                        download: true,
                        upload: true,
                    },
                    route: 'full',
                });
            }
            // this.stateSubject = new BehaviorSubject(this.state);
            this.getUserData()
                .pipe(take(1))
                .subscribe(
                    (userData) => {
                        if (!userData.waypointLists.length) {
                            this.newUser();
                        }
                        Object.assign(LOCAL_DB.profile, userData.profile);
                        LOCAL_DB.waypointLists.length = 0;
                        LOCAL_DB.devices.length = 0;
                        LOCAL_DB.waypointLists.push(...userData.waypointLists);
                        LOCAL_DB.devices.push(...userData.devices);
                        LOCAL_DB.loaded = true;
                        this.setState();
                        resolve({
                            lists: LOCAL_DB.waypointLists,
                            permits: {
                                listEdit: true,
                                wpEdit: true,
                                download: true,
                                upload: true,
                            },
                            route: 'full',
                        });
                    },
                    (err) => {
                        console.error(err);
                        reject(false);
                    }
                );
        });
    }

    getUserData(): Observable<UserData> {
        return this.http.get<UserData>(baseUrl + 'api/SampleData/GetUserData');
    }

    newUser(): void {
        const a: WaypointList = {
            name: 'My First List',
            deviceId: '0',
            waypoints: [],
            waypointListId: '0',
        };

        this.addWaypointList(a);
    }

    setState(listId?: string): void {
        // ID is set by backend so this will have to be changed
        const waypointLists: WaypointList[] = [...LOCAL_DB.waypointLists];
        const currentList =
            waypointLists.find((l) => l.waypointListId == listId) || waypointLists[0];

        // this.subjectNext({ waypointLists, selectedWaypointList: currentList });
        console.log(currentList);
        if (currentList) {
            this.sharedService.nextSelectedList(currentList);
        }
    }
    // getSubject(): BehaviorSubject<State> {
    //     return this.stateSubject;
    // }
    // private subjectNext(data: State) {
    //     this.stateSubject.next(data);
    // }
    // getState(): State {
    //     return this.state;
    // }

    addWaypoint(wp: Waypoint, listId: string): any {
        const { list } = this.getById(listId, wp.waypointId);

        this.waypointService
            .saveWaypoint({ ...wp, waypointListId: listId })
            .pipe(take(1))
            .subscribe(
                (res) => {
                    list.waypoints.push(res);
                    this.setState(list.waypointListId);
                },
                (err) => {
                    throw err;
                }
            );
    }

    editWaypoint(wp: Waypoint): void {
        const { list, waypoint } = this.getById(wp.waypointListId, wp.waypointId);
        this.waypointService
            .saveWaypoint(wp)
            .pipe(take(1))
            .subscribe(
                (res: Waypoint) => {
                    if (waypoint) Object.assign(waypoint, res);
                    if (!waypoint) list.waypoints.push(res);
                    this.setState(list.waypointListId);
                },
                (err) => {
                    alert(JSON.stringify(err));
                }
            );
    }

    addWaypointArray(waypoints: Waypoint[], listId: string): void {
        const { list } = this.getById(listId);

        this.waypointService
            .saveList(waypoints, list.waypointListId)
            .pipe(take(1))
            .subscribe(
                (res) => {
                    list.waypoints.push(...res);
                    this.setState(list?.waypointListId);
                },
                (err) => {
                    alert('brand new waypoints not added');
                    throw err;
                }
            );
    }
    updateWaypoints(waypoints: Waypoint[]): Promise<boolean> {
        // Should add new endpoint for this
        return new Promise((resolve, reject) => {
            if (!waypoints.length) alert('none in array');
            const { list } = this.getById(waypoints[0].waypointListId);
            this.waypointService
                .saveList(waypoints, list.waypointListId)
                .pipe(take(1))
                .subscribe(
                    (res) => {
                        res.forEach((r) => {
                            const old = list.waypoints.find((wp) => wp.waypointId == r.waypointId);
                            Object.assign(old, r);
                        });
                        this.setState(list.waypointListId);
                        resolve(true);
                    },
                    (err) => {
                        this.setState();
                        throw err;
                        reject(false);
                    }
                );
        });
    }
    deleteWaypoint(wpId: string, listId: string): Promise<boolean> {
        const { list, waypoint } = this.getById(listId, wpId);
        const index = list.waypoints.indexOf(waypoint);

        return new Promise((resolve, reject) => {
            this.waypointService
                .delete(waypoint)
                .pipe(take(1))
                .subscribe(
                    () => {
                        list.waypoints.splice(index, 1);
                        this.setState(listId);
                        resolve(true);
                    },
                    (err) => {
                        console.error(err);
                        reject(false);
                    }
                );
        });
    }

    deleteArrayOfWaypoints(wps: Waypoint[], listId: string): Promise<boolean> {
        const { list } = this.getById(listId);
        return new Promise((resolve, reject) => {
            this.waypointService
                .deleteArrayOfWaypoints(wps)
                .pipe(take(1))
                .subscribe((result: Waypoint[]) => {
                    const resultIds = result.map((e) => e.waypointId);
                    if (wps.some((w) => !resultIds.includes(w.waypointId))) {
                        alert('error');
                    }
                    wps.forEach((deletedWp) => {
                        const index = list.waypoints.indexOf(deletedWp);
                        list.waypoints.splice(index, 1);
                    });
                    this.setState(listId);
                    resolve(true);
                });
        });
    }

    moveWaypoints(wps: Waypoint[], toListId: string): Promise<boolean> {
        const theToList = this.getById(toListId).list;
        const theFromList = this.getById(wps[0].waypointListId).list;
        return new Promise((resolve, reject) => {
            this.waypointService.moveWaypointsToList(wps, toListId).subscribe(
                (toList: WaypointList) => {
                    // theToList.waypoints.length = 0;
                    const realToList = toList.find((l) => l.waypoints);
                    theToList.waypoints.push(...realToList.waypoints);

                    wps.forEach((wp) => {
                        const index = theFromList.waypoints.indexOf(wp);
                        theFromList.waypoints.splice(index, 1);
                    });
                    this.setState(toListId);
                    resolve(true);
                },
                (err) => {
                    console.error(err);
                    reject(false);
                }
            );
        });
    }
    copyWaypoints(wps: Waypoint[], toListId: string): Promise<boolean> {
        const theToList = this.getById(toListId).list;
        const theFromList = this.getById(wps[0].waypointListId).list;
        return new Promise((resolve, reject) => {
            this.waypointService.copyWaypointsToList(wps, toListId).subscribe(
                (toList: WaypointList) => {
                    // toList is actually all the waypointLists, with no waypoints
                    // except for the correct "toList" which just has the new waypoints
                    const realToList = toList.find((l) => l.waypoints);
                    theToList.waypoints.push(...realToList.waypoints);
                    this.setState(toListId);
                    resolve(true);
                },
                (err) => {
                    console.error(err);
                    reject(false);
                }
            );
        });
    }
    addWaypointList(newList: WaypointList): void {
        this.waypointService
            .saveWaypointList(newList)
            .pipe(take(1))
            .subscribe(
                (res) => {
                    LOCAL_DB.waypointLists.length = 0;
                    res.forEach((wpl) => LOCAL_DB.waypointLists.push(wpl));
                    this.setState(res[0].waypointListId);
                    this.sharedService.nextSelectedList(
                        LOCAL_DB.waypointLists[LOCAL_DB.waypointLists.length - 1]
                    );
                },
                (err) => {
                    throw err;
                }
            );
    }

    editList(list: WaypointList): void {
        this.waypointService
            .saveWaypointList(list)
            .pipe(take(1))
            .subscribe(
                (res) => {
                    LOCAL_DB.waypointLists.length = 0;
                    res.forEach((wpl) => LOCAL_DB.waypointLists.push(wpl));
                    this.setState(list?.waypointListId);
                    this.sharedService.nextSelectedList(
                        LOCAL_DB.waypointLists.find(
                            (wpl) => wpl.waypointListId == list.waypointListId
                        ) || LOCAL_DB.waypointLists[LOCAL_DB.waypointLists.length - 1]
                    );
                },
                (err) => {
                    throw err;
                }
            );

        this.setState(list?.waypointListId);
    }
    deleteList(listId: string): void {
        const { list } = this.getById(listId);
        const allLists = LOCAL_DB.waypointLists;
        const index = allLists.indexOf(list);
        allLists.splice(index, 1);

        this.waypointService
            .deleteWaypointList(list)
            .pipe(take(1))
            .subscribe(
                () => {
                    this.setState();
                    this.sharedService.nextSelectedList(LOCAL_DB.waypointLists[0]);
                },
                (err) => {
                    allLists.push(list);
                    this.setState();
                    throw err;
                }
            );
    }
    getById(listId: string, waypointId?: string): { list: WaypointList; waypoint: Waypoint } {
        let waypoint;
        const list = LOCAL_DB.waypointLists.find((wpl) => wpl.waypointListId == listId);
        if (waypointId) waypoint = list.waypoints.find((wp) => wp.waypointId == waypointId);
        return { list, waypoint };
    }
}
const LOCAL_DB: {
    readonly profile: Profile;
    readonly devices: Device[];
    readonly waypointLists: WaypointList[];
    loaded: boolean;
} = { profile: {}, devices: [], waypointLists: [], loaded: false };
export type UserData = {
    loaded: boolean;
    profile: Profile;
    devices: Device[];
    waypointLists: WaypointList[];
};
