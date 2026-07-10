import assert from "node:assert/strict";
import {
  getBucketSummary,
  getBucketTrendFromSnapshots,
  getBucketTrendWithCurrentSummary,
  getInsuranceCategoryStats,
} from "../src/utils/configCalc.js";

const assets = [
  { name: "现金账户", amount: 20000, category: "流动资金", moneyBucket: "活钱" },
  { name: "银行卡", amount: 40000, category: "流动资金", moneyBucket: "活钱" },
  { name: "理财产品", amount: 62000, category: "投资理财", moneyBucket: "短期" },
  { name: "基金", amount: 60000, category: "投资理财", moneyBucket: "长期" },
  { name: "汽车", amount: 10000, category: "固定资产", moneyBucket: "不纳入配置" },
  { name: "信用卡", amount: 10000, category: "负债" },
];

assert.deepEqual(getBucketSummary(assets), {
  活钱: { amount: 60000, percentage: 32.97 },
  短期: { amount: 62000, percentage: 34.07 },
  长期: { amount: 60000, percentage: 32.97 },
  total: 182000,
});

const policies = [
  { category: "医疗" },
  { category: "医疗" },
  { category: "意外" },
  { category: "寿险" },
  { category: "重疾" },
  { category: "重疾" },
  { category: "重疾" },
];

assert.deepEqual(getInsuranceCategoryStats(policies), {
  医疗: 2,
  意外: 1,
  寿险: 1,
  重疾: 3,
});

assert.deepEqual(getBucketTrendFromSnapshots([], 2026), {
  活钱: Array.from({ length: 12 }, () => 0),
  短期: Array.from({ length: 12 }, () => 0),
  长期: Array.from({ length: 12 }, () => 0),
});

const staleTrend = getBucketTrendWithCurrentSummary(
  [
    {
      year: 2026,
      month: 7,
      categories: { liquid: 0, fixed: 0, investment: 14455.49, receivable: 0, liability: 0 },
    },
  ],
  2026,
  {
    活钱: { amount: 0 },
    短期: { amount: 14455.49 },
    长期: { amount: 0 },
  },
  new Date("2026-07-10T10:00:00.000Z"),
);

assert.equal(staleTrend.短期[6], 14455.49);
assert.equal(staleTrend.长期[6], 0);
