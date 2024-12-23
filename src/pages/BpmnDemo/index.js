import React, { useRef } from 'react'

import BpmnDesigner from '../../components/BpmnDesigner'

import xml2js from "xml2js";

const BpmnDemo = (props) => {

    const value = useRef(null)



    const save = (xml) => {
        console.log('输出 xml =>', xml)

        // 写缓存，用于测试流程图回填
        localStorage.setItem('test_xml', xml)

        let parser = new xml2js.Parser();
        parser.parseString(xml, (err, res) => {
            if (res != null) {
                console.log("jsonRes =>", res);
                console.log("jsonObj =>", JSON.stringify(res));
            }
        });
    }

    return <div>
        <BpmnDesigner
            onChange={val => value.current = val}
            value={value.current}
            save={save}
            prefix={'activiti'}
        ></BpmnDesigner>
    </div>
}

export default BpmnDemo