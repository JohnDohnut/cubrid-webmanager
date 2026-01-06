import {Col, DatePicker, Form} from "antd";
import React from "react";
import dayjs from "dayjs";


const PeriodSpecific = () => {
    return (
        <Col span={24}>
            <Form.Item
                label="Period Detail:"
                name="Specific"
            >
                <DatePicker
                    style={{ width: "100%" }} />
            </Form.Item>
        </Col>
    );
};

export default PeriodSpecific;