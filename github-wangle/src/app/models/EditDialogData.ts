import { Waypoint } from './Waypoint';
import { WaypointList } from './WaypointList';

export interface EditDialogData {
    mini?: boolean;
    waypoint: Waypoint;
    selectedWaypointList: WaypointList;
    waypointLists?: WaypointList[];
}
