import React, { useState, useEffect } from 'react'

import {Drawer, Input, Row, Col, Form ,Button} from 'antd'
import {MenuItem} from 'src/types'
import { ConfirmModal } from 'src/packages/datav-core/src'

interface Props {
    drawerVisible : boolean
    selectedNode: MenuItem
    onChange: any
    onCancelDrawer: any
    onDelete: any
} 

const ManageMenuItem = (props:Props) =>{
    const [form] = Form.useForm();
    const [confirmVisible,setConfirmVisible] = useState(false)
    const {selectedNode,drawerVisible} = props
    
    useEffect(() => {
        form.setFieldsValue({id: selectedNode.id})
        form.setFieldsValue({title: selectedNode.title})
        form.setFieldsValue({url: selectedNode.url})
        form.setFieldsValue({icon: selectedNode.icon})
    },[selectedNode])

  
    return (
        <>
        <Drawer
                title={`Update menu item '${selectedNode && selectedNode.title}'`}
                placement="left"
                closable={false}
                visible={drawerVisible}
                height={350}
                onClose={() =>props.onCancelDrawer()}
                footer={
                    <div
                      style={{
                        width: '100%'
                      }}
                    >
                      <Button type="primary" danger block onClick={() => setConfirmVisible(true)}>
                         Delete
                      </Button>
                    </div>
                  }
            >
                <Form layout="vertical" form={form} onFinish={(v) => props.onChange(v)} >
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
                                    <Input placeholder="if name is empty, dashboard title will be shown in menu" />
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
            {selectedNode && <ConfirmModal
                isOpen={confirmVisible}
                title={`Delete Menu Item ${selectedNode.title}`}
                body= {`Are you sure you want to delete this menu item? all of its children will be removed too!`}
                confirmText= "Delete"
                onConfirm={() => {
                    setConfirmVisible(false)
                    props.onDelete(selectedNode)
                }}
                onDismiss={() => setConfirmVisible(false)}
            />}
            </>
    )
}

export default ManageMenuItem