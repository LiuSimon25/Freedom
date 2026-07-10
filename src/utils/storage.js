import { buildExportPayload, normalizeImportPayload } from "./dataPortability";

const LEDGER_KEY = "freedom_ledger_records";
const ASSET_KEY = "freedom_assets";
const ASSET_SNAPSHOT_KEY = "freedom_asset_snapshots";
const POLICY_KEY = "freedom_policies";
const CLEARED_KEY = "freedom_data_cleared";

const demoLedgerRecords = [
  { id: "demo-income-1", type: "income", amount: 12000, category: "工资", date: "2026-06-01", note: "6月工资", createdAt: "2026-06-01T09:00:00.000Z" },
  { id: "demo-income-2", type: "income", amount: 1500, category: "副业", date: "2026-06-01", note: "设计兼职", createdAt: "2026-06-01T10:00:00.000Z" },
  { id: "demo-expense-1", type: "expense", amount: 68, category: "餐饮", date: "2026-06-02", note: "午餐", createdAt: "2026-06-02T12:00:00.000Z" },
  { id: "demo-expense-2", type: "expense", amount: 12, category: "交通", date: "2026-06-02", note: "地铁", createdAt: "2026-06-02T08:00:00.000Z" },
  { id: "demo-expense-3", type: "expense", amount: 239, category: "购物", date: "2026-06-01", note: "生活用品", createdAt: "2026-06-01T18:00:00.000Z" },
  { id: "demo-expense-4", type: "expense", amount: 88, category: "娱乐", date: "2026-06-01", note: "电影", createdAt: "2026-06-01T20:00:00.000Z" },
  { id: "demo-expense-5", type: "expense", amount: 2000, category: "住房", date: "2026-06-01", note: "房租", createdAt: "2026-06-01T08:00:00.000Z" },
  { id: "demo-income-3", type: "income", amount: 5200, category: "工资", date: "2026-01-12", note: "示例收入", createdAt: "2026-01-12T09:00:00.000Z" },
  { id: "demo-income-4", type: "income", amount: 7800, category: "工资", date: "2026-02-12", note: "示例收入", createdAt: "2026-02-12T09:00:00.000Z" },
  { id: "demo-income-5", type: "income", amount: 8500, category: "工资", date: "2026-03-12", note: "示例收入", createdAt: "2026-03-12T09:00:00.000Z" },
  { id: "demo-income-6", type: "income", amount: 6200, category: "工资", date: "2026-04-12", note: "示例收入", createdAt: "2026-04-12T09:00:00.000Z" },
  { id: "demo-income-7", type: "income", amount: 7900, category: "工资", date: "2026-05-12", note: "示例收入", createdAt: "2026-05-12T09:00:00.000Z" },
  { id: "demo-income-8", type: "income", amount: 12200, category: "工资", date: "2026-07-12", note: "示例收入", createdAt: "2026-07-12T09:00:00.000Z" },
  { id: "demo-income-9", type: "income", amount: 14100, category: "工资", date: "2026-09-12", note: "示例收入", createdAt: "2026-09-12T09:00:00.000Z" },
  { id: "demo-income-10", type: "income", amount: 13500, category: "工资", date: "2026-10-12", note: "示例收入", createdAt: "2026-10-12T09:00:00.000Z" },
  { id: "demo-income-11", type: "income", amount: 16200, category: "工资", date: "2026-11-12", note: "示例收入", createdAt: "2026-11-12T09:00:00.000Z" },
  { id: "demo-income-12", type: "income", amount: 17500, category: "工资", date: "2026-12-12", note: "示例收入", createdAt: "2026-12-12T09:00:00.000Z" },
  { id: "demo-expense-6", type: "expense", amount: 3100, category: "其他", date: "2026-01-20", note: "示例支出", createdAt: "2026-01-20T09:00:00.000Z" },
  { id: "demo-expense-7", type: "expense", amount: 4200, category: "其他", date: "2026-02-20", note: "示例支出", createdAt: "2026-02-20T09:00:00.000Z" },
  { id: "demo-expense-8", type: "expense", amount: 5100, category: "其他", date: "2026-03-20", note: "示例支出", createdAt: "2026-03-20T09:00:00.000Z" },
  { id: "demo-expense-9", type: "expense", amount: 4300, category: "其他", date: "2026-04-20", note: "示例支出", createdAt: "2026-04-20T09:00:00.000Z" },
  { id: "demo-expense-10", type: "expense", amount: 4900, category: "其他", date: "2026-05-20", note: "示例支出", createdAt: "2026-05-20T09:00:00.000Z" },
  { id: "demo-expense-11", type: "expense", amount: 4700, category: "其他", date: "2026-07-20", note: "示例支出", createdAt: "2026-07-20T09:00:00.000Z" },
  { id: "demo-expense-12", type: "expense", amount: 5200, category: "其他", date: "2026-09-20", note: "示例支出", createdAt: "2026-09-20T09:00:00.000Z" },
  { id: "demo-expense-13", type: "expense", amount: 5900, category: "其他", date: "2026-10-20", note: "示例支出", createdAt: "2026-10-20T09:00:00.000Z" },
  { id: "demo-expense-14", type: "expense", amount: 6200, category: "其他", date: "2026-11-20", note: "示例支出", createdAt: "2026-11-20T09:00:00.000Z" },
  { id: "demo-expense-15", type: "expense", amount: 5400, category: "其他", date: "2026-12-20", note: "示例支出", createdAt: "2026-12-20T09:00:00.000Z" },
];

