import { Role } from "./acl";

export interface MenuItem {
    id?: string;
    parentID?: string;
    text: string;
    url?: string; // when url set to null, children will have their own direct url to accsess
    title?: string;
    icon?: string;
    img?: string;
    showPosition?: MenuPosition;
    redirectTo?: string; //can be 3 types,  1. undefined: access MenuItem's url 2. null: MenuItem can't be clicked 3. a real url string, click MenuItem ,will access this url
    children?: MenuItem[];
    breadcrumbs?: any[];
    sortWeight?: number;
    component?: any;
    active?: boolean;
    hideFromTabs?: boolean;
    needRole?: Role; // if user wants to see this menu item, his role must be greater than this
}

export enum MenuPosition {
    Top = 'top',
    Bottom = 'bottom',
}