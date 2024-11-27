import React, { useRef, useEffect, useState } from 'react'

import { Button, Divider, Form, Input, Modal, Popconfirm, Select, Table } from "antd";

const FieldEditModal = (props) => {

    const {
        visible,
        setVisible,
        listenerFieldFormRef,
        saveListenerField,
    } = props

    const [fieldType, setFieldType] = useState(null)

    return <>
        {
            !!visible && <Modal
                title="字段配置"
                visible={visible}
                onCancel={() => setVisible(false)}
                onOk={() => {
                    saveListenerField()
                }}
                style={{top: '120px'}}
                bodyStyle={{padding: '12px'}}
            >
                <div>
                    <Form ref={listenerFieldFormRef}>
                    <Form.Item
                            label="字段名"
                            name="name"
                            rules={[{required: true}]}
                        >
                            <Input></Input>
                        </Form.Item>
                        <Form.Item
                            label="字段类型"
                            name="fieldType"
                            rules={[{required: true}]}
                        >
                            <Select
                                value={fieldType}
                                options={[{label: '字符串', value: 'string'}, {label: '表达式', value: 'expression'}]}
                                onChange={val => {
                                    setFieldType(val)
                                }}
                            ></Select>
                        </Form.Item>
                        {
                            fieldType != null && <Form.Item
                                label={fieldType === 'string' ? '字符串' : '表达式'}
                                name={fieldType === 'string' ? 'string' : 'expression'}
                                rules={[{required: true}]}
                            >
                                <Input></Input>
                            </Form.Item>
                        }
                    </Form>
                </div>
            </Modal>
        }
    </>
}

export default FieldEditModal