const demoAssets = [
  { id: "asset-liquid-1", name: "现金账户", amount: 20000, category: "流动资金", date: "2026-06-10", note: "日常现金", moneyBucket: "活钱", createdAt: "2026-06-10T09:00:00.000Z", updatedAt: "2026-06-10T09:00:00.000Z" },
  { id: "asset-liquid-2", name: "银行卡", amount: 30000, category: "流动资金", date: "2026-06-10", note: "工资卡", moneyBucket: "活钱", createdAt: "2026-06-10T09:00:00.000Z", updatedAt: "2026-06-10T09:00:00.000Z" },
  { id: "asset-liquid-3", name: "支付宝", amount: 10000, category: "流动资金", date: "2026-06-10", note: "生活备用", moneyBucket: "活钱", createdAt: "2026-06-10T09:00:00.000Z", updatedAt: "2026-06-10T09:00:00.000Z" },
  { id: "asset-fixed-1", name: "房产", amount: 30000, category: "固定资产", date: "2026-06-10", note: "估值", moneyBucket: "长期", createdAt: "2026-06-10T09:00:00.000Z", updatedAt: "2026-06-10T09:00:00.000Z" },
  { id: "asset-fixed-2", name: "汽车", amount: 10000, category: "固定资产", date: "2026-06-10", note: "估值", moneyBucket: "不纳入配置", createdAt: "2026-06-10T09:00:00.000Z", updatedAt: "2026-06-10T09:00:00.000Z" },
  { id: "asset-invest-1", name: "基金", amount: 30000, category: "投资理财", date: "2026-06-10", note: "指数基金", moneyBucket: "长期", createdAt: "2026-06-10T09:00:00.000Z", updatedAt: "2026-06-10T09:00:00.000Z" },
  { id: "asset-invest-2", name: "股票", amount: 15000, category: "投资理财", date: "2026-06-10", note: "长期持有", moneyBucket: "长期", createdAt: "2026-06-10T09:00:00.000Z", updatedAt: "2026-06-10T09:00:00.000Z" },
  { id: "asset-invest-3", name: "理财产品", amount: 5000, category: "投资理财", date: "2026-06-10", note: "短期理财", moneyBucket: "短期", createdAt: "2026-06-10T09:00:00.000Z", updatedAt: "2026-06-10T09:00:00.000Z" },
  { id: "asset-receivable-1", name: "朋友借款", amount: 15000, category: "应收款", date: "2026-06-10", note: "待收回", moneyBucket: "短期", createdAt: "2026-06-10T09:00:00.000Z", updatedAt: "2026-06-10T09:00:00.000Z" },
  { id: "asset-receivable-2", name: "客户尾款", amount: 3000, category: "应收款", date: "2026-06-10", note: "设计项目", moneyBucket: "短期", createdAt: "2026-06-10T09:00:00.000Z", updatedAt: "2026-06-10T09:00:00.000Z" },
  { id: "asset-liability-1", name: "房贷", amount: 30000, category: "负债", date: "2026-06-10", note: "剩余本金", createdAt: "2026-06-10T09:00:00.000Z", updatedAt: "2026-06-10T09:00:00.000Z" },
  { id: "asset-liability-2", name: "信用卡", amount: 10000, category: "负债", date: "2026-06-10", note: "本月账单", createdAt: "2026-06-10T09:00:00.000Z", updatedAt: "2026-06-10T09:00:00.000Z" },
];

