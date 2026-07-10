import assert from "node:assert/strict";
import { validateAssetForm, validateLedgerForm, validatePolicyForm } from "../src/utils/validators.js";

assert.deepEqual(
  validateLedgerForm({
    amount: "",
    category: "",
    date: "",
    note: "这是一段明确超过五十个字的备注，用来验证系统是否能够阻止过长的备注输入，避免表格内容显示异常，也避免页面排版被撑开。",
  }),
  {
    amount: "请输入金额",
    category: "请选择分类",
    date: "请选择日期",
    note: "备注不能超过 50 字",
  },
);

assert.deepEqual(
  validateLedgerForm({
    amount: "0",
    category: "餐饮",
    date: "2026-06-02",
    note: "",
  }),
  {
    amount: "金额必须大于 0",
  },
);

assert.deepEqual(
  validateLedgerForm({
    amount: "88.8",
    category: "餐饮",
    date: "2026-06-02",
    note: "午餐",
  }),
  {},
);

assert.deepEqual(
  validateAssetForm({
    name: "",
    amount: "",
    category: "",
    date: "",
    note: "这是一段明确超过八十个字的备注，用来验证资产表单是否能够限制过长备注，避免抽屉内容和分类明细被长文本撑开，也避免后续列表展示出现不可控的布局问题，同时保证作品集页面在极端输入下依然稳定。",
    moneyBucket: "活钱",
  }),
  {
    name: "请输入名称",
    amount: "请输入金额",
    category: "请选择分类",
    date: "请选择日期",
    note: "备注不能超过 80 字",
  },
);

assert.deepEqual(
  validateAssetForm({
    name: "信用卡",
    amount: "1000",
    category: "负债",
    date: "2026-06-10",
    note: "",
    moneyBucket: "活钱",
  }),
  {
    moneyBucket: "负债不参与三笔钱配置",
  },
);

assert.deepEqual(
  validateAssetForm({
    name: "现金账户",
    amount: "20000",
    category: "流动资金",
    date: "2026-06-10",
    note: "备用金",
    moneyBucket: "活钱",
  }),
  {},
);

assert.deepEqual(
  validatePolicyForm({
    name: "",
    company: "",
    insuredPerson: "",
    category: "",
    premiumAmount: "-1",
    renewalDate: "",
    paymentYears: "abc",
    coverageAmount: "-100",
    note: "这是一段明确超过一百个字的保单备注，用来验证保单表单是否能够限制过长备注，避免我的保单列表和抽屉内容被长文本撑开，同时保证作品集页面在极端输入下依然稳定，后续也方便做更正式的数据展示和维护。这里继续补充一些文字确保测试一定超过限制。",
  }),
  {
    name: "请输入保险名称",
    company: "请输入保险公司",
    insuredPerson: "请输入被保险人",
    category: "请选择保险分类",
    premiumAmount: "缴费金额不能为负数",
    renewalDate: "请选择续保时间",
    paymentYears: "总缴费年限建议填写数字或“已缴清”",
    coverageAmount: "保额不能为负数",
    note: "备注不能超过 100 字",
  },
);

assert.deepEqual(
  validatePolicyForm({
    name: "百万医疗险",
    company: "中国平安",
    insuredPerson: "本人",
    category: "医疗",
    premiumAmount: "980",
    renewalDate: "2026-12-01",
    paymentYears: "20年",
    coverageAmount: "2000000",
    note: "年度续保",
  }),
  {},
);
