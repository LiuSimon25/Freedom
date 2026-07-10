export const MONTH_LABELS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

export function toMoney(value) {
  return Number(Number(value || 0).toFixed(2));
}

export function isSameMonth(date, month) {
  return typeof date === "string" && date.startsWith(month);
}

export function getMonthlyRecords(records, month) {
  return records.filter((record) => isSameMonth(record.date, month));
}

export function getMonthlySummary(records, month) {
  const monthlyRecords = getMonthlyRecords(records, month);
  const income = monthlyRecords
    .filter((record) => record.type === "income")
    .reduce((sum, record) => sum + Number(record.amount || 0), 0);
  const expense = monthlyRecords
    .filter((record) => record.type === "expense")
    .reduce((sum, record) => sum + Number(record.amount || 0), 0);

  return {
    income: toMoney(income),
    expense: toMoney(expense),
    balance: toMoney(income - expense),
  };
}

export function groupExpenseByCategory(records, month) {
  return getMonthlyRecords(records, month)
    .filter((record) => record.type === "expense")
    .reduce((groups, record) => {
      const category = record.category || "其他";
      groups[category] = toMoney((groups[category] || 0) + Number(record.amount || 0));
      return groups;
    }, {});
}

export function getTopExpenseCategories(records, month, limit = 5) {
  const groups = groupExpenseByCategory(records, month);
  return Object.entries(groups)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

export function getCategoryBreakdown(records, month) {
  const groups = groupExpenseByCategory(records, month);
  const total = Object.values(groups).reduce((sum, amount) => sum + amount, 0);

  if (total === 0) {
    return [];
  }

  return Object.entries(groups)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: toMoney((amount / total) * 100),
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getYearlyTrend(records, year) {
  const income = Array.from({ length: 12 }, () => 0);
  const expense = Array.from({ length: 12 }, () => 0);

  records.forEach((record) => {
    const recordDate = new Date(`${record.date}T00:00:00`);
    if (Number.isNaN(recordDate.getTime()) || recordDate.getFullYear() !== Number(year)) {
      return;
    }

    const monthIndex = recordDate.getMonth();
    if (record.type === "income") {
      income[monthIndex] = toMoney(income[monthIndex] + Number(record.amount || 0));
    }

    if (record.type === "expense") {
      expense[monthIndex] = toMoney(expense[monthIndex] + Number(record.amount || 0));
    }
  });

  return { labels: MONTH_LABELS, income, expense };
}
