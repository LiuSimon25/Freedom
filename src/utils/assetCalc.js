export const ASSET_CATEGORY_MAP = {
  流动资金: "liquid",
  固定资产: "fixed",
  投资理财: "investment",
  应收款: "receivable",
  负债: "liability",
};

export const ASSET_CATEGORY_LABELS = {
  liquid: "流动资金",
  fixed: "固定资产",
  investment: "投资理财",
  receivable: "应收款",
  liability: "负债",
};

export function roundMoney(value) {
  return Number(Number(value || 0).toFixed(2));
}

export function getAssetCategoryTotals(assets) {
  const totals = {
    liquid: 0,
    fixed: 0,
    investment: 0,
    receivable: 0,
    liability: 0,
  };

  assets.forEach((asset) => {
    const key = ASSET_CATEGORY_MAP[asset.category];
    if (!key) {
      return;
    }
    totals[key] = roundMoney(totals[key] + Number(asset.amount || 0));
  });

  return totals;
}

export function getAssetSummary(assets) {
  const totals = getAssetCategoryTotals(assets);
  const totalAssets = roundMoney(totals.liquid + totals.fixed + totals.investment + totals.receivable);
  const totalLiabilities = roundMoney(totals.liability);
  const netAssets = roundMoney(totalAssets - totalLiabilities);

  return {
    totalAssets,
    totalLiabilities,
    netAssets,
    liabilityRatio: totalAssets > 0 ? roundMoney((totalLiabilities / totalAssets) * 100) : 0,
  };
}

export function createAssetSnapshot(assets, date = new Date()) {
  const summary = getAssetSummary(assets);
  const categories = getAssetCategoryTotals(assets);
  return {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${date.getTime()}`,
    date: date.toISOString().slice(0, 10),
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    totalAssets: summary.totalAssets,
    totalLiabilities: summary.totalLiabilities,
    netAssets: summary.netAssets,
    categories,
    createdAt: date.toISOString(),
  };
}

export function getAssetTrend(snapshots, year, categoryKey) {
  const sortedSnapshots = [...snapshots]
    .filter((snapshot) => snapshot.year === Number(year))
    .sort((a, b) => a.month - b.month || String(a.createdAt || "").localeCompare(String(b.createdAt || "")));
  const monthlyLastSnapshots = new Map();

  sortedSnapshots.forEach((snapshot) => {
    monthlyLastSnapshots.set(snapshot.month, snapshot);
  });

  const result = [];
  let lastValue = 0;
  for (let month = 1; month <= 12; month += 1) {
    const snapshot = monthlyLastSnapshots.get(month);
    if (snapshot) {
      lastValue = Number(snapshot.categories?.[categoryKey] || 0);
    }
    result.push(roundMoney(lastValue));
  }

  return result;
}
