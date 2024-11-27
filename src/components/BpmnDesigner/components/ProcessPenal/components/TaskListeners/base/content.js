export const eventType = [
    {
        label: '创建',
        value: 'create',
    },
    {
        label: '指派',
        value: 'assignment',
    },
    {
        label: '完成',
        value: 'complete',
    },
    {value: 'delete', label: '删除'},
    {value: 'update', label: '更新'},
    {value: 'timeout', label: '超时'},
]

export const listenerType = [
    {value: 'classListener', label: 'Java 类'},
    {value: 'expressionListener', label: '表达式'},
    {value: 'delegateExpressionListener', label: '代理表达式'},
    {value: 'scriptListener', label: '脚本'},
]

export default {
    eventType,
    listenerType,
}