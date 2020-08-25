import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WaypointList, Waypoint, InitData, Device, State, Profile } from './models/';
import { HttpClient } from '@angular/common/http';
import { baseUrl } from 'src/sensitive';
import { WaypointRepoService } from './services/WaypointRepoService';
import { take } from 'rxjs/operators';
import { SharedService } from './shared.service';
import { NotificationService } from './services/notification.service';
import { WaitService } from './services/wait.service';

@Injectable({
    providedIn: 'root',
})
export class StateService {
    // stateSubject: BehaviorSubject<State>;
    readonly state: State = {};
    constructor(
        private http: HttpClient,
        private waypointService: WaypointRepoService,
        private sharedService: SharedService,
        private notificationService: NotificationService,
        private waitService: WaitService
    ) {}

    // StateService only handles stuff with database

    // initialize needs to return a promise of userData for the initDataResolverService
    // if the user has no lists it waits to add a list
    // then the first initialize() returns a promise of the second initialize()'s resolved promise

    initialize(): Promise<InitData> {
        const taskId = this.waitService.startTask(true);
        return new Promise((resolve, reject) => {
            // make sure isLoaded and same user is logged in
            if (LOCAL_DB.loaded) {
                this.waitService.endTask(taskId);
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
            } else {
                this.getUserData()
                    .pipe(take(1))
                    .subscribe(
                        async (userData) => {
                            console.log(userData);
                            if (!userData.waypointLists.length) {
                                // add the first list
                                await this.newUser();
                                // run fn again, user will have a list so it will skip this block
                                this.waitService.endTask(taskId);
                                resolve(await this.initialize());
                                return;
                            }
                            Object.assign(LOCAL_DB.profile, userData.profile);
                            LOCAL_DB.waypointLists.length = 0;
                            LOCAL_DB.devices.length = 0;
                            LOCAL_DB.waypointLists.push(...userData.waypointLists);
                            LOCAL_DB.devices.push(...userData.devices);
                            LOCAL_DB.loaded = true;
                            this.setState();
                            this.waitService.endTask(taskId);
                            this.notificationService.success('Success', 'User Data Retrieved');
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
                            this.waitService.endTask(taskId);
                            this.notificationService.error(
                                'Error',
                                'Could not get your data, try refreshing the page'
                            );
                            reject(false);
                        }
                    );
            }
        });
    }

    getUserData(): Observable<UserData> {
        return this.http.get<UserData>(baseUrl + 'api/SampleData/GetUserData');
    }

    async newUser(): Promise<void> {
        const a: WaypointList = {
            name: 'My First List',
            deviceId: '0',
            waypoints: [],
            waypointListId: '0',
        };

        await this.addWaypointList(a);
    }

