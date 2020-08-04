import { Injectable } from '@angular/core';
import { ValidationService } from './ValidationService';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { baseUrl } from 'src/sensitive';
import { symbolMap, setMap } from './SymbolMap';
import { StringMap } from '@angular/compiler/src/compiler_facade_interface';
import { WaypointList } from '../models/WaypointList';
import { Waypoint } from '../models/Waypoint';
import { CompareWaypoint } from '../models/CompareWaypoint';
import { MatchType } from '../models/MatchType';
@Injectable()
export class WaypointRepoService {
    public dbWaypoints: Waypoint[];
    dbLists: WaypointList[] = [];

    constructor(private validate: ValidationService, private http: HttpClient) {}

    detectDeviceIdFromSymbols(list: WaypointList): string {
        const main = () => {
            const counts = {};
            const localSymMap = { ...symbolMap };
            Object.keys(localSymMap).forEach((deviceId) => {
                counts[deviceId] = list.waypoints.reduce(
                    (a, wp) => a + (localSymMap[deviceId].includes(wp.symbol) ? 1 : 0),
                    0
                );
            });
            const detected = Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b));
            if (list.deviceId == undefined || list.deviceId == null) list.deviceId = detected;
            return detected;
        };
        const ret = main();
        if (symbolMap) return ret;
        alert('past return ret');
        this.getSymbolMap().subscribe((map) => {
            setMap(map);
        });
    }
    getSymbolMap(): Observable<{ [key: string]: string[] }> {
        // return // observable from http
        return of({
            '1': ['Waypoint', 'Shower'],
            '2': ['waypoint', 'usflag'],
        });
    }
    convertList(
        list: WaypointList,
        newDeviceId: string,
        callback?: (list: WaypointList, waypointsCopy: Waypoint[], changes: StringMap) => void
    ): void {
        const changes = {};
        this.getSymbolMap().subscribe((map) => {
            setMap(map);
            const detectedId = this.detectDeviceIdFromSymbols(list);

            if (list.deviceId != '0' && detectedId != list.deviceId) {
                alert('detectDevice error');
            }
            if (!newDeviceId) newDeviceId = detectedId == '1' ? '2' : '1';
            const waypointsCopy = list.waypoints.map((wp) => ({ ...wp }));
            waypointsCopy.forEach((wp) => {
                const i = map[detectedId].indexOf(wp.symbol);
                let newSymbol;
                if (i === -1 || i > map[newDeviceId].length) {
                    newSymbol = map[newDeviceId][0];
                } else {
                    newSymbol = map[newDeviceId][i];
                }
                if (!changes[wp.symbol]) changes[wp.symbol] = newSymbol;
                wp.symbol = newSymbol;
            });
            // list.deviceId = newDeviceId;
            if (callback) callback(list, waypointsCopy, changes);
        });
    }
    saveWaypoint(wp: Waypoint): Observable<Waypoint> {
        return this.http.post<Waypoint>(baseUrl + 'api/SampleData/EditWaypointNew', wp, {
            headers: { 'Content-Type': 'application/json' },
        });
    }
    saveList(wpList: Waypoint[], waypointListId: string): Observable<Waypoint[]> {
        return this.http.post<Waypoint[]>(
            baseUrl + 'api/SampleData/EditWaypoints?waypointListId=' + waypointListId,
            wpList,
            {
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
    delete(wp: Waypoint): Observable<Waypoint> {
        return this.http.post<Waypoint>(baseUrl + 'api/SampleData/DeleteWaypoint', wp, {
            headers: { 'Content-Type': 'application/json' },
        });
    }

    deleteArrayOfWaypoints(wps: Waypoint[]): Observable<Waypoint[]> {
        return this.http.post<Waypoint[]>(baseUrl + 'api/SampleData/DeleteWaypoints', wps, {
            headers: { 'Content-Type': 'application/json' },
        });
    }

    saveWaypointList(wpList: WaypointList): Observable<WaypointList[]> {
        const o = this.http.post<WaypointList[]>(
            baseUrl + 'api/SampleData/EditWaypointList',
            wpList,
            {
                headers: { 'Content-Type': 'application/json' },
            }
        );
        return o;
    }
    deleteWaypointList(wpl: WaypointList): Observable<WaypointList> {
        const o = this.http.post<WaypointList>(baseUrl + 'api/SampleData/DeleteWaypointList', wpl, {
            headers: { 'Content-Type': 'application/json' },
        });
        return o;
    }

    moveWaypointsToList(wpl: Waypoint[], toList: string): Observable<WaypointList> {
        const o = this.http.post<WaypointList>(
            baseUrl + 'api/SampleData/MoveWaypoints?toListId=' + toList,
            wpl,
            {
                ///' + toList
                headers: { 'Content-Type': 'application/json' },
            }
        );
        return o;
    }

    copyWaypointsToList(wpl: Waypoint[], toList: string): Observable<WaypointList> {
        const o = this.http.post<WaypointList>(
            baseUrl + 'api/SampleData/CopyWaypoints?toListId=' + toList,
            wpl,
            {
                ///' + toList
                headers: { 'Content-Type': 'application/json' },
            }
        );
        return o;
    }
    getGpxFileFromList(list: WaypointList): Observable<string> {
        return this.http.post<string>(
            baseUrl + 'api/SampleData/GetGpxForDownloadWaypointList',
            list,
            {
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }

    postInputFile(fileName: string, result: string): Observable<Waypoint[]> {
        return this.http.post<Waypoint[]>(
            baseUrl + 'api/SampleData/ImportGpxFile?fileName=' + fileName,
            result,
            { headers: { 'Content-Type': 'application/binary' } }
        );
    }

    compareLatLng(wp1: Waypoint, wp2: Waypoint): boolean {
        return (
            Math.abs(wp1.latitude - wp2.latitude) <= precision &&
            Math.abs(wp1.longitude - wp2.longitude) <= precision
        );
    }

    getMatchType(dbWP: Waypoint, importWP: Waypoint): MatchType {
        if (this.compareLatLng(dbWP, importWP)) {
            if (dbWP.name === importWP.name && dbWP.symbol === importWP.symbol) {
                return 'ExactMatch';
            }
            return 'PartialMatch';
        }
        return 'NoMatch';
    }
    setSingleMatchType(cwp: CompareWaypoint): MatchType {
        // only valid waypoints should be input here
        let ret: MatchType = 'OnlyInImport';
        if (cwp.matchType !== 'InvalidWaypoint') {
            alert("this shouldn't happen");
        }
        const wp = cwp.wp2;
        const dbWaypoints = [...this.dbWaypoints];
        dbWaypoints.forEach((dbWp) => {
            const res = this.getMatchType(dbWp, wp);
            if (res === 'ExactMatch') {
                ret = res;
                cwp.wp1 = dbWp;
                cwp.included = false;
                return;
            }
            if (res === 'PartialMatch') {
                ret = res;
                cwp.wp1 = dbWp;
                cwp.included = true;
            }
        });
        return ret;
    }

    computeDiff(importWaypoints: Waypoint[], currentList: WaypointList): CompareWaypoint[] {
        console.time('diff');
        const ret: CompareWaypoint[] = [];
        this.dbWaypoints = [...currentList.waypoints];
        const currentWaypoints = [...currentList.waypoints];

        const checkValid = (wp) => {
            const validationObject = this.validate.validate(wp, currentList.deviceId);
            if (!validationObject.valid) {
                ret.push({
                    matchType: 'InvalidWaypoint',
                    wp1: null,
                    wp2: wp,
                    included: false,
                    valid: validationObject,
                });
                return false;
            }
            return true;
        };
        const compareWaypoints = (dbWp: Waypoint, newWp: Waypoint): boolean => {
            if (
                Math.abs(dbWp.latitude - newWp.latitude) <= precision &&
                Math.abs(dbWp.longitude - newWp.longitude) <= precision
            ) {
                if (dbWp.name === newWp.name && dbWp.symbol === newWp.symbol) {
                    ret.push({
                        matchType: 'ExactMatch',
                        wp1: dbWp,
                        wp2: newWp,
                        included: false,
                    });
                } else {
                    ret.push({
                        matchType: 'PartialMatch',
                        wp1: dbWp,
                        wp2: newWp,
                        included: true,
                    });
                }
                return true;
            } else {
                return false;
            }
        };
        // Removes invalids, add them to ret
        const validImports = importWaypoints.filter((newWp) => checkValid(newWp));
        // onlyImport if wp doesn't have same lat/lon as any dbwp
        const onlyImport = validImports.filter((newWp) => {
            return !currentWaypoints.find((dbWp) => {
                // while searching here, if match is found, it is categorized
                return compareWaypoints(dbWp, newWp);
            });
        });

        onlyImport.forEach((wp) => {
            ret.push({
                matchType: 'OnlyInImport',
                wp1: null,
                wp2: wp,
                included: true,
            });
        });

        console.timeEnd('diff');
        return ret;
    }
}
const precision = 0.00000001;
