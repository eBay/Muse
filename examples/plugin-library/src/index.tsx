import React from 'react';
import ReactDOM from 'react-dom/client';
import plugin from 'js-plugin';
import * as charts from '@ant-design/charts';
import * as ext from './ext';
import * as CommonLineChart from './commonLineChart';

plugin.register({
  ...ext,
  name: 'plugin-library', // reserve the plugin name
});

const SayHello = ({ name }: { name: string }): JSX.Element => (
  <div>Hey {name}, say hello to TypeScript.</div>
);

export { charts, CommonLineChart, SayHello };
