// 已添加监听器展示表格
import React, { useRef, useEffect, useState } from 'react'

import { Popconfirm, Table } from 'antd'

import styles from '../../styles.less'

import {
    listenerType,
    eventType,
} from '../../base/content'

const ElementListenersListTable = (props) => {

    const {
        dataSource,
        // 点击删除
        clickDel,
        // 点击编辑
        clickEdit,
    } = props

    const getRender = (arr, val) => {
        let str = ''
        arr.forEach(i => {
            if (i.value === val) str = i.label 
        })
        return str
    }

    const columns= [
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
            render: (val) => {
                return getRender(eventType, val)
            }
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
            ellipsis: true,
            render: (val) => {
                return getRender(listenerType, val)
            }
        },
        {
            title: '操作',
            dataIndex: 'id',
            width: '92px',
            render: (val, row, index) => {
                return <div
                    style={{
                        display: 'flex',
                    }}
                >
                    <a onClick={() => clickEdit(row, index)}>编辑</a>
                    <Popconfirm
                        title="确认删除吗？"
                        onConfirm={() => {
                            clickDel(row, index)
                        }}
                    ><a>删除</a></Popconfirm>
                </div>
            }
        }
    ]

    return <div className={styles.table_wrapper}>
        <Table
            columns={columns}
            bordered
            pagination={false}
            dataSource={dataSource}
            size='small'
        ></Table>
    </div>
    
}

export default ElementListenersListTable
