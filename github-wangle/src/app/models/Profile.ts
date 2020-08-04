import { Waypoint } from './Waypoint';

export interface Profile {
  id?: string;
  sub?: string;
  nickname?: string;
  waypoints?: Waypoint[];
  deviceId?: string;
  deviceName?: string;
  name?: string;
}
