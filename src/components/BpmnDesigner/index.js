import React, {useState, useEffect, useRef} from 'react'

// bpmn 绘制对象
import BpmnModeler from 'bpmn-js/lib/Modeler'
// 新建的时候的默认空 xml
import DefaultEmptyXML from './plugins/defaultEmpty'

// 翻译方法
import customTranslate from './plugins/translate/customTranslate'
import translationsCN from './plugins/translate/zh'

// 标签解析 Moddle
import camundaModdleDescriptor from './plugins/descriptor/camundaDescriptor.json'
import activitiModdleDescriptor from './plugins/descriptor/activitiDescriptor.json'
import flowableModdleDescriptor from './plugins/descriptor/flowableDescriptor.json'

// 标签解析 Extension
import camundaModdleExtension from './plugins/extension-moddle/camunda'
import activitiModdleExtension from './plugins/extension-moddle/activiti'
import flowableModdleExtension from './plugins/extension-moddle/flowable'

// 样式导入
import './theme/index.scss'
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'

// 自定义元素选中时的弹出菜单（修改 默认任务 为 用户任务）
import CustomContentPadProvider from './plugins/content-pad'
// 自定义左侧菜单（修改 默认任务 为 用户任务）
import CustomPaletteProvider from './plugins/palette'

// 属性配置侧边栏组件
import ProcessPenal from './components/ProcessPenal'

import { Button } from 'antd'

const BpmnDesigner = (props) => {

    const bpmnCanvas = useRef(null)

    // 绘制器实例
    const [bpmnModeler, setBpmnModeler] = useState(null)

    // 自定义左侧边栏
    const selfAdditionalModel = useRef([CustomContentPadProvider, CustomPaletteProvider])

    // 只实例化一次
    const [initFlag, setInitFlag] = useState(false)

    useEffect(() => {
        bpmnCanvas.current = document.getElementById('bpmnCanvas')
    }, [])

    // 挂载元素有了之后，创建绘制器实例
    useEffect(() => {
        if (bpmnCanvas.current != null && initFlag === false) {
            let dom = bpmnCanvas.current
            // 实例化 bpmn 绘制器实例
            setBpmnModeler(new BpmnModeler({
                container: dom,
                keyboard: props.keyboard ? { bindTo: document } : null,
                additionalModules: additionalModules(),
                moddleExtensions: moddleExtensions(),
            }))

            setInitFlag(true)
        }
    }, [bpmnCanvas.current, initFlag])

    // 实例化绘制器后，添加监听器
    useEffect(() => {
        if (bpmnModeler != null) {
            const EventBus = bpmnModeler.get('eventBus')
            console.log(EventBus, 'EventBus')
            // 监听图形改变返回xml
            EventBus.on('commandStack.changed', async (event) => {
                try {
                    recoverable.value = bpmnModeler.get('commandStack').canRedo()
                    revocable.value = bpmnModeler.get('commandStack').canUndo()
                    let { xml } = await bpmnModeler.saveXML({ format: true })
                    // 派发
                    props.onChange && props.onChange(xml)
                } catch (e) {
                    console.error(`[Process Designer Warn]: ${e.message || e}`)
                }
            })

            // 监听选中时间，重渲染属性配置栏
        }

        createNewDiagram()
    }, [bpmnModeler])

    // 绘制（创建）流程图
    const createNewDiagram = async (xml) => {
        console.log(xml, 'xml')
        // 将字符串转换成图显示出来
        let newId = props.processId || `Process_${new Date().getTime()}`
        let newName = props.processName || `业务流程_${new Date().getTime()}`
        let xmlString = xml || DefaultEmptyXML(newId, newName, props.prefix)
        try {
            let { warnings } = await bpmnModeler.importXML(xmlString)
            console.log(warnings, 'warnings')
            if (warnings && warnings.length) {
                warnings.forEach((warn) => console.warn(warn))
            }
        } catch (e) {
            console.error(`[Process Designer Warn]: ${e.message || e}`)
        }
    }

    const additionalModules = () => {
        console.log(props.additionalModel, 'additionalModel')
        const Modules = []
        // 仅保留用户自定义扩展模块
        if (props.onlyCustomizeAddi) {
          if (Object.prototype.toString.call(props.additionalModel) == '[object Array]') {
            return props.additionalModel || []
          }
          return [props.additionalModel]
        }
      
        // 插入用户自定义扩展模块
        if (Object.prototype.toString.call(props.additionalModel) == '[object Array]') {
          Modules.push(...(props.additionalModel))
        } else {
          props.additionalModel && Modules.push(props.additionalModel)
        }

        if (!!selfAdditionalModel.current) {
            // debugger
            Modules.push(...selfAdditionalModel.current)
        }
      
        // 翻译模块
        const TranslateModule = {
          translate: ['value', customTranslate(props.translations || translationsCN)]
        }
        Modules.push(TranslateModule)
      
        // 根据需要的流程类型设置扩展元素构建模块
        // if (this.prefix === "bpmn") {
        //   Modules.push(bpmnModdleExtension);
        // }
        console.log(props.prefix, 'props.prefix ')
        if (props.prefix === 'camunda') {
          Modules.push(camundaModdleExtension)
        }
        if (props.prefix === 'flowable') {
          Modules.push(flowableModdleExtension)
        }
        if (props.prefix === 'activiti') {
          Modules.push(activitiModdleExtension)
        }
      
        return Modules
    }

    const moddleExtensions = () => {
        console.log(props.onlyCustomizeModdle, 'props.onlyCustomizeModdle')
        console.log(props.moddleExtension, 'props.moddleExtension')
        console.log(props.prefix, 'props.prefix')
        const Extensions = {}
        // 仅使用用户自定义模块
        if (props.onlyCustomizeModdle) {
          return props.moddleExtension || null
        }
      
        // 插入用户自定义模块
        if (props.moddleExtension) {
          for (let key in props.moddleExtension) {
            Extensions[key] = props.moddleExtension[key]
          }
        }
      
        // 根据需要的 "流程类型" 设置 对应的解析文件
        if (props.prefix === 'activiti') {
          Extensions.activiti = activitiModdleDescriptor
        }
        if (props.prefix === 'flowable') {
          Extensions.flowable = flowableModdleDescriptor
        }
        if (props.prefix === 'camunda') {
          Extensions.camunda = camundaModdleDescriptor
        }
        return Extensions
    }

    // 保存模型
    const processSave = async () => {

        console.log('bpmnModeler =>', bpmnModeler)

        if (bpmnModeler == null) {
            return
        }

        const { err, xml } = await bpmnModeler.saveXML()
        // 读取异常时抛出异常
        if (err) {
            alert('保存模型失败，请重试！')
            return
        }
        props.save && props.save(xml)
    }
 
    return <div
        className="my-process-designer"
    >
        <div className="my-process-designer__container">
            <div
                id="bpmnCanvas"
                className="my-process-designer__canvas"
                style={{
                    width: '100%',
                    height: 'calc(100vh - 66px)',
                }}
            ></div>
        </div>

        {/* 顶部操作栏，目前仅包含模拟输出xml的 “保存模型” 按钮 */}
        <div 
            style={{
                position: 'absolute',
                bottom: '24px',
                left: '24px',
            }}
        >
            <Button
                type='primary'
                onClick={() => processSave()}
            >
                保存模型
            </Button>
        </div>

        {/* 侧边属性配置栏 */}
        <div
            className="process-panel"
        >
            <ProcessPenal
                bpmnModeler={bpmnModeler}
                prefix={props.prefix ? props.prefix : 'activiti'}
            ></ProcessPenal>
        </div>
    </div>
}

export default BpmnDesigner