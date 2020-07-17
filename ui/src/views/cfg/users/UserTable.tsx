import React, { useState } from 'react'
import { UserState } from 'src/store/reducers/user'
import { Table, Space, Modal,notification,Tag} from 'antd'
import { UserProfile } from './components/UserProfile'
import { getBackendSrv } from 'src/core/services/backend';
import { getState } from 'src/store/store';

interface Props {
    users: UserState[]
    reloadUsers: any
}

const UserTable = (props: Props) => {
    const [editUserVisible, setEditUserVisible] = useState(false)
    const [userEdit, setUserEdit] = useState(null)

    props.users?.map((user) => {
        //@ts-ignore
        user.key = user.id
    })

    const editUser = (user) => {
        setUserEdit(user)
        setEditUserVisible(true)
    }
    const columns = [
        {
            title: 'Username',
            key: 'username',
            render: (_, user:UserState) => (
                <>
                <span>{user.username}</span>
                {getState().user.id === user.id && <Tag className="ub-ml1">You</Tag>}
                </>
            ),
        },
        ...rawColumns,
        {
            title: 'Action',
            key: 'action',
            render: (_, user) => (
                <Space size="middle">
                    <span onClick={() => editUser(user)} className="pointer">Edit</span>
                </Space>
            ),
        }
    ]

    const onUserDelete = (user) => {
        getBackendSrv().delete(`/api/admin/user/${user.id}`).then(() => {
            notification['success']({
                message: "Success",
                description: `User ${user.username} has been deleted`,
                duration: 5
            });

            props.reloadUsers()

            setEditUserVisible(false)
        })
    }
    return (
        <>
            <Table
                columns={columns}
                dataSource={props.users}
                pagination={false}
            />
            {editUserVisible &&
                <Modal
                    title="Edit User"
                    visible={true}
                    footer={null}
                    onCancel={() => setEditUserVisible(false)}
                    maskClosable={false}
                >
                    <UserProfile user={userEdit} onUserDelete={onUserDelete} reloadUsers={props.reloadUsers}/>
                </Modal>}
        </>
    )

}

export default UserTable

const rawColumns = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
    },
    {
        title: 'Mobile',
        dataIndex: 'mobile',
        key: 'mobile',
    },
    {
        title: 'Global Role',
        dataIndex: 'role',
        key: 'role'
    },
]