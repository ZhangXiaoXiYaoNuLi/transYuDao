import React, { useRef, useEffect, useState } from 'react'

import { Button, Divider, Form, Input, Modal, Popconfirm, Select, Table } from 'antd'

import {
    CopyOutlined,
    PlusOutlined,
} from '@ant-design/icons'

import styles from '../../styles.less'

const ListenerEditModal = (props) => {

    const {
        visible,
        setVisible,
        fieldsListOfListener,
        openListenerFieldForm,
        removeListenerField,
        listenerFormRef,
        saveListenerConfig,
    } = props

    const [type, setType] = useState(null)

    // 脚本类型
    const [scriptType, setScriptType] = useState(null)

    // 表单数据
    const [listenerForm, setListenerForm] = useState({})

    const getLabel = (strType) => {
        const obj = {
            classListener: 'Java 类',
            expressionListener: '表达式',
            delegateExpressionListener: '代理表达式',
            scriptListener: '脚本',
        }
        return obj[strType]
    }

    const getName = (strType) => {
        const obj = {
            classListener: 'class',
            expressionListener: 'expression',
            delegateExpressionListener: 'delegateExpression',
        }
        return obj[strType]
    }

    return <>
        {
            !!visible && <Modal
                visible={props.visible}
                title="任务监听器"
                width={600}
                onCancel={() => {
                    props.setVisible && props.setVisible(false)
                }}
                bodyStyle={{
                    padding: '12px'
                }}

                onOk={() => {
                    saveListenerConfig()
                }}
            >
                <div>
                    <Form
                        ref={listenerFormRef}
                    >
                        <Form.Item
                            label="事件类型"
                            rules={[{required: true, message: '请选择类型'}]}
                            name="event"
                        >
                            <Select>
                                {
                                    !!props.listenerEventTypeObject && props.listenerEventTypeObject.map(item => {
                                        return <Select.Option
                                            value={item.value}
                                        >{item.label}</Select.Option>
                                    })
                                }
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="监听器 ID"
                            rules={[{required: true, message: '请输入 id'}]}
                            name={'id'}
                        >
                            <Input></Input>
                        </Form.Item>
                        <Form.Item
                            label="监听器类型"
                            rules={[{required: true, message: '请选择监听器类型'}]}
                            name="listenerType"
                        >
                            <Select
                                value={type}
                                onChange={val => {
                                    if (val !== 'scriptListener') {
                                        setScriptType(null)
                                        listenerFormRef.current.setFieldsValue({
                                            scriptFormat: null,
                                            scriptType: null,
                                            resource: null,
                                            value: null,
                                        })
                                    }
                                    setType(val)
                                }}
                            >
                                {
                                    !!props.listenerTypeObject && props.listenerTypeObject.map(item => {
                                        return <Select.Option
                                            value={item.value}
                                        >{item.label}</Select.Option>
                                    })
                                }
                            </Select>
                        </Form.Item>
                        
                        {
                            type != null && !!type.length && <>
                                {
                                    type === 'scriptListener' ? <>
                                        <Form.Item
                                            label="脚本格式"
                                            name="scriptFormat"
                                            rules={[{required: true, message: '请输入'}]}
                                        >
                                            <Input></Input>
                                        </Form.Item>
                                        <Form.Item
                                            label="脚本类型"
                                            name="scriptType"
                                            rules={[{required: true, message: '请输入'}]}
                                        >
                                            <Select
                                                onChange={e => {setScriptType(e)}}
                                            >
                                                {
                                                    [{label: '内联脚本', value: 'inlineScript'}, {label: '外部脚本', value: 'externalScript'}].map(item => {
                                                        return <Select.Option value={item.value}>{item.label}</Select.Option>
                                                    })
                                                }
                                            </Select>
                                        </Form.Item>
                                        {
                                            scriptType != null && <Form.Item
                                                label={scriptType === 'inlineScript' ? '脚本内容' : '资源地址'}
                                                name={scriptType === 'inlineScript' ? 'value' : 'resource'}
                                                rules={[{required: true, message: '请输入'}]}
                                            >
                                                <Input></Input>
                                            </Form.Item>
                                        }
                                    </> : <>
                                        <Form.Item
                                            label={getLabel(type)}
                                            name={getName(type)}
                                            rules={[{required: true, message: '请输入'}]}
                                        >
                                            <Input></Input>
                                        </Form.Item>
                                    </>
                                }
                            </>
                        }
                    </Form>
                </div>

                <Divider></Divider>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingBottom: '12px'
                    }}
                >
                    <div>
                        <CopyOutlined />
                        <span style={{paddingLeft: '8px', fontWeight: 'bold'}}>注入字段</span>
                    </div>
                    <Button 
                        icon={<PlusOutlined />}
                        onClick={() => {
                            openListenerFieldForm && openListenerFieldForm(null)
                        }}
                    >添加字段</Button>
                </div>

                {/* 字段展示表格 */}
                <Table
                    size="small"
                    bordered
                    pagination={false}
                    columns={[
                        {
                            title: '序号',
                            dataIndex: 'index',
                            render: (val, row, index) => index + 1
                        },
                        {
                            title: '字段名称',
                            dataIndex: 'name',
                        },
                        {
                            title: '字段类型',
                            dataIndex: 'fieldType',
                            render: (val) => val === 'string' ? '字符串' : '表达式',
                        },
                        {
                            title: '字段值/表达式',
                            dataIndex: 'name',
                            render: (val, row) => row.string || row.expression, 
                        },
                        {
                            title: '操作',
                            dataIndex: 'name',
                            width: 82,
                            render: (val, row, index) => {
                                return <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <a
                                        onClick={() => {
                                            openListenerFieldForm(row, index)
                                        }}
                                    >编辑</a>
                                    <Popconfirm
                                        title="确认删除？"
                                        onConfirm={() => {
                                            removeListenerField(row, index)
                                        }}
                                    ><a>删除</a></Popconfirm>
                                </div>
                            }
                        }
                    ]}
                    dataSource={fieldsListOfListener ? fieldsListOfListener : []}
                ></Table>
            </Modal>
        }
    </>
}

export default ListenerEditModal