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
                console.log('user data was already loaded');
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
                            this.notificationService.error(
                                'Error',
                                'Could not get your data, try refreshing the page'
                            );
                            reject(false);
                        },
                        () => {
                            this.waitService.endTask(taskId);
                        }
                    );
            }
        });
    }

    getUserData(): Observable<UserData> {
        return this.http.get<UserData>(baseUrl + 'api/SampleData/GetUserData');
    }

    async newUser(): Promise<any> {
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
        if (listId) {
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

    addWaypoint(wp: Waypoint, listId: string): Promise<any> {
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
                        this.notificationService.success('Success', '1 waypoint added');
                        resolve(true);
                    },
                    (err) => {
                        this.notificationService.error('Error', 'Waypoint not added');
                        reject(false);
                        throw err;
                    },
                    () => {
                        this.waitService.endTask(taskId);
                    }
                );
        });
    }

    editWaypoint(wp: Waypoint): void {
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
                    this.notificationService.success(
                        'Success',
                        `${waypoint.name} was ${brandNew ? 'added' : 'edited'}`
                    );

                    this.setState(list.waypointListId);
                },
                (err) => {
                    this.notificationService.error('Error', wp.name + ' was not edited');
                    alert(JSON.stringify(err));
                },
                () => {
                    this.waitService.endTask(taskId);
                }
            );
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
                    this.notificationService.success(
                        'Success',
                        waypoints.length + ' waypoints were added'
                    );
                },
                (err) => {
                    this.notificationService.error(
                        'Error',
                        'Waypoints were not added, please try again'
                    );
                    throw err;
                },
                () => {
                    this.waitService.endTask(taskId);
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
                        this.notificationService.success('Success', 'Waypoints were updated');

                        resolve(true);
                    },
                    (err) => {
                        this.setState();
                        this.notificationService.error('Error', 'Waypoints were not updated');
                        reject(false);
                    },
                    () => {
                        this.waitService.endTask(taskId);
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
                        this.notificationService.success('Success', name + ' was deleted');

                        resolve(true);
                    },
                    (err) => {
                        this.notificationService.error('Error', name + ' was not deleted');
                        reject(false);
                    },
                    () => {
                        this.waitService.endTask(taskId);
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
                        this.notificationService.success(
                            'Success',
                            count + ' waypoints were deleted'
                        );

                        resolve(true);
                    },
                    (err) => {
                        this.notificationService.error('Error', 'Waypoints were not deleted');
                    },
                    () => {
                        this.waitService.endTask(taskId);
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
                    this.setState(toListId);
                    this.notificationService.success('Success', count + ' waypoints were moved');

                    resolve(true);
                },
                (err) => {
                    this.notificationService.error('Error', 'Waypoints were not moved');
                    reject(false);
                },
                () => {
                    this.waitService.endTask(taskId);
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
                    this.setState(toListId);
                    this.notificationService.success('Success', count + ' waypoints were copied');

                    resolve(true);
                },
                (err) => {
                    console.error(err);
                    this.notificationService.error('Error', 'Waypoints were not copied');
                    reject(false);
                },
                () => {
                    this.waitService.endTask(taskId);
                }
            );
        });
    }
    addWaypointList(newList: WaypointList): Promise<any> {
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
                        this.setState(res[0].waypointListId);
                        this.notificationService.success('Success', name + ' was added');

                        resolve(true);
                    },
                    (err) => {
                        this.notificationService.error('Error', name + ' was not added');
                        reject(false);
                        throw err;
                    },
                    () => {
                        this.waitService.endTask(taskId);
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
                    this.setState(
                        list?.waypointListId ||
                            LOCAL_DB.waypointLists[LOCAL_DB.waypointLists.length - 1].waypointListId
                    );
                    this.notificationService.success('Success', 'List was edited');
                },
                (err) => {
                    this.notificationService.error('Error', 'List was not edited');
                    throw err;
                },
                () => {
                    this.waitService.endTask(taskId);
                }
            );

        this.setState(list?.waypointListId);
    }
    deleteList(listId: string): void {
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
                    this.notificationService.success('Success', 'List was deleted');
                },
                (err) => {
                    allLists.push(list);
                    this.setState();
                    this.notificationService.error('Error', 'List was not deleted');
                    throw err;
                },
                () => {
                    this.waitService.endTask(taskId);
                }
            );
    }
    getById(listId: string, waypointId?: string): { list: WaypointList; waypoint: Waypoint } {
        let waypoint;
        const list = LOCAL_DB.waypointLists.find((wpl) => wpl.waypointListId == listId);
        if (!list) {
            console.log('no list');
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
