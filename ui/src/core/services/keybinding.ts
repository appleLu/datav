import Mousetrap from 'mousetrap';
import 'mousetrap-global-bind';
import { getHistory } from 'src/packages/datav-core/src';
import appEvents from '../library/utils/app_events';
import { CoreEvents } from 'src/types';
import {store} from 'src/store/store'
export class KeybindingSrv {
    constructor() {
        this.setupGlobal()
    }

    setupGlobal() {
        this.bind('g h', this.goToHome);
        this.bind('g p', this.goToPlugins);
        this.bind('mod+s', this.saveDashboard);
    }

    bind(keyArg: string | string[], fn: () => void) {
        Mousetrap.bind(
          keyArg,
          (e) => {
            e.preventDefault();
            e.stopPropagation();
            fn()
          },
          'keydown'
        );
    }

    goToHome() {
        getHistory().push('/')
    }

    goToPlugins() {
        getHistory().push('/cfg/plugins')
    }

    saveDashboard() {
        appEvents.emit(CoreEvents.keybindingSaveDashboard)
    }
}

/**
 * Code below exports the service to react components
 */

let singletonInstance: KeybindingSrv;

export function setKeybindingSrv(instance: KeybindingSrv) {
  singletonInstance = instance;
}

export function getKeybindingSrv(): KeybindingSrv {
  return singletonInstance;
}