import React from 'react';
import _ from 'lodash'
import { DataSourcePluginOptionsEditorProps } from 'src/packages/datav-core';
import { PromOptions } from '../types';
import { Form, Row, Col, Input, Select } from 'antd'
const { Option } = Select;

export type Props = DataSourcePluginOptionsEditorProps<PromOptions>;
const defaultOptions:PromOptions = {
  queryTimeout: '60s',
  timeInterval: '15s',
  httpMethod: 'GET'
}

export const ConfigEditor = (props: Props) => {
  const { options } = props;
  
  return (
    <>
      <Form.Item>
        <Row>
          <Col span="14">
            <Form.Item
              label={<span>Query timeout</span>}
            >
              <Input
                placeholder="60s"
                defaultValue={options.jsonData.queryTimeout}
                onChange={(e) => { options.jsonData.queryTimeout = e.currentTarget.value }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>

      <Form.Item>
        <Row>
          <Col span="14">
            <Form.Item
              label={<span>Scrape interval</span>}
            >
              <Input
                placeholder="15s"
                defaultValue={options.jsonData.timeInterval}
                onChange={(e) => options.jsonData.timeInterval = e.currentTarget.value}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>

      <Form.Item>
        <Row>
          <Col span="14">
            <Form.Item
              label={<span>HTTP METHOD</span>}
            >
              <Select defaultValue={options.jsonData.httpMethod} onChange={(v) => {options.jsonData.httpMethod = v }}>
                <Option value="GET">GET</Option>
                <Option value="POST">POST</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>
    </>
  );
};
