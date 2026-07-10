import assert from "node:assert/strict";
import {
  getBucketSummary,
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
