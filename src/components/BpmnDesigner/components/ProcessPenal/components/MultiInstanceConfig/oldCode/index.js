// 多实例配置 会签配置
import React, { useRef, useEffect, useState } from 'react'

import {Form, Select, Button, InputNumber, Input } from 'antd'


const MultiInstanceConfig = (props) => {

    const {
        id,
        type,
        bpmnInstances,
        businessObject,
        prefix,
    } = props

    if (bpmnInstances == null || bpmnInstances.bpmnElement == null) {
        return null
    }

    const bpmnElement = bpmnInstances.bpmnElement

    // 默认配置，用来覆盖原始不存在的选项，避免报错
    const defaultLoopInstanceForm = useRef({
        completionCondition: '',
        loopCardinality: '',
        extensionElements: [],
        asyncAfter: false,
        asyncBefore: false,
        exclusive: false
    })

    const [multiLoopInstance, setMultiLoopInstance] = useState(null)
    const [loopCharacteristics, setLoopCharacteristics] = useState('')
    const [loopInstanceForm, setLoopInstanceForm] = useState({})

    const getElementLoop = (businessObject) => {
        if (!businessObject.loopCharacteristics) {
          setLoopCharacteristics('Null')
          setLoopInstanceForm({})
          return
        }
        if (businessObject.loopCharacteristics.$type === 'bpmn:StandardLoopCharacteristics') {
          setLoopCharacteristics('StandardLoop')
          setLoopInstanceForm({})
          return
        }
        if (businessObject.loopCharacteristics.isSequential) {
          setLoopCharacteristics('SequentialMultiInstance')
        } else {
          setLoopCharacteristics('ParallelMultiInstance')
        }
        // 合并配置
        setLoopInstanceForm({
            ...defaultLoopInstanceForm.current,
            ...businessObject.loopCharacteristics,
            completionCondition: businessObject.loopCharacteristics?.completionCondition?.body ?? '',
            loopCardinality: businessObject.loopCharacteristics?.loopCardinality?.body ?? ''
        })

        // 保留当前元素 businessObject 上的 loopCharacteristics 实例
        setMultiLoopInstance(bpmnInstances.bpmnElement.businessObject.loopCharacteristics)
        // 更新表单
        if (
          businessObject.loopCharacteristics.extensionElements &&
          businessObject.loopCharacteristics.extensionElements.values &&
          businessObject.loopCharacteristics.extensionElements.values.length
        ) {
            setLoopInstanceForm(loopInstanceForm => {
                return {
                    ...loopInstanceForm,
                    timeCycle: businessObject.loopCharacteristics.extensionElements.values[0].body,
                }
            })
        }
    }

    const changeLoopCharacteristicsType = (type) => {
        setLoopCharacteristics(type)
        // this.loopInstanceForm = { ...this.defaultLoopInstanceForm }; // 切换类型取消原表单配置
        // 取消多实例配置
        if (type === 'Null') {
          bpmnInstances.modeling.updateProperties(bpmnInstances.bpmnElement, {
            loopCharacteristics: null
          })
          return
        }
        // 配置循环
        if (type === 'StandardLoop') {
          const loopCharacteristicsObject = bpmnInstances.moddle.create(
            'bpmn:StandardLoopCharacteristics'
          )
          bpmnInstances.modeling.updateProperties(bpmnInstances.bpmnElement, {
            loopCharacteristics: loopCharacteristicsObject
          })
          setMultiLoopInstance(null)
          return
        }
        // 时序
        if (type === 'SequentialMultiInstance') {
          setMultiLoopInstance(bpmnInstances.moddle.create(
            'bpmn:MultiInstanceLoopCharacteristics',
            { isSequential: true }
          ))
        } else {
          setMultiLoopInstance(bpmnInstances.moddle.create(
            'bpmn:MultiInstanceLoopCharacteristics',
            { collection: '${coll_userList}' }
          ))
        }
        bpmnInstances.modeling.updateProperties(bpmnInstances.bpmnElement, {
          loopCharacteristics: multiLoopInstance
        })
    }

    // 循环基数
    const updateLoopCardinality = (cardinality) => {
        let loopCardinality = null
        if (cardinality && cardinality.length) {
            loopCardinality = bpmnInstances.moddle.create('bpmn:FormalExpression', {
                body: cardinality
            })
        }
        bpmnInstances.modeling.updateModdleProperties(
            bpmnInstances.bpmnElement,
            multiLoopInstance,
            {
                loopCardinality
            }
        )
    }

    // 完成条件
    const updateLoopCondition = (condition) => {
        let completionCondition = null
        if (condition && condition.length) {
            completionCondition = bpmnInstances.moddle.create('bpmn:FormalExpression', {
                body: condition
            })
        }
        bpmnInstances.modeling.updateModdleProperties(
            bpmnInstances.bpmnElement,
            {
                completionCondition
            }
        )
    }

    
    // 重试周期
    const updateLoopTimeCycle = (timeCycle) => {
        const extensionElements = bpmnInstances.moddle.create('bpmn:ExtensionElements', {
        values: [
            bpmnInstances.moddle.create(`${prefix}:FailedJobRetryTimeCycle`, {
                body: timeCycle
            })
        ]
        })
        bpmnInstances.modeling.updateModdleProperties(
            bpmnInstances.bpmnElement,
            multiLoopInstance,
            {
                extensionElements
            }
        )
    }

    // 直接更新的基础信息
    const updateLoopBase = () => {
        bpmnInstances().modeling.updateModdleProperties(
            bpmnInstances.bpmnElement,
            multiLoopInstance,
            {
                collection: loopInstanceForm.collection || null,
                elementVariable: loopInstanceForm.elementVariable || null
            }
        )
    }

    const changeConfig = (config) => {
        if (config === '依次审批') {
          changeLoopCharacteristicsType('SequentialMultiInstance')
          updateLoopCardinality('1')
          updateLoopCondition('${ nrOfCompletedInstances >= nrOfInstances }')
        } else if (config === '会签') {
          changeLoopCharacteristicsType('ParallelMultiInstance')
          updateLoopCondition('${ nrOfCompletedInstances >= nrOfInstances }')
        } else if (config === '或签') {
          changeLoopCharacteristicsType('ParallelMultiInstance')
          updateLoopCondition('${ nrOfCompletedInstances > 0 }')
        }
    }

    useEffect(() => {
        if (businessObject != null) {
            getElementLoop(businessObject)   
        }
    }, [businessObject])

    return <>
        <div>
            <Form>
                <Form.Item
                    label="快捷设置"
                >
                    <div style={{display: 'flex', justifyContent: 'space-between', paddingRight: '32px'}}>
                        <Button size='small' onClick={() => changeConfig('依次审批')}>依次审批</Button>
                        <Button size='small' onClick={() => changeConfig('会签')}>会签</Button>
                        <Button size='small' onClick={() => changeConfig('或签')}>或签</Button>
                    </div>
                </Form.Item>
                <Form.Item
                    label="会签类型"
                >
                    <Select 
                        value={loopCharacteristics}
                        onChange={changeLoopCharacteristicsType}
                    >
                        <Select.Option value="ParallelMultiInstance">并行多重事件</Select.Option>
                        <Select.Option value="SequentialMultiInstance">时序多重事件</Select.Option>
                        <Select.Option value={'Null'}>无</Select.Option>
                    </Select>
                </Form.Item>
                {
                    !!(loopCharacteristics === 'ParallelMultiInstance' ||
                    loopCharacteristics === 'SequentialMultiInstance') && <>
                        <Form.Item
                            label="循环数量"
                        >
                            <InputNumber
                                min={0}
                                step={1}
                                style={{flex: 1, width: '100%'}}
                                value={loopInstanceForm.loopCardinality}
                                onChange={(value) => {
                                    setLoopInstanceForm(loopInstanceForm => {
                                        return {
                                            ...loopInstanceForm,
                                            loopCardinality: value
                                        }
                                    })
                                    updateLoopCardinality(value)
                                }}
                            ></InputNumber>
                        </Form.Item>
                        <Form.Item
                            label="完成条件"
                        >
                            <Input.TextArea
                                value={loopInstanceForm.completionCondition}
                                onChange={e => {
                                    setLoopInstanceForm(loopInstanceForm => {
                                        return {
                                            ...loopInstanceForm,
                                            completionCondition: e.target.value
                                        }
                                    })
                                    updateLoopCondition(e.target.value)
                                }}
                            ></Input.TextArea>
                        </Form.Item>
                    </>
                }
            </Form>
        </div>
    </>
}

export default MultiInstanceConfig