const demoAssetSnapshots = [
  { id: "snapshot-1", date: "2026-01-31", year: 2026, month: 1, totalAssets: 34000, totalLiabilities: 40000, netAssets: -6000, categories: { liquid: 34000, fixed: 0, investment: 0, receivable: 0, liability: 40000 }, createdAt: "2026-01-31T09:00:00.000Z" },
  { id: "snapshot-2", date: "2026-02-28", year: 2026, month: 2, totalAssets: 38000, totalLiabilities: 40000, netAssets: -2000, categories: { liquid: 38000, fixed: 0, investment: 0, receivable: 0, liability: 40000 }, createdAt: "2026-02-28T09:00:00.000Z" },
  { id: "snapshot-3", date: "2026-03-31", year: 2026, month: 3, totalAssets: 42000, totalLiabilities: 39000, netAssets: 3000, categories: { liquid: 42000, fixed: 0, investment: 0, receivable: 0, liability: 39000 }, createdAt: "2026-03-31T09:00:00.000Z" },
  { id: "snapshot-4", date: "2026-04-30", year: 2026, month: 4, totalAssets: 53000, totalLiabilities: 39000, netAssets: 14000, categories: { liquid: 53000, fixed: 0, investment: 0, receivable: 0, liability: 39000 }, createdAt: "2026-04-30T09:00:00.000Z" },
  { id: "snapshot-5", date: "2026-05-31", year: 2026, month: 5, totalAssets: 37000, totalLiabilities: 39000, netAssets: -2000, categories: { liquid: 37000, fixed: 0, investment: 0, receivable: 0, liability: 39000 }, createdAt: "2026-05-31T09:00:00.000Z" },
  { id: "snapshot-6", date: "2026-06-30", year: 2026, month: 6, totalAssets: 168000, totalLiabilities: 40000, netAssets: 128000, categories: { liquid: 60000, fixed: 40000, investment: 50000, receivable: 18000, liability: 40000 }, createdAt: "2026-06-30T09:00:00.000Z" },
  { id: "snapshot-7", date: "2026-07-31", year: 2026, month: 7, totalAssets: 64000, totalLiabilities: 40000, netAssets: 24000, categories: { liquid: 64000, fixed: 40000, investment: 50000, receivable: 18000, liability: 40000 }, createdAt: "2026-07-31T09:00:00.000Z" },
  { id: "snapshot-8", date: "2026-08-31", year: 2026, month: 8, totalAssets: 71000, totalLiabilities: 40000, netAssets: 31000, categories: { liquid: 71000, fixed: 40000, investment: 50000, receivable: 18000, liability: 40000 }, createdAt: "2026-08-31T09:00:00.000Z" },
  { id: "snapshot-9", date: "2026-09-30", year: 2026, month: 9, totalAssets: 79000, totalLiabilities: 40000, netAssets: 39000, categories: { liquid: 79000, fixed: 40000, investment: 50000, receivable: 18000, liability: 40000 }, createdAt: "2026-09-30T09:00:00.000Z" },
  { id: "snapshot-10", date: "2026-10-31", year: 2026, month: 10, totalAssets: 83500, totalLiabilities: 40000, netAssets: 43500, categories: { liquid: 83500, fixed: 40000, investment: 50000, receivable: 18000, liability: 40000 }, createdAt: "2026-10-31T09:00:00.000Z" },
  { id: "snapshot-11", date: "2026-11-30", year: 2026, month: 11, totalAssets: 85800, totalLiabilities: 40000, netAssets: 45800, categories: { liquid: 85800, fixed: 40000, investment: 50000, receivable: 18000, liability: 40000 }, createdAt: "2026-11-30T09:00:00.000Z" },
  { id: "snapshot-12", date: "2026-12-31", year: 2026, month: 12, totalAssets: 87000, totalLiabilities: 40000, netAssets: 47000, categories: { liquid: 87000, fixed: 40000, investment: 50000, receivable: 18000, liability: 40000 }, createdAt: "2026-12-31T09:00:00.000Z" },
];

