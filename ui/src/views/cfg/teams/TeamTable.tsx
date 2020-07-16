import React, { useState } from 'react'
import { Table, Space, Modal,notification} from 'antd'
import { getBackendSrv } from 'src/core/services/backend';
import { Team } from 'src/types';
import { Link } from 'react-router-dom';

interface Props {
    teams: Team[]
    reloadTeams: any
}

const TeamTable = (props: Props) => {
    const [editTeamVisible, setEditTeamVisible] = useState(false)
    const [teamEdit, setTeamEdit] = useState(null)

    props.teams?.map((team) => {
        //@ts-ignore
        team.key = team.id
    })

    const editTeam = (team) => {
        setTeamEdit(team)
        setEditTeamVisible(true)
    }
    const columns = [
        ...rawColumns,
        {
            title: 'Action',
            key: 'action',
            render: (_, team) => (
                <Space size="middle">
                    <Link to={`/team/members/${team.id}`}  className="pointer">Manage</Link>
                </Space>
            ),
        }
    ]

    const onTeamDelete = (team) => {
        getBackendSrv().delete(`/api/admin/team/${team.id}`).then(() => {
            notification['success']({
                message: "Success",
                description: `Team ${team.name} has been deleted`,
                duration: 5
            });

            props.reloadTeams()

            setEditTeamVisible(false)
        })
    }
    return (
        <>
            <Table
                columns={columns}
                dataSource={props.teams}
                pagination={false}
            />
            {editTeamVisible &&
                <Modal
                    title="Edit Team"
                    visible={true}
                    footer={null}
                    onCancel={() => setEditTeamVisible(false)}
                    maskClosable={false}
                >
                </Modal>}
        </>
    )

}

export default TeamTable

const rawColumns = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Created By',
        dataIndex: 'createdBy',
        key: 'createdBy',
    },
    {
        title: 'Members',
        dataIndex: 'memberCount',
        key: 'memberCount',
    }
]