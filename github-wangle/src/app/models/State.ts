import { WaypointList } from './WaypointList';
import { Profile } from './Profile';
import { Device } from './Device';

export interface State {
    profile: Profile;
    devices: Device[];
    waypointLists: WaypointList[];
    loaded: boolean;
    selectedWaypointList: WaypointList;
}
