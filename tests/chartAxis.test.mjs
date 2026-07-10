import assert from "node:assert/strict";
import { buildMoneyYAxisOptions, buildTrendChartGrid } from "../src/utils/chartAxis.js";

const smallAxis = buildMoneyYAxisOptions([[200, 400, 600], [120]]);
assert.equal(smallAxis.interval, 200);
assert.equal(smallAxis.max, 600);
assert.equal(smallAxis.axisLabel.formatter(600), "600");

const largeAxis = buildMoneyYAxisOptions([[12000, 13500], [2407]]);
assert.equal(largeAxis.interval, 5000);
assert.equal(largeAxis.max, 15000);
assert.equal(largeAxis.axisLabel.formatter(15000), "15,000");
assert.ok(!smallAxis.axisLabel.formatter(600).includes("k"));
assert.ok(!largeAxis.axisLabel.formatter(15000).includes("k"));

assert.deepEqual(buildTrendChartGrid(), {
  left: 10,
  right: 18,
  top: 42,
  bottom: 30,
  containLabel: true,
});

console.log("chartAxis tests passed");
