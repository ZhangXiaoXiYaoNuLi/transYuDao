// 流转条件配置
import { Button, Form, Input, Select } from 'antd'
import React, { useRef, useEffect, useState } from 'react'

import useDeepCompareEffect from 'use-deep-compare-effect';

const FlowCondition = (props) => {

    const {
        id,
        type,
        bpmnInstances,
        businessObject,
        prefix,
    } = props

    const formRef = useRef(null)

    const [flowConditionForm, setFlowConditionForm] = useState({})

    const [bpmnElementSourceRef, setBpmnElementSourceRef] = useState(null)

    const [flowConditionRef, setFlowConditionRef] = useState(null)

    useDeepCompareEffect(() => {
        console.log('flowConditionForm => ', flowConditionForm)
    }, [flowConditionForm])

    // 流转类型改变
    const updateFlowType = (flowType) => {
        // 正常条件类
        if (flowType === 'condition') {
            let resFlowConditionRef = bpmnInstances.moddle.create('bpmn:FormalExpression')
            setFlowConditionRef(resFlowConditionRef)
            bpmnInstances.modeling.updateProperties(bpmnInstances.bpmnElement, {
                conditionExpression: resFlowConditionRef
            })
            return
        }
        // 默认路径
        if (flowType === 'default') {
            bpmnInstances.modeling.updateProperties(bpmnInstances.bpmnElement, {
                conditionExpression: null
            })
            bpmnInstances.modeling.updateProperties(bpmnInstances.bpmnElement.source, {
                default: bpmnInstances.bpmnElement
            })
            return
        }
        // 正常路径，如果来源节点的默认路径是当前连线时，清除父元素的默认路径配置
        if (
            bpmnElementSourceRef.default &&
            bpmnElementSourceRef.default.id === bpmnInstances.bpmnElement.id
        ) {
            bpmnInstances.modeling.updateProperties(bpmnInstances.bpmnElement.source, {
                default: null
            })
        }

        bpmnInstances.modeling.updateProperties(bpmnInstances.bpmnElement, {
            conditionExpression: null
        })
    }

    // 表达式改变 and 脚本输入框改变
    const updateFlowCondition = (fieldName, value) => {
        let newFlowConditionForm = {...flowConditionForm, [fieldName]: value}
        // debugger
        let { conditionType, scriptType, body, resource, language } = newFlowConditionForm
        console.log('language =>', language)
        let condition
        if (conditionType === 'expression') {
        condition = bpmnInstances.moddle.create('bpmn:FormalExpression', { body })
        } else {
        if (scriptType === 'inlineScript') {
            condition = bpmnInstances.moddle.create('bpmn:FormalExpression', { body, language })
            // flowConditionForm.value['resource'] = ''
            updateFormValue('resource', '', newFlowConditionForm)
        } else {
            // flowConditionForm.value['body'] = ''
            updateFormValue('body', '', newFlowConditionForm)
            condition = bpmnInstances.moddle.create('bpmn:FormalExpression', {
            resource,
            language
            })
        }
        }

        // console.log('condition =>', condition)

        // debugger

        bpmnInstances.modeling.updateProperties(bpmnInstances.bpmnElement, {
            conditionExpression: condition
        })
    }

    // 初始化
    const resetFlowCondition = () => {

        const initSetFlowConditionForm = (val) => {
            console.log('initVal =>', val)
            setFlowConditionForm(val)
            formRef.current.setFieldsValue({...val})
        }

        let resBpmnElementSourceRef = bpmnInstances.bpmnElement.businessObject.sourceRef
        // debugger
        setBpmnElementSourceRef(resBpmnElementSourceRef)
        // 初始化默认type为default
        initSetFlowConditionForm({ type: 'default' })

        if (
            resBpmnElementSourceRef &&
            resBpmnElementSourceRef.default &&
            resBpmnElementSourceRef.default.id === bpmnInstances.bpmnElement.id
        ) {
            initSetFlowConditionForm({ type: 'default' })
        } else if (!bpmnInstances.bpmnElement.businessObject.conditionExpression) {
            // 普通
            initSetFlowConditionForm({ type: 'normal' })
        } else {
            // 带条件
            const conditionExpression = bpmnInstances.bpmnElement.businessObject.conditionExpression

            let resFlowConditionForm = { ...conditionExpression, type: 'condition' }

            // resource 可直接标识 是否是外部资源脚本
            if (flowConditionForm.resource) {
                resFlowConditionForm = {
                    ...resFlowConditionForm,
                    conditionType: 'script',
                    scriptType: 'externalScript',
                }
                initSetFlowConditionForm(resFlowConditionForm)
                return
            }
            if (conditionExpression.language) {
                resFlowConditionForm = {
                    ...resFlowConditionForm,
                    conditionType: 'script',
                    scriptType: 'inlineScript',
                }
                initSetFlowConditionForm(resFlowConditionForm)
                return
            }
            
            resFlowConditionForm = {
                ...resFlowConditionForm,
                conditionType: 'expression',
            }

            initSetFlowConditionForm(resFlowConditionForm)
        }
    }

    useEffect(() => {
        if (businessObject != null && id != null) {
            resetFlowCondition()
        }
    }, [businessObject, id])

    const updateFormValue = (fieldName, value, newFormData) => {
        let res = {...flowConditionForm, [fieldName]: value}

        if (!!newFormData) {
            res = {...newFormData, [fieldName]: value}
        }

        console.log('表单设置值 =>', res)
        setFlowConditionForm(res)
    }

    return <>
        <div>
            <Form
                ref={formRef}
            >
                <Form.Item
                    label="流转类型"
                    name="type"
                >
                    <Select
                        value={flowConditionForm.type}
                        onChange={e => {
                            updateFormValue('type', e)
                            updateFlowType(e)
                        }}
                    >
                        <Select.Option value="normal">普通流转路径</Select.Option>
                        <Select.Option value="default">默认流转路径</Select.Option>
                        <Select.Option value="condition">条件流转路径</Select.Option>
                    </Select>
                </Form.Item>
                {
                    flowConditionForm.type === 'condition' && <Form.Item
                        label="条件格式"
                    >
                        <Select
                            value={flowConditionForm.conditionType}
                            onChange={e => {
                                updateFormValue('conditionType', e)
                            }}
                        >
                            <Select.Option value="expression">表达式</Select.Option>
                            <Select.Option value="script">脚本</Select.Option>
                        </Select>
                    </Form.Item>
                }

                {
                    flowConditionForm.conditionType && flowConditionForm.conditionType === 'expression' && <Form.Item
                        label="表达式"
                        name="body"
                    >
                        <Input
                            value={flowConditionForm.body}
                            onChange={(e) => {
                                updateFormValue('body', e.target.value)
                                updateFlowCondition('body', e.target.value)
                            }}
                        ></Input>
                    </Form.Item>
                }

                {
                    flowConditionForm.conditionType && flowConditionForm.conditionType === 'script' && <>
                        <Form.Item
                            label="脚本语言"
                            name="language"
                        >
                            <Input
                                value={flowConditionForm.language}
                                onChange={e => {
                                    updateFormValue('language', e.target.value)
                                    updateFlowCondition('language', e.target.value)
                                }}
                            ></Input>
                        </Form.Item>
                        <Form.Item
                            label="脚本类型"
                            name="scriptType"
                        >
                            <Select
                                value={flowConditionForm.scriptType}
                                onChange={val => {
                                    updateFormValue('scriptType', val)
                                }}
                            >
                                <Select.Option value="inlineScript">内联脚本</Select.Option>
                                <Select.Option value="externalScript">外部脚本</Select.Option>
                            </Select>
                        </Form.Item>
                        {
                            flowConditionForm.scriptType === 'inlineScript' && <Form.Item
                                name="body"
                                label='脚本'
                            >
                                <Input.TextArea
                                    value={flowConditionForm.body}
                                    onChange={e => {
                                        updateFormValue('body', e.target.value)
                                        updateFlowCondition('body', e.target.value)
                                    }}
                                ></Input.TextArea>
                            </Form.Item>
                        }
                        {
                            flowConditionForm.scriptType === 'externalScript' && <Form.Item
                                name="resource"
                                label="资源地址"
                            >
                                <Input
                                    value={flowConditionForm.resource}
                                    onChange={e => {
                                        updateFormValue('resource', e.target.value)
                                        updateFlowCondition('resource', e.target.value)
                                    }}
                                ></Input>
                            </Form.Item>
                        }
                    </>
                }
            </Form>
        </div>
    </>
}

export default FlowCondition