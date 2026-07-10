const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function validateLedgerForm(form) {
  const errors = {};
  const amount = Number(form.amount);

  if (form.amount === "" || form.amount === null || form.amount === undefined) {
    errors.amount = "请输入金额";
  } else if (Number.isNaN(amount) || amount <= 0) {
    errors.amount = "金额必须大于 0";
  }

  if (!form.category) {
    errors.category = "请选择分类";
  }

  if (!form.date) {
    errors.date = "请选择日期";
  } else if (!DATE_PATTERN.test(form.date) || Number.isNaN(new Date(`${form.date}T00:00:00`).getTime())) {
    errors.date = "日期格式不正确";
  }

  if ((form.note || "").trim().length > 50) {
    errors.note = "备注不能超过 50 字";
  }

  return errors;
}

export function validateAssetForm(form) {
  const errors = {};
  const amount = Number(form.amount);

  if (!(form.name || "").trim()) {
    errors.name = "请输入名称";
  }

  if (form.amount === "" || form.amount === null || form.amount === undefined) {
    errors.amount = "请输入金额";
  } else if (Number.isNaN(amount) || amount <= 0) {
    errors.amount = "金额必须大于 0";
  }

  if (!form.category) {
    errors.category = "请选择分类";
  }

  if (!form.date) {
    errors.date = "请选择日期";
  } else if (!DATE_PATTERN.test(form.date) || Number.isNaN(new Date(`${form.date}T00:00:00`).getTime())) {
    errors.date = "日期格式不正确";
  }

  if ((form.note || "").trim().length > 80) {
    errors.note = "备注不能超过 80 字";
  }

  if (form.category === "负债" && form.moneyBucket && form.moneyBucket !== "不纳入配置") {
    errors.moneyBucket = "负债不参与三笔钱配置";
  }

  return errors;
}

export function validatePolicyForm(form) {
  const errors = {};
  const premiumAmount = Number(form.premiumAmount || 0);
  const coverageAmount = Number(form.coverageAmount || 0);

  if (!(form.name || "").trim()) {
    errors.name = "请输入保险名称";
  }

  if (!(form.company || "").trim()) {
    errors.company = "请输入保险公司";
  }

  if (!(form.insuredPerson || "").trim()) {
    errors.insuredPerson = "请输入被保险人";
  }

  if (!form.category) {
    errors.category = "请选择保险分类";
  }

  if (Number.isNaN(premiumAmount) || premiumAmount < 0) {
    errors.premiumAmount = "缴费金额不能为负数";
  }

  if (!form.renewalDate) {
    errors.renewalDate = "请选择续保时间";
  } else if (!DATE_PATTERN.test(form.renewalDate) || Number.isNaN(new Date(`${form.renewalDate}T00:00:00`).getTime())) {
    errors.renewalDate = "续保时间格式不正确";
  }

  const paymentYears = (form.paymentYears || "").trim();
  if (paymentYears && !/^\d+\s*年?$/.test(paymentYears) && paymentYears !== "已缴清") {
    errors.paymentYears = "总缴费年限建议填写数字或“已缴清”";
  }

  if (Number.isNaN(coverageAmount) || coverageAmount < 0) {
    errors.coverageAmount = "保额不能为负数";
  }

  if ((form.note || "").trim().length > 100) {
    errors.note = "备注不能超过 100 字";
  }

  return errors;
}
