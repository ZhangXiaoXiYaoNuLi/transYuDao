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

    // 默认配置，用来覆盖原始不存在的选项，避免报错
    const defaultLoopInstanceForm = useRef({
        completionCondition: '',
        loopCardinality: '',
        extensionElements: [],
        asyncAfter: false,
        asyncBefore: false,
        exclusive: false
    })

    // 会签类型
    const [loopCharacteristics, setLoopCharacteristics] = useState('')

    // 循环相关配置对象
    const [loopInstanceForm, setLoopInstanceForm] = useState({})

    // const [multiLoopInstance, setMultiLoopInstance] = useState(null)
    const multiLoopInstance = useRef(null)

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

        let resMultiLoopInstance
        
        // 配置循环
        if (type === 'StandardLoop') {
          const loopCharacteristicsObject = bpmnInstances.moddle.create(
            'bpmn:StandardLoopCharacteristics'
          )
          bpmnInstances.modeling.updateProperties(bpmnInstances.bpmnElement, {
            loopCharacteristics: loopCharacteristicsObject
          })
          resMultiLoopInstance = null
          multiLoopInstance.current = resMultiLoopInstance
          return
        }
        // 时序
        if (type === 'SequentialMultiInstance') {
            resMultiLoopInstance = bpmnInstances.moddle.create(
                'bpmn:MultiInstanceLoopCharacteristics',
                { isSequential: true }
            )
            multiLoopInstance.current = resMultiLoopInstance
        } else {
            resMultiLoopInstance = bpmnInstances.moddle.create(
                'bpmn:MultiInstanceLoopCharacteristics',
                { collection: '${coll_userList}' }
            )
            multiLoopInstance.current = resMultiLoopInstance
        }
        bpmnInstances.modeling.updateProperties(bpmnInstances.bpmnElement, {
          loopCharacteristics: resMultiLoopInstance,
        })
    }

    // 循环基数
    const updateLoopCardinality = (cardinality) => {
        setLoopInstanceForm(loopInstanceForm => {
            return {
                ...loopInstanceForm,
                loopCardinality: cardinality,
            }
        })

        let loopCardinality = null
        if (cardinality && cardinality.length) {
            loopCardinality = bpmnInstances.moddle.create('bpmn:FormalExpression', {
                body: cardinality
            })
        }
        bpmnInstances.modeling.updateModdleProperties(
            bpmnInstances.bpmnElement,
            multiLoopInstance.current,
            {
                loopCardinality
            }
        )
    }

    // 完成条件
    const updateLoopCondition = (condition) => {

        setLoopInstanceForm(loopInstanceForm => {
            return {
                ...loopInstanceForm,
                completionCondition: condition,
            }
        })

        let completionCondition = null
        if (condition && condition.length) {
            completionCondition = bpmnInstances.moddle.create('bpmn:FormalExpression', {
                body: condition
            })
        }
        bpmnInstances.modeling.updateModdleProperties(
            bpmnInstances.bpmnElement,
            multiLoopInstance.current,
            {
                completionCondition
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
          updateLoopCardinality('')
          updateLoopCondition('${ nrOfCompletedInstances >= nrOfInstances }')
        } else if (config === '或签') {
          changeLoopCharacteristicsType('ParallelMultiInstance')
          updateLoopCardinality('')
          updateLoopCondition('${ nrOfCompletedInstances > 0 }')
        }
    }

    const getElementLoop = (businessObject) => {
        if (!businessObject.loopCharacteristics) {
            //   loopCharacteristics.value = 'Null'
            setLoopCharacteristics('Null')
            //   loopInstanceForm.value = {}
            setLoopInstanceForm({})
            return
        }

        if (businessObject.loopCharacteristics.$type === 'bpmn:StandardLoopCharacteristics') {
            // loopCharacteristics.value = 'StandardLoop'
            setLoopCharacteristics('StandardLoop')
            // loopInstanceForm.value = {}
            setLoopInstanceForm({})
            return
        }

        if (businessObject.loopCharacteristics.isSequential) {
            // loopCharacteristics.value = 'SequentialMultiInstance'
            setLoopCharacteristics('SequentialMultiInstance')
        } else {
            // loopCharacteristics.value = 'ParallelMultiInstance'
            setLoopCharacteristics('ParallelMultiInstance')
        }

        // 合并配置
        setLoopInstanceForm({
            ...defaultLoopInstanceForm.value,
            ...businessObject.loopCharacteristics,
            completionCondition: businessObject.loopCharacteristics?.completionCondition?.body ?? '',
            loopCardinality: businessObject.loopCharacteristics?.loopCardinality?.body ?? ''
        })

        // 保留当前元素 businessObject 上的 loopCharacteristics 实例
        multiLoopInstance.current = bpmnInstances.bpmnElement.businessObject.loopCharacteristics
    }

    // 切换节点，初始回填
    useEffect(() => {
        if (businessObject != null && id != null) {
            getElementLoop(businessObject)
        }
    }, [businessObject, id])


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
                        onChange={(value) => {
                            changeLoopCharacteristicsType(value)
                        }}
                    >
                        <Select.Option value="ParallelMultiInstance">并行多重事件</Select.Option>
                        <Select.Option value="SequentialMultiInstance">时序多重事件</Select.Option>
                        <Select.Option value={'Null'}>无</Select.Option>
                    </Select>
                </Form.Item>
                {
                    (loopCharacteristics === 'ParallelMultiInstance' ||
                        loopCharacteristics === 'SequentialMultiInstance') && <>
                            <Form.Item
                                label="循环数量"
                            >
                                <InputNumber
                                    min={0}
                                    step={1}
                                    style={{flex: 1, width: '100%'}}
                                    value={loopInstanceForm.loopCardinality}
                                    onChange={(e) => {
                                        let val = `${e}`
                                        console.log('e =>', val)

                                        updateLoopCardinality(val)
                                    }}
                                ></InputNumber>
                            </Form.Item>
                            <Form.Item
                                label="完成条件"
                            >
                                <Input.TextArea
                                    value={loopInstanceForm.completionCondition}
                                    onChange={e => {
                                        console.log(e.target.value)
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