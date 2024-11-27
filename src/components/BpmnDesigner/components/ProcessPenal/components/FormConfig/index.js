import React, { useRef, useEffect, useState } from 'react'

// import axios from '@/utils/request'

import { Form, Select } from 'antd'

import {mockData} from './mockData'

const FormConfig = (props) => {

    const {
        id,
        bpmnInstances,
        businessObject,
        prefix,
    } = props

    const formRef = useRef(null)

    // 获取表单选项列表
    const [formOptions, setFormOptions] = useState(null)

    useEffect(() => {
        // axios({
        //     url: '/admin-api/bpm/form/simple-list',
        // }).then(response => {
        //     console.log('response =>', response)
        //     let data = response.data.data
        //     if (data != null && !!data.length) {
        //         setFormOptions(data.map(item => {
        //             return {
        //                 label: item.name,
        //                 value: item.id,
        //             }
        //         }))
        //     }
        // })

        setFormOptions(mockData.map(item => ({label: item.name, value: item.id})))
    }, [])

    // 初始回填
    useEffect(() => {
        if (formRef != null && formRef.current != null && id != null) {
            console.log('businessObject', businessObject)
        }
    }, [formRef, id])

    const updateElementFormKey = (value) => {
        if (bpmnInstances == null || bpmnInstances.bpmnElement == null) {
            return
        }
        bpmnInstances.modeling.updateProperties(bpmnInstances.bpmnElement, {
            formKey: value
        })
    }

    useEffect(() => {
        if (!!id && businessObject != null) {
            resetFormList()
        }
    }, [id, businessObject])

    const updateElementExtensions = (newElExtensionElements) => {
        // 更新到元素上
        bpmnInstances.modeling.updateProperties(bpmnInstances.bpmnElement, {
            extensionElements: newElExtensionElements
        })
      }

    const resetFormList = () => {
        let formKey = businessObject.formKey
        if (formKey?.length > 0) {
            formKey = parseInt(formKey.value)
        }
        // 获取元素扩展属性 或者 创建扩展属性
        let elExtensionElements =
            bpmnInstances.bpmnElement.businessObject.get('extensionElements') ||
          bpmnInstances.moddle.create('bpmn:ExtensionElements', { values: [] })

        console.log('elExtensionElements =>', elExtensionElements)
      
        // 更新元素扩展属性，避免后续报错
        updateElementExtensions(elExtensionElements)

        // 更新表单，切换节点的时候，回填
        formRef.current.setFieldsValue({
            pageKey: formKey,
        })
    }

    return <>
        <Form ref={formRef}>
            <Form.Item
                label="流程表单"
                name="pageKey"
            >
                <Select
                    onChange={(e) => {
                        console.log(e)
                        updateElementFormKey(e)
                    }}
                >
                    {
                        formOptions != null && !!formOptions.length && formOptions.map(item => {
                            return <Select.Option
                                value={item.value}
                            >{item.label}</Select.Option>
                        })
                    }
                </Select>
            </Form.Item>
        </Form>
    </>
}

export default FormConfig