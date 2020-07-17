import React, { useState } from 'react'
import { Table, Space, Modal,notification, Tag} from 'antd'
import { getBackendSrv } from 'src/core/services/backend';
import { TeamMember } from 'src/types';
import { ConfirmModal } from 'src/packages/datav-core/src';
import appEvents from 'src/core/library/utils/app_events';
import EditMember from './EditMember'
import { getState } from 'src/store/store';

interface Props {
    teamId: number
    members: TeamMember[]
    teamCreatedBy : number
}


const MemberTable = (props: Props) => {
    const [delModalVisible,setDelModalVisible] = useState(false)
    const [tempMember,setTempMember]:[TeamMember,any]= useState(null)
    const [editVisible,setEditVisible] = useState(false)

    const deleteMember = () => {
        if (tempMember) {
            getBackendSrv().delete(`/api/teams/${props.teamId}/${tempMember.id}`).then(() => {
                appEvents.emit('update-team-member')
                notification['success']({
                    message: "Success",
                    description: `Team member ${tempMember.username} has been deleted`,
                    duration: 5
                  });
            })
        }
        setDelModalVisible(false)
    }

    const columns = [
        {
            title: 'Username',
            key: 'username',
            render: (_, member) => (
                <>
                <span>{member.username}</span>
                {props.teamCreatedBy === member.id && <Tag className="ub-ml1">Creator</Tag>}
                {getState().user.id === member.id && <Tag className="ub-ml1">You</Tag>}
                </>
            ),
        },
        ...rawColumns,
        {
            title: 'Action',
            key: 'action',
            render: (_, member) => (
                <Space size="middle">
                    <span onClick={() => {
                        setTempMember(member)
                        setEditVisible(true)
                    }} className="pointer">Edit</span>
                    <span onClick={() => {
                        setTempMember(member)
                        setDelModalVisible(true)
                    }} className="pointer">Delete</span>
                </Space>
            ),
        }
    ]


    return (
        <>
            <Table
                columns={columns}
                dataSource={props.members}
                pagination={false}
            />
            {editVisible && <EditMember teamId={props.teamId} member={tempMember} onCancelEdit={() => setEditVisible(false)}/>}
            <ConfirmModal
                isOpen={delModalVisible}
                title="Delete Team Member"
                body="Are you sure you want to delete this member?"
                confirmText="Delete member"
                onConfirm={() => deleteMember()}
                onDismiss={() =>setDelModalVisible(false)}
            />
        </>
    )

}

export default MemberTable

const rawColumns = [
    {
        title: 'Team Role',
        dataIndex: 'role',
        key: 'role',
    },
    {
        title: 'Joined',
        dataIndex: 'createdAge',
        key: 'createdAge',
    }
]