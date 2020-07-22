import React from 'react'
import _ from 'lodash'
import { MenuItem } from 'src/types'
import { Tree, Drawer, Input, Row, Col, Form ,Button,Radio,notification} from 'antd'
import { DownOutlined } from '@ant-design/icons';
import { getBackendSrv } from 'src/core/services/backend';


interface Props {
    value: MenuItem[]
    onChange: any
}


interface State {
    menuItems:  MenuItem[]
    drawerVisible: boolean
    selectedNode: MenuItem
}
class MenuMange extends React.Component<Props, State> {
    constructor(props) {
        super(props)
        this.state = {
            menuItems : _.cloneDeep(this.props.value),
            drawerVisible: false,
            selectedNode: null
        };

        this.state.menuItems.forEach((item,i) => {
            item.level = 1
            item.key = item.id + i
            if (item.children) {
                item.children.forEach((child,j) => {
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

    async addMenuItem(v) {
        if (v.name == undefined || v.name.trim() == '') {
            notification['error']({
                message: "Error",
                description: `Menu name can't be empty`,
                duration: 5
              });
            return
        }

        const {selectedNode,menuItems} = this.state
        if (selectedNode.level === 2 && v.position === 2) {
            notification['error']({
                message: "Error",
                description: `Child menu item can't has a child`,
                duration: 5
              });
            return 
        }
        const res = await getBackendSrv().get(`/api/dashboard/uid/${v.dashUid}`)
        let i = -1
        let j = -1
        for (let m=0; m<menuItems.length;m++) {
            const item = menuItems[m]
            if (item.id === selectedNode.id) {
                i = m
                break
            }
            if (item.children) {
                for (let n=0;n<item.children.length;n++ ) {
                    const child = item.children[n]
                    if (child.id === selectedNode.id) {
                        i = m
                        j = n
                        break
                    }
                }
            }
        }

        const item = menuItems[i]
        if (v.position === 1) {
            menuItems.splice(i+1,0,{
                id: v.dashUid,
                url: v.url,
                key: v.dashUid,
                level: item.level,
                title: v.name,
                icon: v.icon
            })
        } else {
            item.children.push({
                id: v.dashUid,
                url: v.url,
                key: v.dashUid,
                level: item.level+1,
                icon: v.icon,
                title: v.name
            })
        }

        this.props.onChange(menuItems)
        this.setState({
            ...this.state,
            drawerVisible: false,
            selectedNode: null
        })
    }

    render() {
        const { drawerVisible, selectedNode,menuItems} = this.state
        return (
            <>
                <Tree
                    checkable
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
                    switcherIcon={<DownOutlined />}
                    onSelect={(_, e) => this.onNodeSelect(e)}
                />

                <Drawer
                    title={`Add menu item around ${selectedNode && selectedNode.title}`}
                    placement="top"
                    closable={false}
                    onClose={() => this.onCancelDrawer() }
                    visible={drawerVisible}
                    height={340}
                >
                    <Form layout="vertical" onFinish={(v) => this.addMenuItem(v)}>
                        <Row>
                            <Col span="12">
                                <Form.Item
                                    name="dashUid"
                                    label="Dashboard uid"
                                >
                                    <Input placeholder="press key 'f' to open search board  and copy it" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span="8">
                                <Form.Item
                                    name="position"
                                    label="Add to position"
                                >
                                     <Radio.Group>
                                        <Radio.Button value={1}>As Brother</Radio.Button>
                                        <Radio.Button value={2}>As Child</Radio.Button>
                                    </Radio.Group>
                                </Form.Item> 
                            </Col>
                            <Col span="6">
                                <Form.Item
                                    name="icon"
                                    label="Icon Name"
                                >
                                     <Input placeholder="e.g : users-alt" />
                                </Form.Item> 
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span="8">
                                <Form.Item
                                    name="name"
                                    label="Menu name"
                                >
                                     <Input placeholder="if name is empty, dashboard title will be shown in menu" />
                                </Form.Item> 
                                <Button htmlType="submit" type="primary" className="ub-mt2">Submit</Button>
                            </Col>
                            <Col span="8">
                                <Form.Item
                                    name="url"
                                    label="Menu sub url"
                                >
                                     <Input placeholder="sub url for menu ,only one level,e.g : /test" />
                                </Form.Item> 
                            </Col>
                        </Row>
                    </Form>


                </Drawer>
            </>
        );
    }
}

export default MenuMange