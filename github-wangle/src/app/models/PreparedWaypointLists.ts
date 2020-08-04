import { Waypoint } from './Waypoint';

export interface PreparedWaypointLists {
    onlyImport: Waypoint[];
    partialMatches?: { current: Waypoint; updated: Waypoint }[];
    toListId: string;
}
