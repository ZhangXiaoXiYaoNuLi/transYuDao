// 属性编辑侧边栏
import React, { useRef, useEffect, useState } from 'react'

import { Collapse } from 'antd';

const { Panel } = Collapse

// 基础属性配置
import Base from './components/Base'
// 流程表单配置
import FormConfig from './components/FormConfig'
// 审核人配置
import TaskConfig from './components/TaskConfig';
// 会签配置
import MultiInstanceConfig from './components/MultiInstanceConfig'
// 执行监听器
import Listeners from './components/Listeners'
// 任务监听器
import TaskListeners from './components/TaskListeners'


const ProcessPenal = (props) => {

    const {
        bpmnModeler,
        prefix,
    } = props

    const [activeTab, setActiveTab] = useState(["base"]);
    const [elementId, setElementId] = useState("");
    const [elementType, setElementType] = useState("");
    // 元素 businessObject 镜像，提供给需要做判断的组件使用
    const [elementBusinessObject, setElementBusinessObject] = useState({});
    // 流转条件设置
    const [conditionFormVisible, setConditionFormVisible] = useState(false);
    // 表单配置展示隐藏
    const [formVisible, setFormVisible] = useState(false);
    // 当前选中 bpmn 元素
    const [bpmnElement, setBpmnElement] = useState(null);

    // 构建的bpmn描述对象
    const bpmnInstances = useRef(null);

    // 流程模型数据
    const [model, setModel] = useState({})

    // 是否可编辑
    const [idEditDisabled, setIdEditDisabled] = useState(false)

    useEffect(() => {
        setActiveTab(["base"]);
    }, [elementId]);

    useEffect(() => {
        if (bpmnModeler != null) {
            bpmnInstances.current = {
                modeler: bpmnModeler,
                modeling: bpmnModeler.get("modeling"),
                moddle: bpmnModeler.get("moddle"),
                eventBus: bpmnModeler.get("eventBus"),
                bpmnFactory: bpmnModeler.get("bpmnFactory"),
                elementFactory: bpmnModeler.get("elementFactory"),
                elementRegistry: bpmnModeler.get("elementRegistry"),
                replace: bpmnModeler.get("replace"),
                selection: bpmnModeler.get("selection"),
            };

            // console.log('bpmnInstances =>', bpmnInstances)

            getActiveElement();
        }
    }, [bpmnModeler]);
    
    const getActiveElement = () => {
        // 初始第一个选中元素 bpmn:Process
        initFormOnChanged(null);
        bpmnModeler.on("import.done", (e) => {
            //   console.log(e, 'eeeee')
            initFormOnChanged(null);
        });
        // 监听选择事件，修改当前激活的元素以及表单
        bpmnModeler.on("selection.changed", ({ newSelection }) => {
            initFormOnChanged(newSelection[0] || null);
        });
        bpmnModeler.on("element.changed", ({ element }) => {
            // 保证 修改 "默认流转路径" 类似需要修改多个元素的事件发生的时候，更新表单的元素与原选中元素不一致。
            if (element && element.id === elementId.value) {
                initFormOnChanged(element);
            }
        });
    };

    // 初始化数据
    const initFormOnChanged = (element) => {
        let activatedElement = element;
        if (!activatedElement) {
            activatedElement =
                bpmnInstances.current.elementRegistry.find(
                    (el) => el.type === "bpmn:Process"
                ) ??
                bpmnInstances.current.elementRegistry.find(
                    (el) => el.type === "bpmn:Collaboration"
                );
        }
        if (!activatedElement) return;

        bpmnInstances.current.bpmnElement = activatedElement;
        // bpmnElement.value = activatedElement
        setBpmnElement(activatedElement);
        // elementId.value = activatedElement.id
        setElementId(activatedElement.id);
        // elementType.value = activatedElement.type.split(':')[1] || ''
        setElementType(activatedElement.type.split(":")[1] || "");
        // elementBusinessObject.value = JSON.parse(JSON.stringify(activatedElement.businessObject))
        setElementBusinessObject(
            JSON.parse(JSON.stringify(activatedElement.businessObject))
        );

        setConditionFormVisible(
            !!(
                elementType === "SequenceFlow" &&
                activatedElement.source &&
                activatedElement.source.type.indexOf("StartEvent") === -1
            )
        );
    };

    // useEffect(() => {
    //     console.log('elementType =>', elementType)
    // }, [elementType])

    return <div>
        <Collapse
            activeKey={activeTab}
            onChange={val => {
                setActiveTab(val)
            }}
            accordion={true}
        >
            {/* 节点id 和 名称 设置 */}
            <Panel
                key="base"
                header="常规"
            >
                <Base
                    businessObject={elementBusinessObject}
                    type={elementType}
                    elementId={elementId}
                    bpmnInstances={bpmnInstances.current}
                ></Base>
            </Panel>

            {/* 开始节点，审核节点 表单页面配置 */}
            {
                !!(elementType === "UserTask" || elementType === "StartEvent") && <Panel
                    key="formConfig"
                    header="表单配置"
                >
                    <FormConfig
                        id={elementId}
                        type={elementType}
                        bpmnInstances={bpmnInstances.current}
                        businessObject={elementBusinessObject}
                        prefix={prefix}
                    ></FormConfig>
                </Panel>
            }

            {/* 审批人配置 */}
            {
                !!(elementType.indexOf('Task') !== -1) && <Panel
                    key="taskConfig"
                    header="任务（审批人）"
                >
                    <TaskConfig
                        id={elementId}
                        type={elementType}
                        bpmnInstances={bpmnInstances.current}
                        businessObject={elementBusinessObject}
                        prefix={prefix}
                    ></TaskConfig>
                </Panel>
            }

            {/* 多实例，会签配置 */}
            {
                !!(elementType.indexOf('Task') !== -1) && <Panel
                    key="multiInstanceConfig"
                    header="多实例（会签配置）"
                >
                    <MultiInstanceConfig
                        id={elementId}
                        type={elementType}
                        bpmnInstances={bpmnInstances.current}
                        businessObject={elementBusinessObject}
                        prefix={prefix}
                    ></MultiInstanceConfig>
                </Panel> 
            }

            {/* 执行监听器 */}
            <Panel
                key="listeners"
                header="执行监听器"
            >
                <Listeners
                    id={elementId}
                    type={elementType}
                    bpmnInstances={bpmnInstances.current}
                    businessObject={elementBusinessObject}
                    prefix={prefix}
                ></Listeners>
            </Panel>

            {/* 任务监听器 */}
            {
                elementType === 'UserTask' && <Panel
                    key="taskListeners"
                    header="任务监听器"
                >
                    <TaskListeners
                        id={elementId}
                        type={elementType}
                        bpmnInstances={bpmnInstances.current}
                        businessObject={elementBusinessObject}
                        prefix={prefix}
                    ></TaskListeners>
                </Panel>
            }
            
        </Collapse>
    </div>
}

export default ProcessPenal