import React from 'react'
import _ from 'lodash'
import { MenuItem } from 'src/types'
import { Tree, Drawer, Input, Row, Col, Form, Button, Radio, notification } from 'antd'
import { DownOutlined } from '@ant-design/icons';
import { getBackendSrv } from 'src/core/services/backend';
import AddMenuItem from './AddMenuItem'
import ManageMenuItem from './ManageMenuItem'

interface Props {
    value: MenuItem[]
    onChange: any
}


interface State {
    menuItems: MenuItem[]
    drawerVisible: boolean
    selectedNode: MenuItem
}
const isUrl = new RegExp("^/[a-zA-z]+")
class MenuMange extends React.Component<Props, State> {
    constructor(props) {
        super(props)
        this.state = {
            menuItems: _.cloneDeep(this.props.value),
            drawerVisible: false,
            selectedNode: null
        };

        this.state.menuItems.forEach((item, i) => {
            item.level = 1
            item.key = item.id + i
            if (item.children) {
                item.children.forEach((child, j) => {
                    child.level = 2
                })
            } else {
                item.children = []
            }
        })

        this.onDrop = this.onDrop.bind(this)
        // this.onDragStart = this.onDragStart.bind(this)
        // this.onDragEnd = this.onDragEnd.bind(this)
    }


    onDrop = info => {
        const dropKey = info.node.props.eventKey;
        const dragKey = info.dragNode.props.eventKey;
        const dropPos = info.node.props.pos.split('-');
        const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

        const loop = (data, key, callback) => {
            for (let i = 0; i < data.length; i++) {
                if (data[i].key === key) {
                    return callback(data[i], i, data);
                }
                if (data[i].children) {
                    loop(data[i].children, key, callback);
                }
            }
        };
        const data = [...this.state.menuItems];

        // Find dragObject
        let dragObj;
        loop(data, dragKey, (item, index, arr) => {
            arr.splice(index, 1);
            dragObj = item;
        });

        if (!info.dropToGap) {
            // Drop on the content
            loop(data, dropKey, item => {
                item.children = item.children || [];
                // where to insert 示例添加到尾部，可以是随意位置
                item.children.push(dragObj);
            });
        } else if (
            (info.node.props.children || []).length > 0 && // Has children
            info.node.props.expanded && // Is expanded
            dropPosition === 1 // On the bottom gap
        ) {
            loop(data, dropKey, item => {
                item.children = item.children || [];
                // where to insert 示例添加到头部，可以是随意位置
                item.children.unshift(dragObj);
            });
        } else {
            let ar;
            let i;
            loop(data, dropKey, (item, index, arr) => {
                ar = arr;
                i = index;
            });
            if (dropPosition === -1) {
                ar.splice(i, 0, dragObj);
            } else {
                ar.splice(i + 1, 0, dragObj);
            }
        }

        this.setState({
            menuItems: data,
        });

        this.props.onChange(data)
    };

    // onDragStart(e) {
    //     this.state.menuItems.forEach((node) => {
    //         if (e.node.level == 2) {
    //             return 
    //         }

    //         if (node.level !== e.node.level) {
    //             node.disabled = true
    //         }
    //         if (node.children) {
    //             node.children.forEach((child) => {
    //                 if (child.level !== e.node.level) {
    //                     child.disabled = true
    //                 }
    //             })
    //         }
    //     })
    // }
    // onDragEnd(e) {
    //     this.state.menuItems.forEach((node) => {
    //         if (node.level !== e.node.level) {
    //             node.disabled = false
    //         }
    //         if (node.children) {
    //             node.children.forEach((child) => {
    //                 if (child.level !== e.node.level) {
    //                     child.disabled = false
    //                 }
    //             })
    //         }
    //     })
    // }
    onNodeSelect(e) {
        const { node } = e
        this.setState({
            ...this.state,
            drawerVisible: true,
            selectedNode: node
        })
    }

    onCancelDrawer() {
        this.setState({ ...this.state, drawerVisible: false, selectedNode: null })
    }

