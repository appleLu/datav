import kbn from '../library/utils/kbn';
import {config} from 'src/packages/datav-core'

export class User {
  id: string;
  role: string
}

export class ContextSrv {
  pinned: any;
  version: any;
  user: User;
  isAdmin: boolean;
  isEditor: boolean;
  sidemenuSmallBreakpoint = false;
  minRefreshInterval: string;

  constructor(id:string,role:string) {
    this.user = {
      id: id,
      role: role      
    }
    
    this.isAdmin = this.hasRole('Admin')
    this.isEditor = this.hasRole('Editor') || this.hasRole('Admin');
    this.minRefreshInterval = '5s';
  }

  hasRole(role: string) {
    return this.user.role === role;
  }

  isGrafanaVisible() {
    return !!(document.visibilityState === undefined || document.visibilityState === 'visible');
  }

  // checks whether the passed interval is longer than the configured minimum refresh rate
  isAllowedInterval(interval: string) {
    if (!config.minRefreshInterval) {
      return true;
    }
    return kbn.interval_to_ms(interval) >= kbn.interval_to_ms(config.minRefreshInterval);
  }

  getValidInterval(interval: string) {
    if (!this.isAllowedInterval(interval)) {
      return config.minRefreshInterval;
    }
    return interval;
  }

  hasAccessToExplore() {
    return (this.isEditor || config.viewersCanEdit) && config.exploreEnabled;
  }
}

let contextSrv;

export const setContextSrv = (id,role) => {
  contextSrv = new ContextSrv(id,role)
}
export { contextSrv };

