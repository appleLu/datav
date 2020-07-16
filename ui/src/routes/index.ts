/*eslint-disable*/
import _ from 'lodash'
import { StoreState } from 'src/types'

export const routers = []
export const initRoutes = (store: StoreState) => {
    store.menu.items.map((menuItem: any) => {
        if (!_.isEmpty(menuItem.children)) {
            menuItem.children.map(r => {
                    r.url = menuItem.url != null ? menuItem.url + r.url : r.url
                    r.parentID = menuItem.id
                    // concat route.path and its child's path
                    routers.push(r)
                })
            } else {
                routers.push(menuItem)
            }
        })
}
