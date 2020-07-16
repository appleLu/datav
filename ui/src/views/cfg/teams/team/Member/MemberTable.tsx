import React, { useState } from 'react'
import { Table, Space, Modal,notification, Tag} from 'antd'
import { getBackendSrv } from 'src/core/services/backend';
import { TeamMember } from 'src/types';
import { ConfirmModal } from 'src/packages/datav-core/src';
import appEvents from 'src/core/library/utils/app_events';

interface Props {
    teamId: number
    members: TeamMember[]
    teamCreatedBy : number
}


const MemberTable = (props: Props) => {
    const [modalVisible,setModalVisible] = useState(false)
    const [memberToDelete,setMemberToDelete]:[TeamMember,any]= useState(null)

    const deleteMember = () => {
        if (memberToDelete) {
            getBackendSrv().delete(`/api/teams/${props.teamId}/${memberToDelete.id}`).then(() => {
                appEvents.emit('update-team-member')
                notification['success']({
                    message: "Success",
                    description: `Team member ${memberToDelete.username} has been deleted`,
                    duration: 5
                  });
            })
        }
        setModalVisible(false)
    }

    const columns = [
        {
            title: 'Username',
            key: 'username',
            render: (_, member) => (
                <>
                <span>{member.username}</span>
                {props.teamCreatedBy === member.id && <Tag className="ub-ml1">Creator</Tag>}
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
                        setMemberToDelete(member)
                        setModalVisible(true)
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
            <ConfirmModal
                isOpen={modalVisible}
                title="Delete Team Member"
                body="Are you sure you want to delete this member?"
                confirmText="Delete member"
                onConfirm={() => deleteMember()}
                onDismiss={() =>setModalVisible(false)}
            />
        </>
    )

}

export default MemberTable

const rawColumns = [
    {
        title: 'Role',
        dataIndex: 'role',
        key: 'role',
    },
    {
        title: 'Joined',
        dataIndex: 'createdAge',
        key: 'createdAge',
    }
]