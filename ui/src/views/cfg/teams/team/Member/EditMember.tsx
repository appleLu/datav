import React, { useState, useEffect } from 'react'
import {  Form, FormField as Field } from 'src/packages/datav-core/src'
import { Modal, Button, notification } from 'antd'
import { getBackendSrv } from 'src/core/services/backend'
import appEvents from 'src/core/library/utils/app_events'
import RolePicker from 'src/views/components/Pickers/RolePicker'
import {  TeamMember } from 'src/types'

interface Props {
    teamId: number
    member: TeamMember
    onCancelEdit: any
}


const EditMember = (props: Props) => {
    const [tempMember, setTempMember] : [TeamMember,any]= useState(null)

    useEffect(() => {
        setTempMember(props.member)
    },[])
    const updateMember = async () => {
        props.onCancelEdit()
        tempMember.teamId = props.teamId
        getBackendSrv().post(`/api/teams/${props.teamId}/member`, tempMember).then(() => {
            appEvents.emit('update-team-member')
            notification['success']({
                message: "Success",
                description: `Team member ${tempMember.username} has been updated`,
                duration: 5
              });
        })

    }

    return (
        <>
            {
                tempMember && <Modal
                    title="Edit Team Member"
                    visible={true}
                    footer={null}
                    onCancel={props.onCancelEdit}
                >
                    <Form
                        //@ts-ignore
                        onSubmit={updateMember}
                    >
                        {({ register, errors }) => (
                            <>

                                <Field label="Member Role">
                                    <RolePicker onChange={(v) => setTempMember({...tempMember,role: v})} value={tempMember.role} />
                                </Field>
                                <Button type="primary" htmlType="submit" style={{ marginTop: '16px' }}>Submit</Button>
                            </>
                        )}
                    </Form>
                </Modal>
            }
        </>
    )
}

export default EditMember