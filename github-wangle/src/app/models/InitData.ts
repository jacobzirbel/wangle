import { WaypointList } from './WaypointList';
import { Permits } from './Permits';
import { RWRoute } from './RWRoute';

export interface InitData {
    lists: WaypointList[];
    permits: Permits;
    route: RWRoute;
}
