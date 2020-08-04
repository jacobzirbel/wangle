import { Waypoint } from './Waypoint';

export interface WaypointList {
    waypointListId: string;
    waypoints?: Waypoint[];
    name: string;
    deviceId: string;
}
