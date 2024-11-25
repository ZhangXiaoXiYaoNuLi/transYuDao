import { Form, Input } from 'antd'
import React, { useRef, useEffect, useState } from 'react'

const Base = (props) => {

    const {
        idEditDisabled,
        businessObject,
        type,
        // 流程模型数据
        model,
        setModel,
        bpmnInstances,
    } = props

    const formRef = useRef(null)

    const [needProps, setNeedProps] = useState({})

    const [elementBaseInfo, setElementBaseInfo] = useState({})
    
    useEffect(() => {
        if (!!businessObject) {
            resetBaseInfo()
        }
    }, [businessObject])

    // 表格初始回填
    useEffect(() => {
        if (type != null && businessObject != null && formRef.current != null) {
            const setData = {
                id: businessObject.id,
                name: businessObject.name,
            }
            formRef.current.setFieldsValue(setData)
            setNeedProps(setData)
        }
    }, [type, businessObject, formRef])

    const resetBaseInfo = () => {
        if (bpmnInstances == null) {
            return
        }
      
        setElementBaseInfo(businessObject)
        setNeedProps(needProps => {
            return {
                ...needProps,
                type: businessObject.$type
            }
        })
    }

    const handleKeyUpdate = (value) => {
        // 校验 value 的值，只有 XML NCName 通过的情况下，才进行赋值。否则，会导致流程图报错，无法绘制的问题
        if (!value) {
          return
        }
        if (!value.match(/[a-zA-Z_][\-_.0-9a-zA-Z$]*/)) {
        //   console.log('key 不满足 XML NCName 规则，所以不进行赋值')
          return
        }
        // console.log('key 满足 XML NCName 规则，所以进行赋值')
      
        // 在 BPMN 的 XML 中，流程标识 key，其实对应的是 id 节点
        setElementBaseInfo(elementBaseInfo => ({...elementBaseInfo, id: value}))

        setTimeout(() => {
          updateBaseInfo('id', value)
        }, 100)
    }

    const handleNameUpdate = (value) => {
        // console.log(elementBaseInfo, 'elementBaseInfo')
        if (!value) {
          return
        }
        setElementBaseInfo(elementBaseInfo => ({...elementBaseInfo, name: value}))
      
        setTimeout(() => {
          updateBaseInfo('name', value)
        }, 100)
    }

    const updateBaseInfo = (key, value) => {
        // console.log(key, 'key')

        const attrObj = Object.create(null)

        attrObj[key] = value

        let info = {
            ...elementBaseInfo,
            [key]: value,
        }

        setNeedProps({ ...info, ...needProps })

        if (key === 'id') {
            bpmnInstances.modeling.updateProperties(bpmnInstances.bpmnElement, {
                id: value,
                di: { id: `${value}_di` }
            })
        } else {
            // console.log(attrObj, 'attrObj')
            bpmnInstances.modeling.updateProperties(bpmnInstances.bpmnElement, attrObj)
        }
    }  

    return <>
        <Form
            ref={formRef}
        >
            {
                type === "Process" ? <>
                    <Form.Item
                        label="流程标识"
                        name='id'
                    >
                        <Input
                            onChange={e => {
                                handleKeyUpdate(e.target.value)
                                setNeedProps(needProps => ({...needProps, id: e.target.value}))
                            }}
                            value={needProps.id}
                        ></Input>
                    </Form.Item>
                    <Form.Item
                        label="流程名称"
                        name='name'
                    >
                        <Input
                            onChange={e => {
                                handleNameUpdate(e.target.value)
                                setNeedProps(needProps => ({...needProps, name: e.target.value}))
                            }}
                            value={needProps.name}
                        ></Input>
                    </Form.Item>
                </> : <>
                    <Form.Item
                        label="ID"
                        name='id'
                    >
                        <Input
                            onChange={e => {
                                handleKeyUpdate(e.target.value)
                                setNeedProps(needProps => ({...needProps, id: e.target.value}))
                            }}
                            value={needProps.id}
                        ></Input>
                    </Form.Item>
                    <Form.Item
                        label="名称"
                        name='name'
                    >
                        <Input
                            onChange={e => {
                                handleNameUpdate(e.target.value)
                                setNeedProps(needProps => ({...needProps, name: e.target.value}))
                            }}
                            value={needProps.name}
                        ></Input>
                    </Form.Item>
                </>
            }
            
        </Form>
    </>
}

export default Base
