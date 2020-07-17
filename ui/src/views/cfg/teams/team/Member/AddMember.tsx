import React, { useState } from 'react'
import { LinkButton,Form,FormField as Field,Input} from 'src/packages/datav-core/src'
import {Modal,Button, notification, message} from 'antd'
import {getBackendSrv} from 'src/core/services/backend'
import appEvents from 'src/core/library/utils/app_events'
import UserPicker from 'src/views/components/Pickers/UserPicker'
import RolePicker from 'src/views/components/Pickers/RolePicker'
import { Role } from 'src/types'

interface Props {
    teamId: number
    inTeamMembers: {}
}
 

const AddMember = (props: Props) => {
    const [modalVisible,setModalVisible] = useState(false)
    const [selectedMembers,setSelectedMembers] = useState([])
    const [memberRole,setMemberRole] = useState(Role.Viewer)
    const addMember = async ()  => {
        setSelectedMembers([])
        setModalVisible(false)
        setMemberRole(Role.Viewer)

        getBackendSrv().post(`/api/teams/members/${props.teamId}`,{members : selectedMembers, role: memberRole}).then(() => {
            appEvents.emit('update-team-member')
            notification['success']({
                message: "Success",
                description: `Team members has been added`,
                duration: 5
              });
        })

    }

    const selectMember = (val) => {
        setSelectedMembers(val)
    }

    return (
        <>
            <LinkButton onClick={() => setModalVisible(true)}>Add Member</LinkButton>
            <Modal
                title="Add Team Member"
                visible={modalVisible}
                footer={null}
                onCancel={() => setModalVisible(false)}
            >
                <Form 
                    //@ts-ignore
                    onSubmit={addMember}
                >
                    {({ register, errors }) => (
                        <>
                            <Field
                                label="Team Member"
                            >
                                <UserPicker onSelectUser={selectMember} selectedUsers={selectedMembers} excludedUsers={props.inTeamMembers}/>
                            </Field>

                            <Field label="Member Role">
                                <RolePicker onChange={setMemberRole} value={memberRole}/>
                            </Field>
                            <Button type="primary" htmlType="submit" style={{marginTop: '16px'}}>Submit</Button>
                        </>
                    )}
                </Form>
            </Modal>
        </>
    )
}

export default AddMember