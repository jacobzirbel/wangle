import { WaypointList } from './WaypointList';
import { Waypoint } from './Waypoint';
import { StringMap } from '@angular/compiler/src/compiler_facade_interface';

export interface ConvertDialogData {
    list: WaypointList;
    waypointsCopy: Waypoint[];
    changes: StringMap;
}
