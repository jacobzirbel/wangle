export interface Waypoint {
    waypointId: string;
    waypointListId?: string;
    name: string;
    latitude: number;
    longitude: number;
    symbol: string;
    valid?: boolean;
}
