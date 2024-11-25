import React, { useRef, useEffect, useState } from 'react'

import axios from '@/utils/request'
import { Form, Select, Input, TreeSelect } from 'antd'

import {
    typeData,
    // 角色选项
    roles,
    // 部门
    depts,
    // 岗位
    posts,
    // 用户
    users,
} from './configData'

const TaskConfig = (props) => {

    const {
        bpmnInstances
    } = props

    const formRef = useRef(null)

    // 类型选项
    const [typeOptions, setTypeOptions] = useState(typeData)
    // 选中类型
    const [candidateStrategy, setCandidateStrategy] = useState(null)

    // 配置参数
    const [candidateParam, setCandidateParam] = useState([])

    // 角色选项
    const [roleOptions, setRoleOptions] = useState(roles)

    // 部门树形选项数据
    const [deptTreeOptions, setDeptTreeOptions] = useState(null)

    // 岗位选项
    const [postOptions, setPostOptions] = useState(posts)

    // 用户选项
    const [userOptions, setUserOptions] = useState(users)

    // 构造树形选项数据
    useEffect(() => {
        if (depts != null && depts.length != null) {
            const buildTree = (data) => {
                const map = new Map();
                data.forEach(item => {
                  map.set(item.id, item);
                });
                const root = [];
                data.forEach(item => {
                  if (item.parentId) {
                    if (!map.get(item.parentId).children) {
                      map.get(item.parentId).children = [];
                    }
                    map.get(item.parentId).children.push(item);
                  } else {
                    root.push(item);
                  }
                });
                return root;
            }

            let treeData = buildTree(depts.map(item => ({...item, value: item.id, title: item.name})))
            console.log('treeData =>', treeData)
            setDeptTreeOptions(treeData)
        }
    }, [depts])

    /** 选中某个 options 时候，更新 bpmn 图  */
    const updateElementTask = (pCandidateStrategy, pCandidateParam) => {
        bpmnInstances.modeling.updateProperties(bpmnInstances.bpmnElement, {
            candidateStrategy: pCandidateStrategy ? pCandidateStrategy : candidateStrategy,
            candidateParam: pCandidateParam ? pCandidateParam.join(',') : candidateParam.join(',')
        })
    }

    return <>
        <Form
            ref={formRef}
        >
            <Form.Item
                label="规则类型"
            >
                <Select
                    onChange={e => {
                        // 首先清空之前的配置参数
                        setCandidateParam(null)
                        console.log(e)
                        setCandidateStrategy(e)
                        // 触发视图更新
                        updateElementTask(e, [])
                    }}
                    value={candidateStrategy}
                >
                    {
                        !!typeOptions && typeOptions.map(item => {
                            return <Select.Option
                                value={item.value}
                            >{item.label}</Select.Option>
                        })
                    }
                </Select>
            </Form.Item>

            {/* 角色 */}
            {
                candidateStrategy === '10' && <Form.Item 
                    label="指定角色"
                >
                    <Select
                        mode="multiple"
                        options={roleOptions.map(item => ({value: item.id, label: item.name}))}
                        onChange={e => {
                            updateElementTask(null, e)
                        }}
                    ></Select>
                </Form.Item>
            }

            {/* 部门 、部门负责人 */}
            {
                (candidateStrategy === '20' || candidateStrategy === '21') && <Form.Item 
                    label="指定部门"
                >
                    <TreeSelect
                        treeData={deptTreeOptions} 
                        treeCheckable={true}
                        showCheckedStrategy={TreeSelect.SHOW_CHILD}
                        onChange={e => {
                            updateElementTask(null, e)
                        }}
                    ></TreeSelect>
                </Form.Item>
            }

            {/* 岗位 */}
            {
                (candidateStrategy === '22') && <Form.Item 
                    label="指定岗位"
                >
                    <Select 
                        mode="multiple"
                        options={postOptions.map(item => ({value: item.id, label: item.name}))}
                        onChange={e => {
                            updateElementTask(null, e)
                        }}
                    ></Select>
                </Form.Item>
            }

            {/* 用户 */}
            {
                (candidateStrategy === '30') && <Form.Item 
                    label="指定用户"
                >
                    <Select 
                        mode="multiple"
                        options={userOptions.map(item => ({value: item.id, label: item.nickname}))}
                        onChange={e => {
                            updateElementTask(null, e)
                        }}
                    ></Select>
                </Form.Item>
            }


            {/* 流程表达式 */}
            {
                (candidateStrategy === '60') && <Form.Item>
                    <Input.TextArea 
                        style={{minHeight: '90px'}} 
                        placeholder="请输入表达式"
                        onChange={e => {
                            updateElementTask(null, [e])
                        }}
                    ></Input.TextArea>
                </Form.Item>
            }
        </Form>
    </>
}

export default TaskConfig