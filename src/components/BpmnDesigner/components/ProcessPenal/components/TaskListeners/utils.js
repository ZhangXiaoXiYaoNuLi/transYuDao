export const createListenerObject = (options, isTask, prefix, bpmnInstances) => {
    const listenerObj = Object.create(null)
    listenerObj.event = options.event
    isTask && (listenerObj.id = options.id) // 任务监听器特有的 id 字段
    switch (options.listenerType) {
      case 'scriptListener':
        listenerObj.script = createScriptObject(options, prefix, bpmnInstances)
        break
      case 'expressionListener':
        listenerObj.expression = options.expression
        break
      case 'delegateExpressionListener':
        listenerObj.delegateExpression = options.delegateExpression
        break
      default:
        listenerObj.class = options.class
    }
    // 注入字段
    if (options.fields) {
      listenerObj.fields = options.fields.map((field) => {
        return createFieldObject(field, prefix, bpmnInstances)
      })
    }
    // 任务监听器的 定时器 设置
    if (isTask && options.event === 'timeout' && !!options.eventDefinitionType) {
      const timeDefinition = bpmnInstances.moddle.create('bpmn:FormalExpression', {
        body: options.eventTimeDefinitions
      })
      const TimerEventDefinition = bpmnInstances.moddle.create('bpmn:TimerEventDefinition', {
        id: `TimerEventDefinition_${uuid(8)}`,
        [`time${options.eventDefinitionType.replace(/^\S/, (s) => s.toUpperCase())}`]: timeDefinition
      })
      listenerObj.eventDefinitions = [TimerEventDefinition]
    }

    console.log('listenerObj', listenerObj)
    debugger

    return bpmnInstances.moddle.create(
      `${prefix}:${isTask ? 'TaskListener' : 'ExecutionListener'}`,
      listenerObj
    )
  }

  // 创建脚本实例
export const createScriptObject = (options, prefix, bpmnInstances) => {
    const { scriptType, scriptFormat, value, resource } = options
    const scriptConfig =
      scriptType === 'inlineScript' ? { scriptFormat, value } : { scriptFormat, resource }
    return bpmnInstances.moddle.create(`${prefix}:Script`, scriptConfig)
}

// 创建 监听器的注入字段 实例
export function createFieldObject(option, prefix, bpmnInstances) {
    const { name, fieldType, string, expression } = option
    const fieldConfig = fieldType === 'string' ? { name, string } : { name, expression }
    return bpmnInstances.moddle.create(`${prefix}:Field`, fieldConfig)
}
  
// 更新元素扩展属性
export const updateElementExtensions = (element, extensionList, bpmnInstances) => {
  const extensions = bpmnInstances.moddle.create('bpmn:ExtensionElements', {
    values: extensionList
  })
  bpmnInstances.modeling.updateProperties(bpmnInstances.bpmnElement, {
    extensionElements: extensions
  })
}
 
export default {
    createListenerObject,
    updateElementExtensions,
}