const demoPolicies = [
  { id: "policy-1", name: "百万医疗险", company: "中国平安", insuredPerson: "本人", category: "医疗", premiumAmount: 980, paymentType: "年度缴费", isPaidOff: false, renewalDate: "2025-12-01", paymentYears: "1年", coverageAmount: 2000000, note: "", createdAt: "2026-06-10T09:00:00.000Z", updatedAt: "2026-06-10T09:00:00.000Z" },
  { id: "policy-2", name: "意外险", company: "中国人寿", insuredPerson: "本人", category: "意外", premiumAmount: 360, paymentType: "年度缴费", isPaidOff: false, renewalDate: "2025-10-15", paymentYears: "1年", coverageAmount: 500000, note: "", createdAt: "2026-06-10T09:00:00.000Z", updatedAt: "2026-06-10T09:00:00.000Z" },
  { id: "policy-3", name: "定期寿险", company: "中国平安", insuredPerson: "本人", category: "寿险", premiumAmount: 1200, paymentType: "年度缴费", isPaidOff: false, renewalDate: "2030-01-01", paymentYears: "20年", coverageAmount: 1000000, note: "", createdAt: "2026-06-10T09:00:00.000Z", updatedAt: "2026-06-10T09:00:00.000Z" },
  { id: "policy-4", name: "重疾险", company: "中国人寿", insuredPerson: "本人", category: "重疾", premiumAmount: 4500, paymentType: "年度缴费", isPaidOff: false, renewalDate: "2035-06-01", paymentYears: "30年", coverageAmount: 500000, note: "", createdAt: "2026-06-10T09:00:00.000Z", updatedAt: "2026-06-10T09:00:00.000Z" },
];