    setState(listId?: string): void {
        // ID is set by backend so this will have to be changed
        const waypointLists: WaypointList[] = [...LOCAL_DB.waypointLists];
        const currentList =
            waypointLists.find((l) => l.waypointListId == listId) || waypointLists[0];

        // this.subjectNext({ waypointLists, selectedWaypointList: currentList });
        this.sharedService.nextSelectedList(currentList);
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

    addWaypoint(wp: Waypoint, listId: string): Promise<boolean> {
        const taskId = this.waitService.startTask();
        return new Promise((resolve, reject) => {
            const { list } = this.getById(listId, wp.waypointId);

            this.waypointService
                .saveWaypoint({ ...wp, waypointListId: listId })
                .pipe(take(1))
                .subscribe(
                    (res) => {
                        list.waypoints.push(res);
                        this.setState(list.waypointListId);
                        this.waitService.endTask(taskId);

                        this.notificationService.success('Success', '1 waypoint added');
                        resolve(true);
                    },
                    (err) => {
                        this.waitService.endTask(taskId);

                        this.notificationService.error('Error', 'Waypoint not added');
                        reject(false);
                        throw err;
                    }
                );
        });
    }

    editWaypoint(wp: Waypoint): Promise<void> {
        return new Promise((resolve, reject) => {
            const brandNew = wp.waypointId === '0';
            const taskId = this.waitService.startTask();
            const { list, waypoint } = this.getById(wp.waypointListId, wp.waypointId);
            this.waypointService
                .saveWaypoint(wp)
                .pipe(take(1))
                .subscribe(
                    (res: Waypoint) => {
                        if (waypoint) {
                            Object.assign(waypoint, res);
                        }
                        if (!waypoint) {
                            list.waypoints.push(res);
                        }
                        this.waitService.endTask(taskId);
                        this.notificationService.success(
                            'Success',
                            `${waypoint.name} was ${brandNew ? 'added' : 'edited'}`
                        );
                        this.setState(list.waypointListId);
                        resolve();
                    },
                    (err) => {
                        this.waitService.endTask(taskId);
                        this.notificationService.error('Error', wp.name + ' was not edited');
                        alert(JSON.stringify(err));
                        reject();
                    }
                );
        });
    }

    addWaypointArray(waypoints: Waypoint[], listId: string): void {
        const taskId = this.waitService.startTask();
        const { list } = this.getById(listId);

        this.waypointService
            .saveList(waypoints, list.waypointListId)
            .pipe(take(1))
            .subscribe(
                (res) => {
                    list.waypoints.push(...res);
                    this.setState(list?.waypointListId);
                    this.waitService.endTask(taskId);
                    this.notificationService.success(
                        'Success',
                        waypoints.length + ' waypoints were added'
                    );
                },
                (err) => {
                    this.waitService.endTask(taskId);
                    this.notificationService.error(
                        'Error',
                        'Waypoints were not added, please try again'
                    );
                    throw err;
                }
            );
    }
    updateWaypoints(waypoints: Waypoint[]): Promise<boolean> {
        const taskId = this.waitService.startTask();
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
                        this.waitService.endTask(taskId);
                        this.notificationService.success('Success', 'Waypoints were updated');

                        resolve(true);
                    },
                    (err) => {
                        console.error(err);
                        this.setState();
                        this.waitService.endTask(taskId);
                        this.notificationService.error('Error', 'Waypoints were not updated');
                        reject(false);
                    }
                );
        });
    }
    deleteWaypoint(wpId: string, listId: string): Promise<boolean> {
        const taskId = this.waitService.startTask();
        const { list, waypoint } = this.getById(listId, wpId);
        const name = waypoint.name;
        const index = list.waypoints.indexOf(waypoint);

        return new Promise((resolve, reject) => {
            this.waypointService
                .delete(waypoint)
                .pipe(take(1))
                .subscribe(
                    () => {
                        list.waypoints.splice(index, 1);
                        this.setState(listId);
                        this.waitService.endTask(taskId);
                        this.notificationService.success('Success', name + ' was deleted');

                        resolve(true);
                    },
                    (err) => {
                        console.error(err);
                        this.waitService.endTask(taskId);
                        this.notificationService.error('Error', name + ' was not deleted');
                        reject(false);
                    }
                );
        });
    }

    deleteArrayOfWaypoints(wps: Waypoint[], listId: string): Promise<boolean> {
        const taskId = this.waitService.startTask();
        const { list } = this.getById(listId);
        const count = wps.length;
        return new Promise((resolve, reject) => {
            this.waypointService
                .deleteArrayOfWaypoints(wps)
                .pipe(take(1))
                .subscribe(
                    (result: Waypoint[]) => {
                        const resultIds = result.map((e) => e.waypointId);
                        if (wps.some((w) => !resultIds.includes(w.waypointId))) {
                            alert('error');
                        }
                        wps.forEach((deletedWp) => {
                            const index = list.waypoints.indexOf(deletedWp);
                            list.waypoints.splice(index, 1);
                        });
                        this.setState(listId);
                        this.waitService.endTask(taskId);
                        this.notificationService.success(
                            'Success',
                            count + ' waypoints were deleted'
                        );

                        resolve(true);
                    },
                    (err) => {
                        console.error(err);
                        this.waitService.endTask(taskId);
                        this.notificationService.error('Error', 'Waypoints were not deleted');
                        reject(false);
                    }
                );
        });
    }

    moveWaypoints(wps: Waypoint[], toListId: string): Promise<boolean> {
        const taskId = this.waitService.startTask();
        const theToList = this.getById(toListId).list;
        const theFromList = this.getById(wps[0].waypointListId).list;
        const count = wps.length;
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
                    this.setState(theFromList.waypointListId);
                    this.waitService.endTask(taskId);
                    const msg = count !== 1 ? 'waypoints were moved' : 'waypoint was moved';
                    this.notificationService.success('Success', count + msg);
                    resolve(true);
                },
                (err) => {
                    console.error(err);
                    this.waitService.endTask(taskId);
                    this.notificationService.error('Error', 'Waypoints were not moved');
                    reject(false);
                }
            );
        });
    }
    copyWaypoints(wps: Waypoint[], toListId: string): Promise<boolean> {
        const taskId = this.waitService.startTask();
        const theToList = this.getById(toListId).list;
        const theFromList = this.getById(wps[0].waypointListId).list;
        const count = wps.length;
        return new Promise((resolve, reject) => {
            this.waypointService.copyWaypointsToList(wps, toListId).subscribe(
                (toList: WaypointList) => {
                    // toList is actually all the waypointLists, with no waypoints
                    // except for the correct "toList" which just has the new waypoints
                    const realToList = toList.find((l) => l.waypoints);
                    theToList.waypoints.push(...realToList.waypoints);
                    this.setState(theFromList.waypointListId);
                    this.waitService.endTask(taskId);
                    const msg = count !== 1 ? 'waypoints were copied' : 'waypoint was copied';
                    this.notificationService.success('Success', count + msg);
                    resolve(true);
                },
                (err) => {
                    console.error(err);
                    this.waitService.endTask(taskId);
                    this.notificationService.error('Error', 'Waypoints were not copied');
                    reject(false);
                }
            );
        });
    }
    addWaypointList(newList: WaypointList): Promise<boolean> {
        const taskId = this.waitService.startTask();
        const name = newList.name;
        return new Promise((resolve, reject) => {
            this.waypointService
                .saveWaypointList(newList)
                .pipe(take(1))
                .subscribe(
                    (res) => {
                        LOCAL_DB.waypointLists.length = 0;
                        res.forEach((wpl) => LOCAL_DB.waypointLists.push(wpl));
                        this.waitService.endTask(taskId);
                        this.notificationService.success('Success', name + ' was added');
                        resolve(true);
                    },
                    (err) => {
                        console.error(err);
                        this.waitService.endTask(taskId);
                        this.notificationService.error('Error', name + ' was not added');
                        reject(false);
                        throw err;
                    }
                );
        });
    }

    editList(list: WaypointList): void {
        const taskId = this.waitService.startTask();
        this.waypointService
            .saveWaypointList(list)
            .pipe(take(1))
            .subscribe(
                (res) => {
                    LOCAL_DB.waypointLists.length = 0;
                    res.forEach((wpl) => LOCAL_DB.waypointLists.push(wpl));
                    this.waitService.endTask(taskId);
                    this.notificationService.success('Success', 'List was edited');
                },
                (err) => {
                    console.error(err);
                    this.waitService.endTask(taskId);
                    this.notificationService.error('Error', 'List was not edited');
                    throw err;
                }
            );
    }
    deleteList(listId: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const taskId = this.waitService.startTask();
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
                        this.waitService.endTask(taskId);
                        this.notificationService.success('Success', 'List was deleted');
                        resolve(true);
                    },
                    (err) => {
                        console.error(err);
                        allLists.push(list);
                        this.setState();
                        this.waitService.endTask(taskId);
                        this.notificationService.error('Error', 'List was not deleted');
                        reject(false);
                        throw err;
                    }
                );
        });
    }
    getById(listId: string, waypointId?: string): { list: WaypointList; waypoint: Waypoint } {
        let waypoint;
        const list = LOCAL_DB.waypointLists.find((wpl) => wpl.waypointListId == listId);
        if (!list) {
            console.warn('no list');
        }
        if (waypointId) waypoint = list?.waypoints.find((wp) => wp.waypointId == waypointId);
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
