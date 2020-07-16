import { NavModel } from 'src/packages/datav-core';
import { MenuItem } from 'src/types';
import {store} from 'src/store/store'


function getNotFoundModel(): NavModel {
    const node: MenuItem = {
        id: 'not-found',
        text: 'Page not found',
        icon: 'exclamation-triangle',
        title: '404 Error',
        url: 'not-found',
    };

    return {
        node: node,
        main: node,
    };
}

export function getNavModel(id: string, parentID: string): NavModel {
    const menuItems = store.getState().menu.items
    // find main node
    let main: MenuItem;
    menuItems.forEach((item) => {
        if (item.id === parentID) {
            main = item
        }
    })
    if (!main) {
        return getNotFoundModel();
    }

    // set current selected node to active
    let node: MenuItem
    main.children.forEach(item => {
        if (item.id === id) {
            node = item
            item.active = true
            return
        } 
        
        item.active = false
    })

    if(!node) {
        return getNotFoundModel();
    }
    
    return {
        node: node,
        main: main,
    }
}

export const getTitleFromNavModel = (navModel: NavModel) => {
    return `${navModel.main.text}${navModel.node.text ? ': ' + navModel.node.text : ''}`;
};


export function getNotFoundNav(): NavModel {
    return getWarningNav('Page not found', '404 Error');
  }
  
  export function getWarningNav(text: string, subTitle?: string): NavModel {
    const node = {
      text,
      subTitle,
      icon: 'exclamation-triangle',
    };
    return {
      breadcrumbs: [node],
      node: node,
      main: node,
    };
  }