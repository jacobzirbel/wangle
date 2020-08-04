import { DeviceSymbol } from './DeviceSymbol';

export interface Device {
    //readonly?
    id: string;
    name: string;
    symbols?: DeviceSymbol[];
    maxWaypointNameLength?: number;
    waypointAllowedCharacters?: string;
    value?: number;
}