    isMenuValid(v, menuItems) {
        if (v.title == undefined || v.title.trim() == '') {
            notification['error']({
                message: "Error",
                description: `Menu name can't be empty`,
                duration: 5
            });
            return false
        }
        v.title = v.title.trim()

        if (v.url == undefined || v.url.trim() == '') {
            notification['error']({
                message: "Error",
                description: `Menu url can't be empty`,
                duration: 5
            });
            return false
        }
        v.url = v.url.trim()

        if (!_.startsWith(v.url,'/')) {
            notification['error']({
                message: "Error",
                description: `Url must be start with '/'`,
                duration: 5
            });
            return false
        }
        
        let count = 0
        for (let i=0;i<v.url.length;i++) {
            const alpha = v.url[i]
            if (alpha == '/') {
                count++
                continue
            }
            
            if (!(alpha>= 'a' && alpha <= 'z') && !(alpha>= 'A' && alpha <= 'Z')) {
                notification['error']({
                    message: "Error",
                    description: `Url  can only have '/' and 'aAzZ' letters`,
                    duration: 5
                });
                return false
            }
        }
        if (count > 1) {
            notification['error']({
                message: "Error",
                description: `Sub url can have only one '/'`,
                duration: 5
            });
            return false
        }


        if (v.id == undefined || v.id.trim() == '') {
            notification['error']({
                message: "Error",
                description: `Menu dashboard uid can't be empty`,
                duration: 5
            });
            return false
        }
        v.id = v.id.trim()

        if (v.icon == undefined || v.icon.trim() == '') {
            notification['error']({
                message: "Error",
                description: `Menu icon can't be empty`,
                duration: 5
            });
            return false
        }
        v.icon = v.icon.trim()

        return true
    }
    async addMenuItem(v) {
        const { selectedNode, menuItems } = this.state
        if (!this.isMenuValid(v, menuItems)) {
            return
        }

        const [i, j] = findSelectedNode(v.id, menuItems)
        if (i !== -1) {
            notification['error']({
                message: "Error",
                description: `Dashboard uid already exist at menu : ${menuItems[i].title}  ${j !== -1 ? ' -> ' + menuItems[i].children[j].title : ''}`,
                duration: 5
            });
            return
        }

        if (selectedNode.level === 2 && v.position === 2) {
            notification['error']({
                message: "Error",
                description: `Child menu item can't has a child`,
                duration: 5
            });
            return
        }

        // the same url cant be exist in the same level
        {
            if (selectedNode.level === 1 && v.position === 1) {
                for (let i = 0; i < menuItems.length; i++) {
                    if (menuItems[i].url === v.url) {
                        notification['error']({
                            message: "Error",
                            description: `The same url already exist at menu : ${menuItems[i].title}`,
                            duration: 5
                        });
                        return
                    }
                }
            }

            if (selectedNode.level === 1 && v.position === 2) {
                alert(1)
                for (let i = 0; i < selectedNode.children.length; i++) {
                    if (selectedNode.children[i].url === v.url) {
                        notification['error']({
                            message: "Error",
                            description: `The same url already exist at menu :${selectedNode.title} -> ${  selectedNode.children[i].title }`,
                            duration: 5
                        });
                        return
                    }
                }
            }

            if (selectedNode.level === 2 && v.position === 1) {
                const [i, j] = findSelectedNode(selectedNode.id, menuItems)
                const item = menuItems[i]
                for (let i = 0; i < item.children.length; i++) {
                    if (item.children[i].url === v.url) {
                        notification['error']({
                            message: "Error",
                            description: `The same url already exist at menu :${item.title} -> ${item.children[i].title}`,
                            duration: 5
                        });
                        return
                    }
                }
            }
        }

        try {
            const res = await getBackendSrv().get(`/api/dashboard/uid/${v.id}`)
            const [i, j] = findSelectedNode(selectedNode.id, menuItems)
            const item = menuItems[i]
            if (v.position === 1) {
                menuItems.splice(i + 1, 0, {
                    id: v.id,
                    url: v.url,
                    key: v.id,
                    level: item.level,
                    title: v.title,
                    icon: v.icon
                })
            } else {
                item.children.push({
                    id: v.id,
                    url: v.url,
                    key: v.id,
                    level: item.level + 1,
                    icon: v.icon,
                    title: v.title
                })
            }

            this.props.onChange(menuItems)
            this.setState({
                ...this.state,
                drawerVisible: false,
                selectedNode: null
            })
        } catch (error) {
            if (error.status === 404) {
                notification['error']({
                    message: "Error",
                    description: `Can't find dashboard`,
                    duration: 5
                });
            }
        }
    }

