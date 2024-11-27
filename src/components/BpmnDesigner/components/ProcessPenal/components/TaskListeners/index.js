// 任务监听器
import { Button, Divider, Form, Input, Modal, Popconfirm, Select, Table } from "antd";
import React, {useState, useEffect, useRef} from "react";

import ElementListenersListTable from './components/ElementListenersListTable'

import {
    PlusCircleOutlined
} from '@ant-design/icons'

// 类型选项映射
import {
    eventType,
    listenerType,
} from './base/content'

import styles from './styles.less'

import ListenerEditModal from './components/ListenerEditModal'

import FieldEditModal from './components/FieldEditModal'

import { createListenerObject, updateElementExtensions } from './utils'

import {
    initListenerForm,
    initListenerType,
    initListenerForm2
} from './utilSelf'

const TaskListeners = (props) => {

    const {
        id,
        type,
        bpmnInstances,
        businessObject,
        prefix,
    } = props

    // 监听器表单实例
    const listenerFormRef = useRef(null)

    // 监听器编辑组件实例
    const ListenerEditModalRef = useRef(null)

    // 字段表单实例
    const listenerFieldFormRef = useRef(null)

    // 字段编辑组件实例
    const FieldEditModalRef = useRef(null)

    // 已添加监听器表格数据
    const [elementListenersList, setElementListenersList] = useState([])

    // 已添加字段数据（当前编辑监听器的子字段数据）
    const [fieldsListOfListener, setFieldsListOfListener] = useState([])

    // 监听器编辑弹框显示
    const [listenerFormModelVisible, setListenerFormModelVisible] = useState(false)

    // 字段编辑弹框显示
    const [listenerFieldFormModelVisible, setListenerFieldFormModelVisible] = useState(false)

    // 节点其它属性的保存
    const [otherExtensionList, setOtherExtensionList] = useState([])

    // BPMN 规范的节点集合
    const [bpmnElementListeners, setBpmnElementListeners] = useState(null)

    // 监听器表单当前数据
    const [listenerForm, setListenerForm] = useState({})

    // 当前编辑的索引 index
    const [editingListenerIndex, setEditingListenerIndex] = useState(-1)

    // 注入字段的表单值
    const [listenerFieldForm, setListenerFieldForm] = useState({})

    // 当前编辑的字段 index 值
    const [editingListenerFieldIndex, setEditingListenerFieldIndex] = useState(-1)

    const resetListenersList = () => {
        console.log(
          bpmnInstances,
          'bpmnInstances'
        )

        setOtherExtensionList([])

        
        let resBpmnElementListeners = bpmnInstances.bpmnElement.businessObject?.extensionElements?.values.filter(
            (ex) => ex.$type === `${prefix}:TaskListener`
          ) ?? []

        setBpmnElementListeners(resBpmnElementListeners)

        let resElementListenersList = resBpmnElementListeners.map((listener) =>
          initListenerType(listener)
        )

        setElementListenersList(resElementListenersList)
    }

    useEffect(() => {
        if (id != null && businessObject != null) {
            resetListenersList()
        }
    }, [id, businessObject])

    // 点击编辑
    const openListenerForm = (listener, index) => {
        let resListenerForm

        // 获取编辑的索引 index
        let resEditingListenerIndex = null

        if (listener) {
          resListenerForm = initListenerForm(listener)
          resEditingListenerIndex = index
        } else {
          resListenerForm = {}
          resEditingListenerIndex = -1 // 标记为新增
        }
        setEditingListenerIndex(resEditingListenerIndex)

        // 监听器属性获取
        let resFieldsListOfListener = []
        if (listener && listener.fields) {
          resFieldsListOfListener = listener.fields.map((field) => ({
            ...field,
            fieldType: field.string ? 'string' : 'expression'
          }))
        } else {
          resFieldsListOfListener = []
          resListenerForm['fields'] = []
        }
        setFieldsListOfListener(resFieldsListOfListener)

        setListenerForm(resListenerForm)

        // 打开侧边栏
        setListenerFormModelVisible(true)

        console.log('回填表单 =>', resListenerForm)

        // 设置表单
        setTimeout(() => {
            listenerFormRef.current.setFieldsValue(resListenerForm)
            ListenerEditModalRef.current.setType(resListenerForm.listenerType ? resListenerForm.listenerType : null)
        }, 300)
    }

    // 点击删除，移除监听器
    const removeListener = (row, index) => {
        let copybpmnElementListeners = bpmnElementListeners.map(i => i)
        copybpmnElementListeners.splice(index, 1)
        setBpmnElementListeners(copybpmnElementListeners)

        let copyElementListenersList = elementListenersList.map(i => i)
        copyElementListenersList.splice(index, 1)
        setElementListenersList(copyElementListenersList)

        updateElementExtensions(
            bpmnInstances.bpmnElement,
            otherExtensionList.concat(copybpmnElementListeners),
            bpmnInstances,
        )
    }

    // 保存监听器
    const saveListenerConfig = async () => {

        listenerFormRef.current.validateFields().then(formData => {

            // 注入自定义字段数据
            formData.fields = [...fieldsListOfListener]

            setListenerForm(formData)

            console.log('formData =>', formData)

            const listenerObject = createListenerObject(formData, true, prefix, bpmnInstances)

            debugger

            let resBpmnElementListeners = [...bpmnElementListeners]
            let resElementListenersList = [...elementListenersList]
            if (editingListenerIndex.value === -1) {
                resBpmnElementListeners.push(listenerObject)
                resElementListenersList.push(formData)
            } else {
                resBpmnElementListeners.splice(editingListenerIndex.value, 1, listenerObject)
                resElementListenersList.splice(editingListenerIndex.value, 1, formData)
            }
            setBpmnElementListeners(resBpmnElementListeners)
            setElementListenersList(resElementListenersList)

            // 保存其他配置
            let resOtherExtensionList = bpmnInstances.bpmnElement.businessObject?.extensionElements?.values?.filter(
                (ex) => ex.$type !== `${prefix}:TaskListener`
            ) ?? []
            setOtherExtensionList(resOtherExtensionList)

            updateElementExtensions(
                bpmnInstances.bpmnElement,
                resOtherExtensionList.concat(resBpmnElementListeners),
                bpmnInstances
            )
            // 4. 隐藏侧边栏
            setListenerFormModelVisible(false)
            setListenerForm({})
        })
    }

    // 打开字段新增编辑弹框
    const openListenerFieldForm = (field, index) => {
        let resListenerFieldForm = field ? JSON.parse(JSON.stringify(field)) : {}
        
        setTimeout(() => {
            listenerFieldFormRef.current.setFieldsValue({
                ...resListenerFieldForm,
            })
            FieldEditModalRef.current.setFieldType(resListenerFieldForm.fieldType)
        }, 300)

        setEditingListenerFieldIndex(field ? index : -1)

        setListenerFieldFormModelVisible(true)
    }

    // 移除监听器字段
    const removeListenerField = (field, index) => {

        console.log('field =>', field)

        setFieldsListOfListener(data => {
            let copyData = data.map(i => i)
            copyData.splice(index, 1)
            return copyData
        })

        setListenerForm(data => {
            let copyData = data.map(i => i)
            copyData.splice(index, 1)
            return copyData
        })
    }

    // 点击弹框保存字段触发方法
    const saveListenerField = async () => {

        listenerFieldFormRef.current.validateFields().then(formData => {

            let resFieldsListOfListener = [...fieldsListOfListener]
            let resListenerForm = {...listenerForm}

            if (editingListenerFieldIndex === -1) {
                resFieldsListOfListener.push(formData)
                resListenerForm.fields.push(formData)
            } else {
                resFieldsListOfListener.splice(editingListenerFieldIndex, 1, formData)
                resListenerForm.fields.splice(editingListenerFieldIndex, 1, formData)
            }

            setFieldsListOfListener(resFieldsListOfListener)
            setListenerForm(resListenerForm)

            setListenerFieldForm(formData)

            setListenerFieldFormModelVisible(false)
        })
    }

    return <>
        {/* 已添加监听器表格 */}
        <ElementListenersListTable
            dataSource={elementListenersList}
            // 点击删除
            clickDel={removeListener}
            // 点击编辑
            clickEdit={openListenerForm}
        ></ElementListenersListTable>

        {/* 新增监听器按钮 */}
        <div className={styles.button_wrapper}>
            <Button
                style={{width: '300px'}}
                icon={<PlusCircleOutlined />}
                onClick={() => {
                    openListenerForm(null)
                }}
            >
                新增
            </Button>
        </div>

        {/* 监听器编辑弹框部分 */}
        {
            !!listenerFormModelVisible && <ListenerEditModal
                ref={ListenerEditModalRef}

                listenerFormRef={listenerFormRef}

                visible={listenerFormModelVisible}
                setVisible={setListenerFormModelVisible}
                // 监听器类型选项数据
                listenerTypeObject={listenerType}
                // 时间类型选项数据
                listenerEventTypeObject={eventType}
                // 打开字段新增编辑弹框
                openListenerFieldForm={openListenerFieldForm}
                // 移除字段
                removeListenerField={removeListenerField}
                // 配置字段已有数据,用于表格展示
                fieldsListOfListener={fieldsListOfListener}
                // 保存监听器
                saveListenerConfig={saveListenerConfig}
            ></ListenerEditModal>
        }
        

        {/* 字段编辑弹框部分 */}
        {
            !!listenerFieldFormModelVisible && <FieldEditModal
                ref={FieldEditModalRef}

                listenerFieldFormRef={listenerFieldFormRef}

                visible={listenerFieldFormModelVisible}
                setVisible={setListenerFieldFormModelVisible}

                // 点击弹框保存触发方法
                saveListenerField={saveListenerField}
            ></FieldEditModal>
        }
        
    </>
}

export default TaskListeners; 