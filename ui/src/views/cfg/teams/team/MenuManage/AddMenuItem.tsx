import React from 'react'

import {Drawer, Input, Row, Col, Form ,Button,Radio} from 'antd'
import {MenuItem} from 'src/types'

interface Props {
    drawerVisible : boolean
    selectedNode: MenuItem
    onChange: any
    onCancelDrawer: any
}
 
const AddMenuItem = (props:Props) =>{
    const {selectedNode,drawerVisible} = props
    return (
        <Drawer
                title={`Add menu item around '${selectedNode && selectedNode.title}'`}
                placement="right"
                closable={false}
                visible={drawerVisible}
                width={400}
                onClose={() =>props.onCancelDrawer() }
            >
                <Form layout="vertical" onFinish={(v) => props.onChange(v)} initialValues={{position: 1}}>
                    <Row>
                        <Col span="24">
                            <Form.Item
                                name="id"
                                label="Dashboard uid"
                            >
                                <Input placeholder="press key 'f' to open search board  and copy it" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span="24">
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
                        <Col span="24">
                            <Form.Item
                                name="icon"
                                label="Icon Name"
                            >
                                    <Input placeholder="e.g : users-alt" />
                            </Form.Item> 
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span="24">
                            <Form.Item
                                name="title"
                                label="Menu name"
                            >
                                    <Input placeholder="if empty, dashboard title will be shown in menu" />
                            </Form.Item> 
                        </Col>
                        <Col span="24">
                            <Form.Item
                                name="url"
                                label="Menu sub url"
                            >
                                    <Input placeholder="sub url for menu ,only one level,e.g : /test" />
                            </Form.Item> 
                            <Button htmlType="submit" type="primary" className="ub-mt4" ghost block>Submit</Button>
                        </Col>
                    </Row>
                </Form>


            </Drawer>
    )
}

export default AddMenuItem