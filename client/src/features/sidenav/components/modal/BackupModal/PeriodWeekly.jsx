import {Col, Row, Checkbox, Form} from "antd";
import React from "react";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const PeriodWeekly = ()=>{
    return (
        <Col span={24}>
            <Form.Item
                label="Period Detail: "
                name="Weekly"
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
            >
                <Checkbox.Group style={{ width: "100%" }}>
                    <Row>
                        {days.map(day => (
                            <Col span={6} key={day}>
                                <Checkbox value={day}>{day}</Checkbox>
                            </Col>
                        ))}
                    </Row>
                </Checkbox.Group>
            </Form.Item>
        </Col>
    );
}

export default PeriodWeekly;