    updateMenuItem(v: MenuItem) {
        const { selectedNode, menuItems } = this.state
        if (!this.isMenuValid(v, menuItems)) {
            return
        }

        // check if the same dashboard uid exists
        {
            for (let i = 0; i < menuItems.length; i++) {
                if (menuItems[i].id !== selectedNode.id) {
                    if (menuItems[i].id === v.id) {
                        notification['error']({
                            message: "Error",
                            description: `Dashboard uid already exist at menu : ${menuItems[i].title}`,
                            duration: 5
                        });
                        return
                    }
                }


                for (let j = 0; j < menuItems[i].children.length; j++) {
                    const child = menuItems[i].children[j]
                    if (child.id !== selectedNode.id) {
                        if (child.id === v.id) {
                            notification['error']({
                                message: "Error",
                                description: `Dashboard uid already exist at menu : ${menuItems[i].title} -> ${menuItems[i].children[j].title}`,
                                duration: 5
                            });
                            return
                        }
                    }
                }
            }
        }

        // check if the same url exists
        {
            if (selectedNode.level === 1) {
                for (let i = 0; i < menuItems.length; i++) {
                    if (menuItems[i].id !== selectedNode.id) {
                        if (menuItems[i].url === v.url) {
                            notification['error']({
                                message: "Error",
                                description: `The same url already exist at menu : ${menuItems[i].title}`,
                                duration: 5
                            });
                            return
                        }
                    }
                }
            } else {
                const [i, j] = findSelectedNode(selectedNode.id, menuItems)
                const item = menuItems[i]
                for (let i = 0; i < item.children.length; i++) {
                    if (item.children[i].id !== selectedNode.id) {
                        if (item.children[i].url === v.url) {
                            notification['error']({
                                message: "Error",
                                description: `The same url already exist at menu :${item.title} -> ${item.children[i].title }`,
                                duration: 5
                            });
                            return
                        }
                    }
                }
            }
        }
        const newMenuItems = _.cloneDeep(menuItems)

        const [i, j] = findSelectedNode(selectedNode.id, newMenuItems)
        let item: MenuItem
        if (j === -1) {
            item = newMenuItems[i]
        } else {
            item = newMenuItems[i].children[j]
        }

        item.id = v.id
        item.title = v.title
        item.url = v.url
        item.icon = v.icon

        this.setState({
            ...this.state,
            menuItems: newMenuItems
        })

        this.onCancelDrawer()
        this.props.onChange(newMenuItems)
    }

    deleteMenuItem(selectedNode: MenuItem) {
        let menuItems = _.cloneDeep(this.state.menuItems)

        const [i, j] = findSelectedNode(selectedNode.id, menuItems)
        if (j === -1) {
            if (menuItems.length === 1) {
                notification['error']({
                    message: "Error",
                    description: `Menu must have at lease one item`,
                    duration: 5
                })
                return
            }
            _.pullAt(menuItems, i)
        } else {
            _.pullAt(menuItems[i].children, j)
        }
        console.log(i, j)
        this.setState({
            ...this.state,
            menuItems: menuItems
        })

        console.log(menuItems)
        this.onCancelDrawer()
        this.props.onChange(menuItems)
    }

    render() {
        const { drawerVisible, selectedNode, menuItems } = this.state
        return (
            <>
                <Tree
                    style={{padding: '5px'}}
                    blockNode
                    className="draggable-tree"
                    draggable
                    // onDragStart={this.onDragStart}
                    onDrop={this.onDrop}
                    // onDragEnd={this.onDragEnd}
                    //@ts-ignore
                    treeData={menuItems}
                    defaultExpandAll
                    showLine={false}
                    // switcherIcon={<DownOutlined />}
                    onSelect={(_, e) => this.onNodeSelect(e)}
                />
                {selectedNode && <AddMenuItem drawerVisible={drawerVisible} selectedNode={selectedNode} onChange={(v) => this.addMenuItem(v)} onCancelDrawer={() => this.onCancelDrawer()} />}
                {selectedNode && <ManageMenuItem drawerVisible={drawerVisible} selectedNode={selectedNode} onChange={(v) => this.updateMenuItem(v)} onCancelDrawer={() => this.onCancelDrawer()} onDelete={(v) => this.deleteMenuItem(v)} />}

            </>
        );
    }
}

function findSelectedNode(id: string, nodes: MenuItem[]) {
    let i = -1
    let j = -1
    for (let m = 0; m < nodes.length; m++) {
        const item = nodes[m]
        if (item.id === id) {
            i = m
            break
        }
        if (item.children) {
            for (let n = 0; n < item.children.length; n++) {
                const child = item.children[n]
                if (child.id === id) {
                    i = m
                    j = n
                    break
                }
            }
        }
    }

    return [i, j]
}

export default MenuMange


