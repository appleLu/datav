import React, { useState } from 'react'
import { Controller as InputControl } from 'react-hook-form';
import { LinkButton,Form,FormField as Field,Input,config,RadioButtonGroup} from 'src/packages/datav-core/src'
import {Modal,Button, notification} from 'antd'
import {getBackendSrv} from 'src/core/services/backend'
import isEmail from 'validator/lib/isEmail';
import { Role } from 'src/types';
import RolePicker from 'src/views/components/Pickers/RolePicker'
interface Props {
    onAddUser : any
}

const roles = [
    { label: 'Viewer', value: Role.Viewer },
    { label: 'Editor', value: Role.Editor },
    { label: 'Admin', value: Role.Admin },
  ];

const AddUser = (props: Props) => {
    const [modalVisible,setModalVisible] = useState(false)

    const initialFormModel = {
        username: '',
        password: '',
        email: '',
        role: 'Viewer'
    }

    const addUser = async (user)  => {
        const res = await getBackendSrv().post('/api/admin/user/new',user)
        props.onAddUser(res.data)
        notification['success']({
            message: "Success",
            description: `User ${user.username} has been added`,
            duration: 5
          });
        setModalVisible(false)
    }

    const validateUserName = async (name) => {
        name = (name || '').trim();
        if (name.length === 0) {
            return 'Username is required'
        }

        if (name.toLowerCase() === config.defaultAdminName) {
            return `Cannot use 'admin' as username`
        }

        const res = await getBackendSrv().get('/api/users/user',{username: name})
        if (res.data.id == 0) {
            return true
        }

        return 'username already exists'
    }

    const validateEmail = async (email) => {
        email = (email || '').trim();
        if (email != '') {
            if (!isEmail(email)) {
                return 'invalid email format'
            }
            const res = await getBackendSrv().get('/api/users/user',{email: email})
            if (res.data.id == 0) {
                return true
            }
    
            return 'email already exists'
        }

        return true
    }

    return (
        <>
            <LinkButton onClick={() => setModalVisible(true)}>Add User</LinkButton>
            <Modal
                title="Add New User"
                visible={modalVisible}
                footer={null}
                onCancel={() => setModalVisible(false)}
            >
                <Form 
                    //@ts-ignore
                    defaultValues={initialFormModel} 
                    onSubmit={addUser}
                >
                    {({ register,control, errors }) => (
                        <>
                            <Field
                                label="Username"
                                invalid={!!errors.username}
                                //@ts-ignore
                                error={errors.username && errors.username.message}
                            >
                                <Input
                                    name="username"
                                    ref={register({
                                        required: 'Username is required.',
                                        validate: async v => await validateUserName(v),
                                    })}
                                />
                            </Field>
                            <Field
                                label="Password"
                                invalid={!!errors.password}
                                //@ts-ignore
                                error={errors.password && errors.password.message}
                            >
                                <Input
                                    type="password"
                                    name="password"
                                    ref={register({
                                        required: 'Password is required.'
                                    })}
                                />
                            </Field>
                            <Field
                                label="Email"
                                invalid={!!errors.email}
                                //@ts-ignore
                                error={errors.email && errors.email.message}
                            >
                                <Input
                                    name="email"
                                    placeholder="can be empty"
                                    ref={register({
                                        validate: async v => await validateEmail(v),
                                    })}
                                /> 
                            </Field>
                            <Field label="Role" >
                                <InputControl as={RolePicker} control={control}  name="role" />
                            </Field>

                            <Button type="primary" htmlType="submit" style={{marginTop: '16px'}}>Submit</Button>
                        </>
                    )}
                </Form>
            </Modal>
        </>
    )
}

export default AddUser