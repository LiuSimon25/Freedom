import assert from "node:assert/strict";
import {
  createAssetSnapshot,
  getAssetCategoryTotals,
  getAssetSummary,
  getAssetTrend,
} from "../src/utils/assetCalc.js";

const assets = [
  { name: "现金账户", amount: 20000, category: "流动资金" },
  { name: "银行卡", amount: 30000, category: "流动资金" },
  { name: "房产", amount: 30000, category: "固定资产" },
  { name: "汽车", amount: 10000, category: "固定资产" },
  { name: "基金", amount: 30000, category: "投资理财" },
  { name: "股票", amount: 15000, category: "投资理财" },
  { name: "朋友借款", amount: 15000, category: "应收款" },
  { name: "房贷", amount: 30000, category: "负债" },
  { name: "信用卡", amount: 10000, category: "负债" },
];

assert.deepEqual(getAssetCategoryTotals(assets), {
  liquid: 50000,
  fixed: 40000,
  investment: 45000,
  receivable: 15000,
  liability: 40000,
});

assert.deepEqual(getAssetSummary(assets), {
  totalAssets: 150000,
  totalLiabilities: 40000,
  netAssets: 110000,
  liabilityRatio: 26.67,
});

const configuredAssets = [
  { name: "现金账户", amount: 20000, category: "流动资金", moneyBucket: "活钱" },
  { name: "短债基金", amount: 14455.49, category: "投资理财", moneyBucket: "短期" },
  { name: "指数基金", amount: 30000, category: "投资理财", moneyBucket: "不纳入配置" },
  { name: "房贷", amount: 5000, category: "负债" },
];

assert.deepEqual(createAssetSnapshot(configuredAssets, new Date("2026-07-10T10:00:00.000Z")).buckets, {
  活钱: 20000,
  短期: 14455.49,
  长期: 0,
});

const snapshots = [
  { year: 2026, month: 1, categories: { liquid: 20000, fixed: 30000, investment: 20000, receivable: 0, liability: 40000 } },
  { year: 2026, month: 3, categories: { liquid: 30000, fixed: 30000, investment: 26000, receivable: 4000, liability: 38000 } },
  { year: 2026, month: 6, categories: { liquid: 50000, fixed: 40000, investment: 45000, receivable: 15000, liability: 40000 } },
];

assert.deepEqual(getAssetTrend(snapshots, 2026, "liquid"), [
  20000,
  20000,
  30000,
  30000,
  30000,
  50000,
  50000,
  50000,
  50000,
  50000,
  50000,
  50000,
]);