function readJson(key, fallback) {
  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function isCleared() {
  return window.localStorage.getItem(CLEARED_KEY) === "true";
}

export function getLedgerRecords() {
  if (typeof window === "undefined") {
    return [];
  }

  const savedRecords = readJson(LEDGER_KEY, null);
  if (savedRecords) {
    return savedRecords;
  }
  if (isCleared()) {
    return [];
  }

  writeJson(LEDGER_KEY, demoLedgerRecords);
  return demoLedgerRecords;
}

export function saveLedgerRecords(records) {
  writeJson(LEDGER_KEY, records);
}

export function deleteLedgerRecord(id) {
  const nextRecords = getLedgerRecords().filter((record) => record.id !== id);
  saveLedgerRecords(nextRecords);
  return nextRecords;
}

export function deleteLedgerRecordsByCategory({ type, category, month }) {
  const nextRecords = getLedgerRecords().filter((record) => {
    const sameType = record.type === type;
    const sameCategory = record.category === category;
    const sameMonth = typeof record.date === "string" && record.date.startsWith(month);
    return !(sameType && sameCategory && sameMonth);
  });
  saveLedgerRecords(nextRecords);
  return nextRecords;
}

export function addLedgerRecord(record) {
  const records = getLedgerRecords();
  const nextRecord = {
    ...record,
    id: crypto.randomUUID(),
    amount: Number(record.amount),
    createdAt: new Date().toISOString(),
  };
  const nextRecords = [nextRecord, ...records];
  saveLedgerRecords(nextRecords);
  updateDefaultCashAsset(nextRecord);
  return nextRecords;
}

export function updateDefaultCashAsset(record) {
  const assets = readJson(ASSET_KEY, []);
  const cashAccountName = "默认现金账户";
  const existingAccount = assets.find((asset) => asset.category === "流动资金" && asset.name === cashAccountName);
  const delta = record.type === "income" ? Number(record.amount) : -Number(record.amount);

  if (existingAccount) {
    existingAccount.amount = Number((Number(existingAccount.amount || 0) + delta).toFixed(2));
    existingAccount.updatedAt = new Date().toISOString();
    writeJson(ASSET_KEY, assets);
    return;
  }

  assets.push({
    id: crypto.randomUUID(),
    name: cashAccountName,
    amount: Number(delta.toFixed(2)),
    category: "流动资金",
    date: record.date,
    note: "由记账记录自动创建",
    moneyBucket: "活钱",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  writeJson(ASSET_KEY, assets);
}

function ensureAssets() {
  const savedAssets = readJson(ASSET_KEY, null);
  if (savedAssets) {
    return savedAssets;
  }
  if (isCleared()) {
    return [];
  }

  writeJson(ASSET_KEY, demoAssets);
  return demoAssets;
}

function ensureAssetSnapshots() {
  const savedSnapshots = readJson(ASSET_SNAPSHOT_KEY, null);
  if (savedSnapshots) {
    return savedSnapshots;
  }
  if (isCleared()) {
    return [];
  }

  writeJson(ASSET_SNAPSHOT_KEY, demoAssetSnapshots);
  return demoAssetSnapshots;
}

function createSnapshot(assets) {
  const now = new Date();
  const totals = assets.reduce(
    (result, asset) => {
      const amount = Number(asset.amount || 0);
      if (asset.category === "流动资金") result.liquid += amount;
      if (asset.category === "固定资产") result.fixed += amount;
      if (asset.category === "投资理财") result.investment += amount;
      if (asset.category === "应收款") result.receivable += amount;
      if (asset.category === "负债") result.liability += amount;
      return result;
    },
    { liquid: 0, fixed: 0, investment: 0, receivable: 0, liability: 0 },
  );
  const totalAssets = totals.liquid + totals.fixed + totals.investment + totals.receivable;
  const totalLiabilities = totals.liability;

  return {
    id: crypto.randomUUID(),
    date: now.toISOString().slice(0, 10),
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    totalAssets,
    totalLiabilities,
    netAssets: totalAssets - totalLiabilities,
    categories: totals,
    createdAt: now.toISOString(),
  };
}

function saveAssetsWithSnapshot(assets) {
  writeJson(ASSET_KEY, assets);
  const snapshots = [...ensureAssetSnapshots(), createSnapshot(assets)];
  writeJson(ASSET_SNAPSHOT_KEY, snapshots);
  return { assets, snapshots };
}

export function getAssets() {
  if (typeof window === "undefined") {
    return [];
  }
  return ensureAssets();
}

export function getAssetSnapshots() {
  if (typeof window === "undefined") {
    return [];
  }
  ensureAssets();
  return ensureAssetSnapshots();
}

export function upsertAsset(asset) {
  const assets = ensureAssets();
  const now = new Date().toISOString();

  if (asset.id) {
    const nextAssets = assets.map((item) =>
      item.id === asset.id
        ? {
            ...item,
            ...asset,
            amount: Number(asset.amount),
            updatedAt: now,
          }
        : item,
    );
    return saveAssetsWithSnapshot(nextAssets);
  }

  const nextAssets = [
    {
      ...asset,
      id: crypto.randomUUID(),
      amount: Number(asset.amount),
      createdAt: now,
      updatedAt: now,
    },
    ...assets,
  ];
  return saveAssetsWithSnapshot(nextAssets);
}

export function deleteAsset(id) {
  const assets = ensureAssets().filter((asset) => asset.id !== id);
  return saveAssetsWithSnapshot(assets);
}

export function saveAssetBuckets(bucketAssignments) {
  const assignmentMap = new Map(bucketAssignments.map((assignment) => [assignment.id, assignment.moneyBucket]));
  const assets = ensureAssets().map((asset) => {
    if (asset.category === "负债" || !assignmentMap.has(asset.id)) {
      return asset;
    }

    return {
      ...asset,
      moneyBucket: assignmentMap.get(asset.id),
      updatedAt: new Date().toISOString(),
    };
  });

  return saveAssetsWithSnapshot(assets);
}

function ensurePolicies() {
  const savedPolicies = readJson(POLICY_KEY, null);
  if (savedPolicies) {
    return savedPolicies;
  }
  if (isCleared()) {
    return [];
  }

  writeJson(POLICY_KEY, demoPolicies);
  return demoPolicies;
}

export function getPolicies() {
  if (typeof window === "undefined") {
    return [];
  }
  return ensurePolicies();
}

export function upsertPolicy(policy) {
  const policies = ensurePolicies();
  const now = new Date().toISOString();

  if (policy.id) {
    const nextPolicies = policies.map((item) =>
      item.id === policy.id
        ? {
            ...item,
            ...policy,
            updatedAt: now,
          }
        : item,
    );
    writeJson(POLICY_KEY, nextPolicies);
    return nextPolicies;
  }

  const nextPolicies = [
    {
      ...policy,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    },
    ...policies,
  ];
  writeJson(POLICY_KEY, nextPolicies);
  return nextPolicies;
}

export function deletePolicy(id) {
  const policies = ensurePolicies().filter((policy) => policy.id !== id);
  writeJson(POLICY_KEY, policies);
  return policies;
}

export function exportFreedomData() {
  return buildExportPayload({
    ledgerRecords: getLedgerRecords(),
    assets: getAssets(),
    assetSnapshots: getAssetSnapshots(),
    policies: getPolicies(),
  });
}

export function importFreedomData(payload) {
  const normalized = normalizeImportPayload(payload);
  window.localStorage.removeItem(CLEARED_KEY);
  writeJson(LEDGER_KEY, normalized.ledgerRecords);
  writeJson(ASSET_KEY, normalized.assets);
  writeJson(ASSET_SNAPSHOT_KEY, normalized.assetSnapshots);
  writeJson(POLICY_KEY, normalized.policies);
  return normalized;
}

export function clearFreedomData() {
  window.localStorage.setItem(CLEARED_KEY, "true");
  writeJson(LEDGER_KEY, []);
  writeJson(ASSET_KEY, []);
  writeJson(ASSET_SNAPSHOT_KEY, []);
  writeJson(POLICY_KEY, []);
}
