import {Col,Radio, Select, Form} from "antd";
import React from "react";


const PeriodMonthly = ()=>{

    return (
        <Col span={24}>
            <Form.Item
                label="Period Detail: "
                name="Monthly"
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
            >
                <Radio.Group
                    options={Array.from({ length: 31 }, (_, i) => i + 1).map(i => ({value: `${i}`, label: i}))}
                />
            </Form.Item>
        </Col>

    )
}

export default PeriodMonthly;