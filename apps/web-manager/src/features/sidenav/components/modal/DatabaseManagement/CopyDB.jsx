import React, { useEffect, useState } from 'react';
import { Modal, Form, Button, Input, Row, Col, Checkbox } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { setBuffering } from '../../../../../shared/slice/globalSlice';
import {
  copyDBAPI,
  getDatabasesAPI,
  getDBSpaceAPI,
  getDBSSizeAPI,
} from '../../../../domain/database/databaseAPI';
import { setDatabases } from '../../../../domain/database/databaseSlice';
import styles from '../../../styles/Modal.module.css';
import { setCopyDB } from '../../../sideNavSlice';
import { getDatabaseFormat } from '../../../../../lib/treeFormat';

function bytesToMB(bytes) {
  if (bytes === 0) return 0;
  const mb = bytes / 1048576;
  return parseFloat(mb.toFixed(0));
}

export default function () {
  const { activeHost } = useSelector((state) => state.host);
  const { databases } = useSelector((state) => state.database);
  const { copyDB } = useSelector((state) => state.sidenav);
  const dispatch = useDispatch();
  const [dbSize, setDBSize] = useState('');
  const [dbSpace, setDBSpace] = useState({});
  const [dbPath, setDBPath] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [form] = Form.useForm();
  const [checkBoxFields, setCheckBoxFields] = useState({
    overwrite: false,
    move: false,
  });
  const handleOk = async () => {
    form.validateFields().then(async (values) => {
      const data = {
        srcdbname: copyDB.node.title,
        ...values,
        overwrite: checkBoxFields.overwrite ? 'y' : 'n',
        move: checkBoxFields.move ? 'y' : 'n',
        advanced: 'off',
      };
      dispatch(setBuffering(true));
      const response = await copyDBAPI(activeHost, data).catch(() => {
        dispatch(setBuffering(false));
      });

      if (response.success) {
        const resDatabase = await getDatabasesAPI(activeHost).finally(() => {
          dispatch(setBuffering(false));
        });
        if (resDatabase.success) {
          const newDatabases = resDatabase.result.map((item) => {
            const newDB = databases.find((db) => db.dbname === item.dbname);
            if (newDB) {
              return newDB;
            }
            return getDatabaseFormat(item);
          });
          dispatch(setDatabases(newDatabases));
          Modal.success({
            title: 'Success',
            content: `Job Copy Database - 
                        ${copyDB.node.title + '@' + copyDB.node.title} has been completed successfully`,
            okText: 'Close',
          });
        }

        handleClose();
      }
    });
  };
  const handleCheckBox = (e) => {
    const { name, checked } = e.target;
    setCheckBoxFields((prevState) => ({ ...prevState, [name]: checked }));
  };

  const getLoadingData = async () => {
    dispatch(setBuffering(true));
    const resDBSize = await getDBSSizeAPI(activeHost, { dbname: copyDB.node.title });
    const resDBSpace = await getDBSpaceAPI(activeHost, { dbname: copyDB.node.title });
    dispatch(setBuffering(false));
    if (resDBSize.success) {
      setDBSize(resDBSize.result.dbsize);
    }
    if (resDBSpace.success) {
      setDBSpace(resDBSpace.result);
      for (const spaceinfo of resDBSpace.result.spaceinfo) {
        if (spaceinfo.type === 'Active_log') {
          form.setFieldValue('source_logpath', spaceinfo.location);
          break;
        }
      }
    }
  };

  const setDestinationPath = (name, path) => {
    if (!isEdit) {
      const finalPath = `${path}/${name}`;
      form.setFieldsValue({
        destdbpath: finalPath,
        exvolpath: finalPath,
        logpath: finalPath,
      });
    }
  };

  const onChange = (e) => {
    if (e.target.name === 'destdbname') {
      setDestinationPath(e.target.value, dbPath);
    } else {
      setIsEdit(true);
    }
  };

  useEffect(() => {
    if (copyDB.open) {
      form.resetFields();
      form.setFieldValue('source_dbpath', copyDB.node.dbdir);
      const path = copyDB.node.dbdir.substring(0, copyDB.node.dbdir.lastIndexOf('/'));
      setDestinationPath('', path);
      setDBPath(path);
      getLoadingData();
    }
  }, [copyDB]);

  const handleClose = () => {
    dispatch(setCopyDB({ open: false }));
  };

  return (
    <Modal
      title="Copy DB"
      open={copyDB.open}
      footer={() => {
        return (
          <>
            <Button type="primary" onClick={handleOk} style={{ marginRight: 8 }}>
              Copy
            </Button>

            <Button
              type={'primary'}
              variant={'filled'}
              className={'button button__small'}
              onClick={() => handleClose()}
            >
              Close
            </Button>
          </>
        );
      }}
    >
      <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
        <Form form={form} layout="horizontal">
          <div className={styles.db__layout}>
            <div className={'border__text'}>Source Database</div>
            <Row gutter={[12, 6]}>
              <Col span={24}>
                <Form.Item name="source_dbpath" labelCol={{ span: 7 }} label="Database Path">
                  <Input readOnly />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="source_logpath" labelCol={{ span: 7 }} label="Log File Path">
                  <Input readOnly />
                </Form.Item>
              </Col>
            </Row>
          </div>
          <div className={styles.db__layout}>
            <div className={'border__text'}>Destination Database</div>
            <Row gutter={[12, 6]}>
              <Col span={24}>
                <Form.Item name="destdbname" labelCol={{ span: 7 }} label="Database Name">
                  <Input name="destdbname" onChange={onChange} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="destdbpath" labelCol={{ span: 7 }} label="Database Path">
                  <Input onChange={onChange} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="exvolpath" labelCol={{ span: 7 }} label="Extent Volume Path">
                  <Input onChange={onChange} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="logpath" labelCol={{ span: 7 }} label="Log File Path">
                  <Input onChange={onChange} />
                </Form.Item>
              </Col>
            </Row>
          </div>
          <Row>
            <Col span={12}>
              <div>Free Disk Space: {dbSpace.freespace}(MB)</div>
            </Col>
            <Col span={12}>
              <div>Database Size: {bytesToMB(dbSize)}(MB)</div>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Checkbox
                name="overwrite"
                checked={checkBoxFields.overwrite}
                onChange={handleCheckBox}
              >
                Replace an Existing Database
              </Checkbox>
              <br />
              <Checkbox name="move" checked={checkBoxFields.move} onChange={handleCheckBox}>
                Delete a Source Database
              </Checkbox>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  );
}
