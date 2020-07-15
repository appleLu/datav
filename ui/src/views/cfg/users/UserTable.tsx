import React, { useState } from 'react'
import { UserState } from 'src/store/reducers/user'
import { Table, Space, Modal,notification} from 'antd'
import { UserProfile } from './components/UserProfile'
import { getBackendSrv } from 'src/core/services/backend';

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
        title: 'Username',
        dataIndex: 'username',
        key: 'username',
    },
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
        title: 'Role',
        dataIndex: 'role',
        key: 'role'
    },
]