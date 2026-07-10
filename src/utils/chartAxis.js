function flattenAmounts(seriesGroups) {
  return seriesGroups
    .flat()
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value >= 0);
}

function getNiceInterval(maxValue) {
  const rawInterval = Math.max(maxValue / 6, 200);
  const magnitude = 10 ** Math.floor(Math.log10(rawInterval));
  const scaled = rawInterval / magnitude;

  if (scaled <= 1) return magnitude;
  if (scaled <= 2) return 2 * magnitude;
  if (scaled <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

export function buildMoneyYAxisOptions(seriesGroups) {
  const amounts = flattenAmounts(seriesGroups);
  const maxValue = Math.max(...amounts, 0);
  const interval = getNiceInterval(maxValue);
  const max = Math.max(interval, Math.ceil(maxValue / interval) * interval);

  return {
    type: "value",
    min: 0,
    max,
    interval,
    axisLabel: {
      color: "#777a88",
      formatter: (value) => Number(value || 0).toLocaleString("zh-CN"),
    },
    splitLine: { lineStyle: { color: "#1c1d22" } },
  };
}

export function buildTrendChartGrid(top = 42, bottom = 30) {
  return {
    left: 10,
    right: 18,
    top,
    bottom,
    containLabel: true,
  };
}
