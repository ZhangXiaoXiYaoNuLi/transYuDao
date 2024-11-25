// 配置选项数据，临时用于迁移
export const typeData = [
    {
        "dictType": "bpm_task_candidate_strategy",
        "value": "10",
        "label": "角色",
        "colorType": "info",
        "cssClass": ""
    },
    {
        "dictType": "bpm_task_candidate_strategy",
        "value": "20",
        "label": "部门的成员",
        "colorType": "primary",
        "cssClass": ""
    },
    {
        "dictType": "bpm_task_candidate_strategy",
        "value": "21",
        "label": "部门的负责人",
        "colorType": "primary",
        "cssClass": ""
    },
    {
        "dictType": "bpm_task_candidate_strategy",
        "value": "22",
        "label": "岗位",
        "colorType": "success",
        "cssClass": ""
    },
    {
        "dictType": "bpm_task_candidate_strategy",
        "value": "30",
        "label": "用户",
        "colorType": "info",
        "cssClass": ""
    },
    {
        "dictType": "bpm_task_candidate_strategy",
        "value": "35",
        "label": "发起人自选",
        "colorType": "",
        "cssClass": ""
    },
    {
        "dictType": "bpm_task_candidate_strategy",
        "value": "60",
        "label": "流程表达式",
        "colorType": "danger",
        "cssClass": ""
    }
]

// 角色选项
export const roles = [
    {
      "id": 101,
      "name": "测试账号",
      "code": "test",
      "sort": 0,
      "status": 0,
      "type": 2,
      "remark": "",
      "dataScope": 1,
      "dataScopeDeptIds": [],
      "createTime": 1609912175000
    },
    {
      "id": 1,
      "name": "超级管理员",
      "code": "super_admin",
      "sort": 1,
      "status": 0,
      "type": 1,
      "remark": "超级管理员",
      "dataScope": 1,
      "dataScopeDeptIds": null,
      "createTime": 1609837428000
    },
    {
      "id": 2,
      "name": "普通角色",
      "code": "common",
      "sort": 2,
      "status": 0,
      "type": 1,
      "remark": "普通角色",
      "dataScope": 2,
      "dataScopeDeptIds": null,
      "createTime": 1609837428000
    },
    {
      "id": 3,
      "name": "CRM 管理员",
      "code": "crm_admin",
      "sort": 2,
      "status": 0,
      "type": 1,
      "remark": "CRM 专属角色",
      "dataScope": 1,
      "dataScopeDeptIds": null,
      "createTime": 1708743073000
    },
    {
      "id": 153,
      "name": "某角色",
      "code": "tt",
      "sort": 4,
      "status": 0,
      "type": 2,
      "remark": "",
      "dataScope": 1,
      "dataScopeDeptIds": null,
      "createTime": 1723874975000
    }
]

// 部门树形数据
export const depts = [
    {
      "id": 100,
      "name": "芋道源码",
      "parentId": 0
    },
    {
      "id": 101,
      "name": "深圳总公司",
      "parentId": 100
    },
    {
      "id": 103,
      "name": "研发部门",
      "parentId": 101
    },
    {
      "id": 108,
      "name": "市场部门",
      "parentId": 102
    },
    {
      "id": 102,
      "name": "长沙分公司",
      "parentId": 100
    },
    {
      "id": 104,
      "name": "市场部门",
      "parentId": 101
    },
    {
      "id": 109,
      "name": "财务部门",
      "parentId": 102
    },
    {
      "id": 105,
      "name": "测试部门",
      "parentId": 101
    },
    {
      "id": 106,
      "name": "财务部门",
      "parentId": 101
    },
    {
      "id": 107,
      "name": "运维部门",
      "parentId": 101
    }
]

// 岗位数据
export const posts = [
    {
      "id": 1,
      "name": "董事长"
    },
    {
      "id": 2,
      "name": "项目经理"
    },
    {
      "id": 4,
      "name": "普通员工"
    },
    {
      "id": 5,
      "name": "人力资源"
    }
]

// 用户数据
export const users = [
    {
      "id": 1,
      "nickname": "芋道源码",
      "deptId": 103,
      "deptName": "研发部门"
    },
    {
      "id": 100,
      "nickname": "芋道",
      "deptId": 104,
      "deptName": "市场部门"
    },
    {
      "id": 103,
      "nickname": "源码",
      "deptId": 106,
      "deptName": "财务部门"
    },
    {
      "id": 104,
      "nickname": "测试号",
      "deptId": 107,
      "deptName": "运维部门"
    },
    {
      "id": 112,
      "nickname": "新对象",
      "deptId": 100,
      "deptName": "芋道源码"
    },
    {
      "id": 114,
      "nickname": "hr 小姐姐",
      "deptId": null,
      "deptName": null
    },
    {
      "id": 115,
      "nickname": "阿呆",
      "deptId": 102,
      "deptName": "长沙分公司"
    },
    {
      "id": 117,
      "nickname": "测试号02",
      "deptId": 100,
      "deptName": "芋道源码"
    },
    {
      "id": 118,
      "nickname": "狗蛋",
      "deptId": 103,
      "deptName": "研发部门"
    },
    {
      "id": 131,
      "nickname": "呵呵",
      "deptId": 100,
      "deptName": "芋道源码"
    },
    {
      "id": 139,
      "nickname": "小秃头",
      "deptId": null,
      "deptName": null
    }
]

export default {
    typeData,
    roles,
    depts,
    posts,
    users,
}