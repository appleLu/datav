import React, { useEffect, useState } from 'react'
import { getBackendSrv } from 'src/core/services/backend'
import {Select} from 'antd'
import { UserState } from 'src/store/reducers/user'
const {Option} = Select

interface Props {
    onSelectUser : any
    selectedUsers: number[]
    excludedUsers: {}
}

const UserPicker = (props:Props) =>{
    const [users,setUsers]: [UserState[],any] = useState([])
    const loadUsers = async () => {
        const res = await getBackendSrv().get('/api/users')
        const users = []
        res.data.forEach((user) => {
            if (!props.excludedUsers[user.id]) {
                users.push(user)
            }
        })
        setUsers(users)
    }

    useEffect(() => {
        loadUsers()
    },[])
    
    const options = users.map((user) => {
        return <Option key={user.id} value={user.id}>{user.username}</Option>
    })

    return (
        <>
            <Select value={props.selectedUsers} className="width-14" mode="multiple" onChange={props.onSelectUser} defaultOpen={true}>
                {options}
            </Select>
        </>
    )
}

export default UserPicker