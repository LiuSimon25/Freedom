import assert from "node:assert/strict";
import {
  getCategoryBreakdown,
  getMonthlySummary,
  getTopExpenseCategories,
  getYearlyTrend,
} from "../src/utils/financeCalc.js";

const records = [
  { type: "income", amount: 12000, category: "工资", date: "2026-06-01" },
  { type: "income", amount: 1500, category: "副业", date: "2026-06-12" },
  { type: "expense", amount: 2000, category: "住房", date: "2026-06-03" },
  { type: "expense", amount: 239, category: "购物", date: "2026-06-07" },
  { type: "expense", amount: 88, category: "娱乐", date: "2026-06-08" },
  { type: "expense", amount: 68, category: "餐饮", date: "2026-06-09" },
  { type: "expense", amount: 12, category: "交通", date: "2026-06-10" },
  { type: "income", amount: 3000, category: "奖金", date: "2026-07-01" },
  { type: "expense", amount: 900, category: "购物", date: "2026-07-02" },
];

assert.deepEqual(getMonthlySummary(records, "2026-06"), {
  income: 13500,
  expense: 2407,
  balance: 11093,
});

assert.deepEqual(getTopExpenseCategories(records, "2026-06", 3), [
  { category: "住房", amount: 2000 },
  { category: "购物", amount: 239 },
  { category: "娱乐", amount: 88 },
]);

assert.deepEqual(getCategoryBreakdown(records, "2026-06"), [
  { category: "住房", amount: 2000, percentage: 83.09 },
  { category: "购物", amount: 239, percentage: 9.93 },
  { category: "娱乐", amount: 88, percentage: 3.66 },
  { category: "餐饮", amount: 68, percentage: 2.83 },
  { category: "交通", amount: 12, percentage: 0.5 },
]);

const trend = getYearlyTrend(records, 2026);
assert.equal(trend.income.length, 12);
assert.equal(trend.expense.length, 12);
assert.equal(trend.income[5], 13500);
assert.equal(trend.expense[5], 2407);
assert.equal(trend.income[6], 3000);
assert.equal(trend.expense[6], 900);
