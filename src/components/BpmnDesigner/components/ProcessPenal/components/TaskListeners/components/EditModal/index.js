// 执行监听器编辑弹框
import { Button, Divider, Form, Input, Modal, Popconfirm, Select, Table } from "antd";
import React, {useState, useEffect, useRef} from "react";

import {
    CopyOutlined,
    PlusOutlined,
} from '@ant-design/icons'

import {
    createListenerObject,
} from './utils'

const EditModal = (props) => {

    const formRef = useRef(null)

    const fieldFormRef = useRef(null)

    const {
        listenerEventTypeObject,
        listenerTypeObject,
        bpmnInstances,
        prefix,
    } = props

    const [type, setType] = useState(null)

    // 脚本类型
    const [scriptType, setScriptType] = useState(null)

    const [fieldModalVisible, setFieldModalVisible] = useState(false)
    const [fieldEditData, setFieldEditData] = useState(null)
    const [fieldEditIndex, setFieldEditIndex] = useState(null)
    const [fieldType, setFieldType] = useState(null)
    const [fieldsListOfListener, setFieldsListOfListener] = useState([])
    
    useEffect(() => {
        if (!!!fieldModalVisible) {
            setFieldEditData(null)
            setFieldType(null)
            setFieldEditIndex(null)
        }
    }, [fieldModalVisible])

    useEffect(() => {
        if (!!fieldModalVisible && !!fieldEditData) {
            fieldFormRef.current.setFieldsValue({
                ...fieldEditData,
            })
            setFieldType(fieldEditData.fieldType)
        }
    }, [fieldModalVisible, fieldEditData])

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

    const handleSubmit = () => {

        // ==========================

        formRef.current.validateFields().then(formData => {
            const listenerObject = createListenerObject(formData, true, prefix, bpmnInstances)
            console.log('listenerObject', listenerObject)
        })
    }

    return <>
        {
            !!props.visible && <Modal
                visible={props.visible}
                title={
                    !!props.editData ? '编辑' : '新增'
                }
                onCancel={() => {
                    props.setVisible && props.setVisible(false)
                }}
                width={600}
                bodyStyle={{
                    padding: '12px'
                }}
                okText="保存"
                onOk={() => {
                    handleSubmit()
                }}
            >
                <div>
                    <Form
                        ref={formRef}
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
                                        formRef.current.setFieldsValue({
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
                                                label={scriptType === 'inlineScript' ? '脚本内容' : '外部资源'}
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
                            setFieldModalVisible(true)
                            setFieldEditData(null)
                        }}
                    >添加字段</Button>
                </div>

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
                                            setFieldEditIndex(index)
                                            setFieldEditData(row)
                                            setFieldModalVisible(true)
                                        }}
                                    >编辑</a>
                                    <Popconfirm
                                        title="确认删除？"
                                        onConfirm={() => {
                                            let copyData = fieldsListOfListener.map(i => i)
                                            copyData.splice(index, 1)
                                            setFieldsListOfListener(list => copyData)
                                        }}
                                    ><a>删除</a></Popconfirm>
                                </div>
                            }
                        }
                    ]}
                    dataSource={fieldsListOfListener}
                ></Table>

            </Modal>
        }

        {
            !!fieldModalVisible && <Modal
                visible={fieldModalVisible}
                onCancel={() => setFieldModalVisible(false)}
                title={!!fieldEditData ? "编辑字段" : '新增字段'}
                onOk={() => {
                    fieldFormRef.current.validateFields().then(formData => {
                        console.log('formData =>', formData)
                        if (fieldEditIndex != null) {
                            // debugger
                            let copyData = fieldsListOfListener.map(i => i)
                            copyData[fieldEditIndex] = formData
                            setFieldsListOfListener(data => copyData)
                        } else {
                            setFieldsListOfListener(data => {
                                return [...data, formData]
                            })
                        }
                        
                        setFieldModalVisible(false)
                    })
                }}
                style={{top: '120px'}}
                bodyStyle={{padding: '12px'}}
            >
                <div>
                    <Form
                        ref={fieldFormRef}
                    >
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

export default EditModal