import React, {createContext, useContext, useEffect, useRef, useState} from "react";
import {Form, Input, Select, Table} from "antd";
import {nanoid} from "nanoid";

const EditableContext = createContext(null);

const EditableRow = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    );
};


const InputType = ({property, ...props}) => {
    switch (props.type) {
        case "select":
            return <Select {...props}>
                {props.list.map(res=><Option key={nanoid(4)} value={res.toLowerCase()}>{res}</Option>)}
            </Select>
        case "number":
            return <Input {...props} />

        default:
            return <Input {...props}/>
    }
}

const EditableCell = (props) => {
    const {
        title,
        editable,
        children,
        dataIndex,
        record,
        handleSave,
        property,
        cellProps,
        ...restProps
    } = props;
    const form = useContext(EditableContext);
    const inputRef = useRef(null);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        if (editing) inputRef.current?.focus();
    }, [editing]);


    const toggleEdit = () => {
        setEditing(!editing);
        // let value = record[dataIndex]
        // if(record.property.type === "number") {
        //     value = parseSize(value)
        //     console.log(value)
        // }

        form.setFieldsValue({ [dataIndex]: record[dataIndex] });
    };

    const save = async () => {
        try {
            const values = await form.validateFields();
            toggleEdit();
            handleSave({ ...record, ...values });
        } catch (err) {
            console.error('Save failed:', err);
        }
    };



    let childNode = children;
    const isEmpty = !children || (typeof children[0] === 'string' && children[0].trim() === '');
    if(editable){
        childNode = editing ? (
            <Form.Item
                style={{ margin: 0 }}
                name={dataIndex}
            >
                <InputType property={record.property} ref={inputRef} {...cellProps} onPressEnter={save} onBlur={save} size="small" />

            </Form.Item>
        ) : (

            <div
                onClick={() => toggleEdit()}
                style={{ minHeight: 24, padding: 0, cursor: 'pointer' }}
            >
                {isEmpty ? <span style={{ opacity: 0.4 }}>Click to edit</span> : children}
            </div>
        );
    }
    return <td {...restProps}>{childNode}</td>;
};



export default function EditableTable({dataSource, columns, ...restProps}) {
    return <Table
        bordered
        pagination={false}
        dataSource={dataSource}
        columns={columns}
        components={{
            body: {
                row: EditableRow,
                cell: EditableCell,
            },
        }}
        {...restProps}
    />
}