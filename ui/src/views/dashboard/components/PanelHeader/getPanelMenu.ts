import { PanelMenuItem } from 'src/packages/datav-core';
import { copyPanel, duplicatePanel, removePanel } from '../../model/panel';
import { PanelModel,DashboardModel } from '../../model';
// import { contextSrv } from '../../../core/services/context_srv';
// import { navigateToExplore } from '../../explore/state/actions';
// import { getExploreUrl } from '../../../core/utils/explore';
// import { getTimeSrv } from '../services/TimeSrv';
import {store} from 'src/store/store'
import { updateLocation } from 'src/store/reducers/location';

export function getPanelMenu(
  dashboard: DashboardModel,
  panel: PanelModel,
): PanelMenuItem[] {
  const onViewPanel = (event: React.MouseEvent<any>) => {
    event.preventDefault();
      store.dispatch(updateLocation({
        query: {
          viewPanel: panel.id,
        },
        partial: true,
      }))
  };

  const onEditPanel = (event: React.MouseEvent<any>) => {
    event.preventDefault();
    store.dispatch(updateLocation({
        query: {
          editPanel: panel.id,
        },
        partial: true,
      }))
  };

  const onSharePanel = (event: React.MouseEvent<any>) => {
    event.preventDefault();
    alert('click share!')
    // sharePanel(dashboard, panel);
  };

  const onInspectPanel = (event:any,tab?: string) => {
    event.preventDefault();

    store.dispatch(updateLocation({
      partial: true,
      query: {
        inspect: panel.id,
        inspectTab: tab,
      },
    }))
  };

  const onMore = (event: React.MouseEvent<any>) => {
    event.preventDefault();
  };

  const onDuplicatePanel = (event: React.MouseEvent<any>) => {
    event.preventDefault();
    duplicatePanel(dashboard, panel);
  };

  const onCopyPanel = (event: React.MouseEvent<any>) => {
    event.preventDefault();
    copyPanel(panel);
  };

  const onRemovePanel = (event: React.MouseEvent<any>) => {
    event.preventDefault();
    removePanel(dashboard, panel, true);
  };

  // const onNavigateToExplore = (event: React.MouseEvent<any>) => {
  //   event.preventDefault();
  //   const openInNewWindow = event.ctrlKey || event.metaKey ? (url: string) => window.open(url) : undefined;
  //   // store.dispatch(navigateToExplore(panel, { getDataSourceSrv, getTimeSrv, getExploreUrl, openInNewWindow }) as any);
  // };

  const menu: PanelMenuItem[] = [];

  if (!panel.isEditing) {
    menu.push({
      text: 'View',
      iconClassName: 'eye',
      onClick: onViewPanel,
      shortcut: 'v',
    });
  }

  if (dashboard.canEditPanel(panel) && !panel.isEditing) {
    menu.push({
      text: 'Edit',
      iconClassName: 'edit',
      onClick: onEditPanel,
      shortcut: 'e',
    });
  }

  menu.push({
    text: 'Share',
    iconClassName: 'share-alt',
    onClick: onSharePanel,
    shortcut: 'p s',
  });

  // if (contextSrv.hasAccessToExplore() && !(panel.plugin && panel.plugin.meta.skipDataQuery)) {
  //   menu.push({
  //     text: 'Explore',
  //     iconClassName: 'compass',
  //     shortcut: 'x',
  //     onClick: onNavigateToExplore,
  //   });
  // }

  const inspectMenu: PanelMenuItem[] = [];

  // Only show these inspect actions for data plugins
  if (panel.plugin && !panel.plugin.meta.skipDataQuery) {
    inspectMenu.push({
      text: 'Data',
      onClick: (e: React.MouseEvent<any>) => onInspectPanel(e,'data'),
    });

    if (dashboard.meta.canEdit) {
      inspectMenu.push({
        text: 'Query',
        onClick: (e: React.MouseEvent<any>) => onInspectPanel(e,'query'),
      });
    }
  }

  inspectMenu.push({
    text: 'Panel JSON',
    onClick: (e: React.MouseEvent<any>) => onInspectPanel(e,'json'),
  });

  menu.push({
    type: 'submenu',
    text: 'Inspect',
    iconClassName: 'info-circle',
    onClick: (e: React.MouseEvent<any>) => onInspectPanel(e),
    shortcut: 'i',
    subMenu: inspectMenu,
  });

  const subMenu: PanelMenuItem[] = [];

  if (dashboard.canEditPanel(panel) && !(panel.isViewing || panel.isEditing)) {
    subMenu.push({
      text: 'Duplicate',
      onClick: onDuplicatePanel,
      shortcut: 'p d',
    });

    subMenu.push({
      text: 'Copy',
      onClick: onCopyPanel,
    });
  }


  if (!panel.isEditing && subMenu.length) {
    menu.push({
      type: 'submenu',
      text: 'More...',
      iconClassName: 'cube',
      subMenu,
      onClick: onMore,
    });
  }

  if (dashboard.canEditPanel(panel) && !panel.isEditing) {
    menu.push({ type: 'divider' });

    menu.push({
      text: 'Remove',
      iconClassName: 'trash-alt',
      onClick: onRemovePanel,
      shortcut: 'p r',
    });
  }

  return menu;
}
