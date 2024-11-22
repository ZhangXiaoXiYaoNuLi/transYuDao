import React, { useRef } from 'react'

import BpmnDesigner from '../../components/BpmnDesigner'

const BpmnDemo = (props) => {

    const value = useRef(null)

    const save = (xml) => {
        console.log('输出 xml =>', xml)
    }

    return <div>
        <BpmnDesigner
            onChange={val => value.current = val}
            value={value.current}
            save={save}
        ></BpmnDesigner>
    </div>
}

export default BpmnDemo