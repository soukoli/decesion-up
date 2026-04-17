'use client';

import dynamic from 'next/dynamic';
import { StockIndex } from '@/types';
import { ApexOptions } from 'apexcharts';

// ApexCharts must be loaded dynamically (no SSR) because it uses window
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface StockChartProps {
  stock: StockIndex;
  height?: number;
}

export function StockChart({ stock, height = 120 }: StockChartProps) {
  const isPositive = stock.change >= 0;
  const chartColor = isPositive ? '#22c55e' : '#ef4444';
  
  const series = [{
    name: stock.name,
    data: stock.historicalData.map(point => ({
      x: point.timestamp,
      y: point.close,
    })),
  }];

  const options: ApexOptions = {
    chart: {
      type: 'area',
      sparkline: {
        enabled: true,
      },
    animations: {
      enabled: true,
      speed: 800,
    },
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 100],
      },
    },
    colors: [chartColor],
    tooltip: {
      enabled: true,
      theme: 'dark',
      x: {
        format: 'dd MMM HH:mm',
      },
      y: {
        formatter: (val: number) => val.toLocaleString('en-US', { 
          style: 'currency', 
          currency: 'USD',
          minimumFractionDigits: 2,
        }),
      },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        show: false,
      },
    },
    yaxis: {
      show: false,
      min: Math.min(...stock.historicalData.map(p => p.low)) * 0.998,
      max: Math.max(...stock.historicalData.map(p => p.high)) * 1.002,
    },
    grid: {
      show: false,
      padding: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
    },
  };

  if (stock.historicalData.length === 0) {
    return (
      <div 
        className="flex items-center justify-center text-slate-500 text-xs"
        style={{ height }}
      >
        No data available
      </div>
    );
  }

  return (
    <div className="w-full">
      <Chart 
        options={options} 
        series={series} 
        type="area" 
        height={height}
        width="100%"
      />
    </div>
  );
}
