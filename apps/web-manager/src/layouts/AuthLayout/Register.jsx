import React from "react";
import { Form, Input, Button, Card, message, Typography } from "antd";

import {Link, useNavigate} from "react-router-dom";
import {registerAPI} from "@/features/auth/authAPI.js";
import {useDispatch} from "react-redux";
import {setBuffering} from "@/shared/slice/globalSlice.js";


const { Title, Text } = Typography;

const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const onFinish = (values) => {
        dispatch(setBuffering(true));
        registerAPI(values).then(function (res) {
            navigate("/login", { replace: true });
        }).catch((error)=>{
            message.error(`Registration Failed! ${error.toString()}`);
        }).finally(()=>{
            dispatch(setBuffering(false));
        })
    };

    const onFinishFailed = (errorInfo) => {
        console.log("Failed:", errorInfo);
        message.error("Registration Failed!");
    };

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                background: "#f0f2f5",
            }}
        >
            <Card style={{ width: 420}}>
                <Title level={4} style={{ textAlign: "center" }}>
                    Register
                </Title>

                <Form
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    layout="vertical"
                >
                    <Form.Item
                        label="Username"
                        name="id"
                        rules={[{ required: true, message: "Please enter your username!" }]}
                    >
                        <Input placeholder="Enter your username" />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: "Please enter your password!" }]}
                    >
                        <Input.Password placeholder="Enter your password" />
                    </Form.Item>

                    <Form.Item
                        label="Confirm Password"
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: "Please confirm your password!" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("Passwords do not match!"));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Confirm your password" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Register
                        </Button>
                    </Form.Item>

                    <Text>
                        Already have an account?{" "}
                        <Link to={"/login"}  replace>
                            Login
                        </Link>
                    </Text>
                </Form>
            </Card>
        </div>
    );
};

export default Register;
