// 任务监听器
import React, { useRef, useEffect, useState } from 'react'

import styles from './styles.less'

import EditModal from './components/EditModal'

import {
    Button,
    Table,
} from 'antd'

// 类型选项映射
import {
    eventType,
    listenerType,
} from './base/content'
import {
    PlusCircleOutlined
} from '@ant-design/icons'

const TaskListeners = (props) => {

    const {
        id,
        type,
        bpmnInstances,
        businessObject,
        prefix,
    } = props

    // 已添加数据
    const [elementListenersList, setElementListenersList] = useState([])

    // 事件类型选项数据
    const [listenerEventTypeObject, setListenerEventTypeObject] = useState(eventType)

    // 表达式类型选项数据
    const [listenerTypeObject, setListenerTypeObject] = useState(listenerType)

    // 编辑抽屉显示隐藏
    const [listenerFormModelVisible, setListenerFormModelVisible] = useState(false)

    // 已添加数据表格 columns
    const listenerColumns = [
        {
            title: '序号',
            dataIndex: 'id',
            width: '54px',
            align: 'center',
            render: (val, row, index) => {
                return index + 1;
            }
        },
        {
            title: '事件类型',
            dataIndex: 'event',
            width: '76px',
        },
        {
            title: '事件id',
            dataIndex: 'id',
            ellipsis: true,
        },
        {
            title: '监听器类型',
            dataIndex: 'listenerType',
            width: '92px',
        },
        {
            title: '操作',
            dataIndex: 'id',
            width: '86px',
            render: (val, row, index) => {
                return <div
                    style={{
                        display: 'flex',
                    }}
                >
                    <a>编辑</a>
                    <a>删除</a>
                </div>
            }
        }
    ]

    return <>
        <div className={styles.table_wrapper}>
            <Table
                columns={listenerColumns}
                dataSource={elementListenersList}
                bordered
                pagination={false}
                size='small'
            ></Table>
        </div>
        {/* 新增按钮（选择弹框暂时不做，没有配套页面） */}
        <div className={styles.button_wrapper}>
            <Button
                style={{width: '300px'}}
                icon={<PlusCircleOutlined />}
                onClick={() => {
                    setListenerFormModelVisible(true)
                }}
            >
                新增
            </Button>
        </div>

        {/* 新增编辑弹框 */}
        {
            !!listenerFormModelVisible && <EditModal
                visible={listenerFormModelVisible}
                setVisible={setListenerFormModelVisible}
                listenerEventTypeObject={listenerEventTypeObject}
                listenerTypeObject={listenerTypeObject}
                bpmnInstances={bpmnInstances}
                prefix={prefix}
            ></EditModal>
        }
    </>
}

export default TaskListeners