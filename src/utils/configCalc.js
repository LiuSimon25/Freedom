export const MONEY_BUCKETS = ["活钱", "短期", "长期"];
export const INSURANCE_CATEGORIES = ["医疗", "意外", "寿险", "重疾"];

function round(value) {
  return Number(Number(value || 0).toFixed(2));
}

export function getBucketSummary(assets) {
  const amounts = {
    活钱: 0,
    短期: 0,
    长期: 0,
  };

  assets.forEach((asset) => {
    if (asset.category === "负债") {
      return;
    }

    if (MONEY_BUCKETS.includes(asset.moneyBucket)) {
      amounts[asset.moneyBucket] += Number(asset.amount || 0);
    }
  });

  const total = round(amounts.活钱 + amounts.短期 + amounts.长期);

  return {
    活钱: {
      amount: round(amounts.活钱),
      percentage: total > 0 ? round((amounts.活钱 / total) * 100) : 0,
    },
    短期: {
      amount: round(amounts.短期),
      percentage: total > 0 ? round((amounts.短期 / total) * 100) : 0,
    },
    长期: {
      amount: round(amounts.长期),
      percentage: total > 0 ? round((amounts.长期 / total) * 100) : 0,
    },
    total,
  };
}

export function getInsuranceCategoryStats(policies) {
  return INSURANCE_CATEGORIES.reduce((result, category) => {
    result[category] = policies.filter((policy) => policy.category === category).length;
    return result;
  }, {});
}

export function getBucketTrendFromSnapshots(snapshots, year) {
  const base = {
    活钱: Array.from({ length: 12 }, (_, index) => 48000 + index * 2500),
    短期: Array.from({ length: 12 }, (_, index) => 31000 + index * 1600),
    长期: Array.from({ length: 12 }, (_, index) => 16000 + index * 1200),
  };

  const sameYearSnapshots = snapshots.filter((snapshot) => snapshot.year === Number(year));
  if (sameYearSnapshots.length === 0) {
    return base;
  }

  return base;
}
