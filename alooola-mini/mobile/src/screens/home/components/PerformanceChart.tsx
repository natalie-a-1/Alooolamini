/**
 * Renders the performance line/area chart with selectable tooltip.
 */
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop, Circle, Line } from 'react-native-svg';
import { formatCurrency, formatDate } from '@/lib/format';
import { styles } from '../HomeScreen.styles';

type ChartSnapshot = {
  asOf: string;
  totalValue: number;
};

type PerformanceChartProps = {
  chartData: ChartSnapshot[];
  minValue: number;
  valueRange: number;
  selectedBarIndex: number | null;
  onSelectBar: (index: number | null) => void; // kept for backwards compat
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export function PerformanceChart({
  chartData,
  minValue,
  valueRange,
  selectedBarIndex,
  onSelectBar,
}: PerformanceChartProps) {
  const selectedSnapshot = selectedBarIndex !== null ? chartData[selectedBarIndex] : null;
  const [chartWidth, setChartWidth] = React.useState(0);

  // SVG coordinate system
  const height = 120;
  const paddingX = 8;
  const paddingY = 10;

  if (!chartData.length) {
    return (
      <View style={styles.card}>
        <View style={styles.chartArea}>
          <View style={styles.chartEmptyFrame} />
        </View>
        <Text style={styles.emptyChartText}>No performance data yet.</Text>
      </View>
    );
  }

  const pointCount = chartData.length;
  const safeRange = valueRange === 0 ? 1 : valueRange;
  const points = chartData.map((snapshot, index) => {
    const t = pointCount === 1 ? 0 : index / (pointCount - 1);
    const x = paddingX + t * Math.max(0, chartWidth - paddingX * 2);
    const normalized = (snapshot.totalValue - minValue) / safeRange;
    const y =
      height - paddingY - clamp(normalized, 0, 1) * (height - paddingY * 2);
    return { x, y };
  });

  const buildPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    const [first, ...rest] = pts;
    return [`M ${first.x} ${first.y}`, ...rest.map((p) => `L ${p.x} ${p.y}`)].join(' ');
  };

  const linePath = buildPath(points);
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${
          height - paddingY
        } Z`
      : '';

  const selectedPoint = selectedBarIndex !== null ? points[selectedBarIndex] : null;

  const handlePress = (evt: any) => {
    if (!chartWidth || pointCount === 0) return;
    const x = evt?.nativeEvent?.locationX ?? 0;
    const t = clamp((x - paddingX) / Math.max(1, chartWidth - paddingX * 2), 0, 1);
    const idx = Math.round(t * (pointCount - 1));
    onSelectBar(selectedBarIndex === idx ? null : idx);
  };

  return (
    <View style={styles.card}>
      {selectedSnapshot ? (
        <View style={styles.chartTooltip}>
          <Text style={styles.chartTooltipValue}>{formatCurrency(selectedSnapshot.totalValue)}</Text>
          <Text style={styles.chartTooltipDate}>{formatDate(selectedSnapshot.asOf)}</Text>
        </View>
      ) : null}

      <View
        style={styles.chartArea}
        onLayout={(e) => {
          setChartWidth(e.nativeEvent.layout.width);
        }}
      >
        <Pressable style={styles.chartPressable} onPress={handlePress}>
          <Svg width="100%" height="100%" viewBox={`0 0 ${Math.max(chartWidth, 1)} ${height}`}>
            <Defs>
              <LinearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#7c3aed" stopOpacity={0.18} />
                <Stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
              </LinearGradient>
            </Defs>

            {/* area fill */}
            {chartWidth > 0 && areaPath ? <Path d={areaPath} fill="url(#areaFill)" /> : null}

            {/* line */}
            {chartWidth > 0 && linePath ? (
              <Path d={linePath} stroke="#7c3aed" strokeWidth={2} fill="none" />
            ) : null}

            {/* selection */}
            {selectedPoint ? (
              <>
                <Line
                  x1={selectedPoint.x}
                  y1={paddingY}
                  x2={selectedPoint.x}
                  y2={height - paddingY}
                  stroke="#7c3aed"
                  strokeOpacity={0.2}
                  strokeWidth={2}
                />
                <Circle cx={selectedPoint.x} cy={selectedPoint.y} r={4} fill="#7c3aed" />
                <Circle cx={selectedPoint.x} cy={selectedPoint.y} r={8} fill="#7c3aed" opacity={0.08} />
              </>
            ) : null}
          </Svg>
        </Pressable>
      </View>

      <View style={styles.chartDateLabels}>
        <Text style={styles.chartDateLabel}>{formatDate(chartData[0].asOf)}</Text>
        <Text style={styles.chartDateLabel}>{formatDate(chartData[chartData.length - 1].asOf)}</Text>
      </View>
    </View>
  );
}
