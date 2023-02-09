import { useCallback } from 'react';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import ReactECharts from 'echarts-for-react';
import { useMuseData } from '../../hooks';

export default function MyResponsiveBar({ plugin }) {
  const { data: releases, error, pending } = useMuseData(`muse.plugin-releases.${plugin.name}`);

  const getOption = useCallback(() => {
    const source = (
      releases?.map(r => ({ version: r.version, ...r.duration, ...r.info?.size })) || []
    )?.reverse();
    const options = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
        },
        formatter: params => {
          const { version, main } = params?.[0]?.data || {};
          const headerP = `<p style="display:flex;width:150px;align-items:center"><strong>v${version}:</strong><span style="margin-left:auto">${
            main || '--'
          } kB</span></p>`;
          const metrics = params
            ?.filter(item => item.seriesName !== 'main.js')
            ?.map(({ color, seriesName, value }) => {
              return `<p style="display:flex;width:150px;align-items:center">
              <span style="width: 10px; height: 10px; border-radius: 50%; background:${color};margin-right:3px"></span>
              <span>${seriesName}:</span><span style="margin-left:auto">${
                value[seriesName] ? (value[seriesName] / 1000)?.toFixed(1) : '--'
              } s</span></p>`;
            });
          return headerP + metrics.join('');
        },
      },
      legend: {},
      grid: {
        left: '3%',
        right: '4%',
        bottom: '4%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
        },
      ],
      yAxis: [
        {
          type: 'value',
          name: 'Release Duration (s)',
          axisLabel: {
            formatter: value => (value / 1000).toFixed(1),
          },
        },
        {
          type: 'value',
          name: 'Gzip Size (kB)',
          position: 'right',
          alignTicks: true,
          axisLabel: {
            formatter: '{value}',
          },
        },
      ],
      dataZoom: [
        {
          type: 'inside',
          startValue:
            source?.length >= 21 ? source?.[source.length - 21]?.version : source?.[0]?.version,
          endValue: source?.[source.length - 1]?.version,
        },
      ],
      series: [
        {
          name: 'installDeps',
          type: 'bar',
          stack: 'installDeps',
          yAxisIndex: 0,
        },
        {
          name: 'build',
          type: 'bar',
          stack: 'installDeps',
          yAxisIndex: 0,
        },
        {
          name: 'uploadAssets',
          type: 'bar',
          stack: 'installDeps',
          yAxisIndex: 0,
        },
        {
          name: 'main.js',
          type: 'line',
          emphasis: {
            focus: 'series',
          },
          yAxisIndex: 1,
        },
      ],
      dataset: {
        dimensions: ['version', 'installDeps', 'build', 'uploadAssets', 'main'],
        source: source,
      },
    };
    return options;
  }, [releases]);

  return (
    <>
      <RequestStatus loading={pending} error={error} loadingMode="skeleton" />
      {!pending && <ReactECharts option={getOption()} style={{ height: '300px', width: '100%' }} />}
    </>
  );
}
