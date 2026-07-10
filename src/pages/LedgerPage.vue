<script setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";
import * as echarts from "echarts";
import { ChevronLeft, ChevronRight, CalendarDays, X } from "lucide-vue-next";
import { addLedgerRecord, deleteLedgerRecord, deleteLedgerRecordsByCategory, getLedgerRecords } from "../utils/storage";
import {
  getCategoryBreakdown,
  getMonthlyRecords,
  getMonthlySummary,
  getTopExpenseCategories,
  getYearlyTrend,
} from "../utils/financeCalc";
import { validateLedgerForm } from "../utils/validators";

const expenseCategories = ["餐饮", "交通", "购物", "娱乐", "住房", "医疗", "学习", "人情", "其他"];
const incomeCategories = ["工资", "奖金", "副业", "理财收入", "红包", "其他"];

const selectedMonth = ref("2026-06");
const selectedYear = ref(2026);
const recordType = ref("expense");
const records = ref([]);
const form = ref({
  amount: "",
  category: "餐饮",
  date: "2026-06-02",
  note: "",
});
const formErrors = ref({});
const allModal = ref(null);
const pendingDelete = ref(null);

const trendChartRef = ref(null);
const donutChartRef = ref(null);
let trendChart = null;
let donutChart = null;

const activeCategories = computed(() => (recordType.value === "expense" ? expenseCategories : incomeCategories));
const monthRecords = computed(() => getMonthlyRecords(records.value, selectedMonth.value));
const fullExpenseRows = computed(() => monthRecords.value.filter((record) => record.type === "expense"));
const fullIncomeRows = computed(() => monthRecords.value.filter((record) => record.type === "income"));
const expenseRows = computed(() => monthRecords.value.filter((record) => record.type === "expense").slice(0, 5));
const incomeRows = computed(() => monthRecords.value.filter((record) => record.type === "income").slice(0, 5));
const summary = computed(() => getMonthlySummary(records.value, selectedMonth.value));
const topExpenses = computed(() => getTopExpenseCategories(records.value, selectedMonth.value, 5));
const allTopExpenses = computed(() => getTopExpenseCategories(records.value, selectedMonth.value, Number.MAX_SAFE_INTEGER));
const categoryBreakdown = computed(() => getCategoryBreakdown(records.value, selectedMonth.value));
const yearlyTrend = computed(() => getYearlyTrend(records.value, selectedYear.value));
const hasYearlyTrend = computed(() => yearlyTrend.value.income.some((amount) => amount > 0) || yearlyTrend.value.expense.some((amount) => amount > 0));

const maxTopExpense = computed(() => Math.max(...topExpenses.value.map((item) => item.amount), 1));

const allModalTitle = computed(() => {
  if (allModal.value === "expenses") return "全部支出记录";
  if (allModal.value === "incomes") return "全部收入记录";
  if (allModal.value === "ranking") return "全部支出分类排行";
  if (allModal.value === "breakdown") return "全部支出分类占比";
  return "全部内容";
});

function formatCurrency(value) {
  return `¥${Number(value || 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function shortCurrency(value) {
  return `¥${Number(value || 0).toLocaleString("zh-CN", { maximumFractionDigits: 0 })}`;
}

function changeMonth(step) {
  const date = new Date(`${selectedMonth.value}-01T00:00:00`);
  date.setMonth(date.getMonth() + step);
  selectedMonth.value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  form.value.date = `${selectedMonth.value}-02`;
}

function submitRecord() {
  formErrors.value = validateLedgerForm(form.value);
  if (Object.keys(formErrors.value).length > 0) {
    return;
  }

  records.value = addLedgerRecord({
    type: recordType.value,
    amount: Number(form.value.amount),
    category: form.value.category,
    date: form.value.date,
    note: form.value.note.trim(),
  });

  form.value.amount = "";
  form.value.note = "";
  form.value.date = `${selectedMonth.value}-02`;
  formErrors.value = {};
}

function setRecordType(type) {
  recordType.value = type;
  form.value.category = type === "expense" ? "餐饮" : "工资";
  formErrors.value.category = "";
}

function clearFieldError(field) {
  if (!formErrors.value[field]) {
    return;
  }

  formErrors.value = {
    ...formErrors.value,
    [field]: "",
  };
}

function openAllModal(type) {
  allModal.value = type;
}

function closeAllModal() {
  allModal.value = null;
}

function requestDeleteRecord(record) {
  pendingDelete.value = { kind: "record", record };
}

function requestDeleteCategory(category) {
  pendingDelete.value = { kind: "category", category };
}

function closeDeleteConfirm() {
  pendingDelete.value = null;
}

function confirmDelete() {
  if (!pendingDelete.value) {
    return;
  }

  if (pendingDelete.value.kind === "record") {
    records.value = deleteLedgerRecord(pendingDelete.value.record.id);
  }

  if (pendingDelete.value.kind === "category") {
    records.value = deleteLedgerRecordsByCategory({
      type: "expense",
      category: pendingDelete.value.category,
      month: selectedMonth.value,
    });
  }

  pendingDelete.value = null;
}

function handleDataCleared() {
  records.value = [];
  pendingDelete.value = null;
  closeAllModal();
}

function renderTrendChart() {
  if (!trendChartRef.value) {
    return;
  }

  trendChart = trendChart || echarts.init(trendChartRef.value);
  if (!hasYearlyTrend.value) {
    trendChart.clear();
    return;
  }

  trendChart.setOption({
    animation: true,
    backgroundColor: "transparent",
    color: ["#f0c27b", "#777a88"],
    tooltip: {
      trigger: "axis",
      backgroundColor: "#121317",
      borderColor: "#2e3038",
      textStyle: { color: "#e2e3e9" },
    },
    legend: {
      top: 0,
      right: 4,
      textStyle: { color: "#acafb9" },
      itemWidth: 18,
      itemHeight: 3,
    },
    grid: { left: 42, right: 18, top: 42, bottom: 28 },
    xAxis: {
      type: "category",
      data: yearlyTrend.value.labels,
      axisLine: { lineStyle: { color: "#2e3038" } },
      axisTick: { show: false },
      axisLabel: { color: "#777a88" },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#777a88", formatter: (value) => `${value / 1000}k` },
      splitLine: { lineStyle: { color: "#1c1d22" } },
    },
    series: [
      { name: "收入", type: "line", smooth: true, symbolSize: 5, data: yearlyTrend.value.income },
      { name: "支出", type: "line", smooth: true, symbolSize: 5, data: yearlyTrend.value.expense },
    ],
  });
}

function renderDonutChart() {
  if (!donutChartRef.value) {
    return;
  }

  donutChart = donutChart || echarts.init(donutChartRef.value);
  if (categoryBreakdown.value.length === 0) {
    donutChart.clear();
    return;
  }

  donutChart.setOption({
    animation: true,
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "#121317",
      borderColor: "#2e3038",
      textStyle: { color: "#e2e3e9" },
    },
    color: ["#f0c27b", "#cc9166", "#ae9357", "#777a88", "#464853", "#2e3038"],
    series: [
      {
        type: "pie",
        radius: ["52%", "78%"],
        center: ["48%", "50%"],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        data: categoryBreakdown.value.map((item) => ({ name: item.category, value: item.amount })),
      },
    ],
  });
}

function renderCharts() {
  nextTick(() => {
    renderTrendChart();
    renderDonutChart();
  });
}

watch([records, selectedMonth, selectedYear], renderCharts, { deep: true });

onMounted(() => {
  records.value = getLedgerRecords();
  renderCharts();
  window.addEventListener("freedom-data-cleared", handleDataCleared);
  window.addEventListener("resize", () => {
    trendChart?.resize();
    donutChart?.resize();
  });
});
</script>

<template>
  <section class="ledger-page">
    <header class="page-header compact-header">
      <div class="ledger-filters">
        <button class="icon-pill" type="button" aria-label="上个月" @click="changeMonth(-1)">
          <ChevronLeft :size="18" aria-hidden="true" />
        </button>
        <input v-model="selectedMonth" class="month-input" type="month" />
        <button class="icon-pill" type="button" aria-label="下个月" @click="changeMonth(1)">
          <ChevronRight :size="18" aria-hidden="true" />
        </button>
      </div>
    </header>

    <div class="ledger-layout">
      <div class="ledger-main">
        <section class="panel entry-panel">
          <div class="segment-control" aria-label="记账类型">
            <button :class="{ active: recordType === 'expense' }" type="button" @click="setRecordType('expense')">支出</button>
            <button :class="{ active: recordType === 'income' }" type="button" @click="setRecordType('income')">收入</button>
          </div>

          <form class="entry-form" @submit.prevent="submitRecord">
            <label>
              <span>金额</span>
              <input
                v-model="form.amount"
                :class="{ invalid: formErrors.amount }"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                @input="clearFieldError('amount')"
              />
              <em class="field-error" :class="{ empty: !formErrors.amount }">{{ formErrors.amount || "占位" }}</em>
            </label>
            <label>
              <span>分类</span>
              <select v-model="form.category" :class="{ invalid: formErrors.category }" @change="clearFieldError('category')">
                <option v-for="category in activeCategories" :key="category" :value="category">{{ category }}</option>
              </select>
              <em class="field-error" :class="{ empty: !formErrors.category }">{{ formErrors.category || "占位" }}</em>
            </label>
            <label>
              <span>日期</span>
              <span class="date-field">
                <input v-model="form.date" :class="{ invalid: formErrors.date }" type="date" @input="clearFieldError('date')" />
                <CalendarDays :size="16" aria-hidden="true" />
              </span>
              <em class="field-error" :class="{ empty: !formErrors.date }">{{ formErrors.date || "占位" }}</em>
            </label>
            <label class="note-field">
              <span>备注（可选）</span>
              <input
                v-model="form.note"
                :class="{ invalid: formErrors.note }"
                type="text"
                maxlength="60"
                placeholder="例如：午餐、房租、工资"
                @input="clearFieldError('note')"
              />
              <em class="field-error" :class="{ empty: !formErrors.note }">{{ formErrors.note || "占位" }}</em>
            </label>
            <button class="primary-button" type="submit">保存记录</button>
          </form>
        </section>

        <div class="detail-grid">
          <section class="panel table-panel">
            <h2>支出明细</h2>
            <table>
              <thead>
                <tr><th>日期</th><th>分类</th><th>金额</th><th>备注</th></tr>
              </thead>
              <tbody>
                <tr v-for="record in expenseRows" :key="record.id">
                  <td>{{ record.date.slice(5) }}</td>
                  <td>{{ record.category }}</td>
                  <td>{{ shortCurrency(record.amount) }}</td>
                  <td>{{ record.note || "-" }}</td>
                </tr>
              </tbody>
            </table>
            <div v-if="expenseRows.length === 0" class="empty-state rich-empty">
              <strong>本月暂无支出记录</strong>
              <span>保存一笔支出后，这里会显示最近 5 条支出明细。</span>
            </div>
            <a v-else class="view-all" href="#" @click.prevent="openAllModal('expenses')">查看全部</a>
          </section>

          <section class="panel table-panel">
            <h2>收入明细</h2>
            <table>
              <thead>
                <tr><th>日期</th><th>分类</th><th>金额</th><th>备注</th></tr>
              </thead>
              <tbody>
                <tr v-for="record in incomeRows" :key="record.id">
                  <td>{{ record.date.slice(5) }}</td>
                  <td>{{ record.category }}</td>
                  <td>{{ shortCurrency(record.amount) }}</td>
                  <td>{{ record.note || "-" }}</td>
                </tr>
              </tbody>
            </table>
            <div v-if="incomeRows.length === 0" class="empty-state rich-empty">
              <strong>本月暂无收入记录</strong>
              <span>保存一笔收入后，这里会显示最近 5 条收入明细。</span>
            </div>
            <a v-else class="view-all" href="#" @click.prevent="openAllModal('incomes')">查看全部</a>
          </section>
        </div>

        <section class="panel chart-panel trend-panel">
          <div class="panel-title-row">
            <h2>年度收支趋势</h2>
            <select v-model.number="selectedYear" class="year-select">
              <option :value="2025">2025年</option>
              <option :value="2026">2026年</option>
              <option :value="2027">2027年</option>
            </select>
          </div>
          <div v-show="hasYearlyTrend" ref="trendChartRef" class="trend-chart"></div>
          <div v-if="!hasYearlyTrend" class="empty-state rich-empty chart-empty">
            <strong>所选年份暂无收支趋势</strong>
            <span>新增该年份的收入或支出后，趋势图会自动生成。</span>
          </div>
        </section>
      </div>

      <aside class="ledger-side">
        <section class="panel summary-panel">
          <h2>本月收支对比</h2>
          <div class="summary-list">
            <div><span class="dot income"></span><span>收入</span><strong>{{ formatCurrency(summary.income) }}</strong></div>
            <div><span class="dot expense"></span><span>支出</span><strong>{{ formatCurrency(summary.expense) }}</strong></div>
            <div><span class="dot balance"></span><span>结余</span><strong>{{ formatCurrency(summary.balance) }}</strong></div>
          </div>
        </section>

        <section class="panel ranking-panel">
          <div class="panel-title-row">
            <h2>支出排行 Top 5</h2>
            <a v-if="topExpenses.length > 0" class="view-all inline-view-all" href="#" @click.prevent="openAllModal('ranking')">查看全部</a>
          </div>
          <div v-if="topExpenses.length > 0" class="ranking-list">
            <div v-for="item in topExpenses" :key="item.category" class="ranking-row">
              <span>{{ item.category }}</span>
              <div class="ranking-track"><i :style="{ width: `${(item.amount / maxTopExpense) * 100}%` }"></i></div>
              <strong>{{ shortCurrency(item.amount) }}</strong>
            </div>
          </div>
          <div v-if="categoryBreakdown.length === 0" class="empty-state rich-empty side-empty">
            <strong>暂无支出排行</strong>
            <span>本月支出会按分类自动排序。</span>
          </div>
        </section>

        <section class="panel donut-panel">
          <div class="panel-title-row">
            <h2>支出分类占比</h2>
            <a v-if="categoryBreakdown.length > 0" class="view-all inline-view-all" href="#" @click.prevent="openAllModal('breakdown')">查看全部</a>
          </div>
          <div v-show="categoryBreakdown.length > 0" class="donut-content">
            <div ref="donutChartRef" class="donut-chart"></div>
            <div class="donut-legend">
              <div v-for="item in categoryBreakdown.slice(0, 5)" :key="item.category">
                <span></span>
                <em>{{ item.category }}</em>
                <strong>{{ item.percentage.toFixed(2) }}%</strong>
              </div>
            </div>
          </div>
          <div v-if="categoryBreakdown.length === 0" class="empty-state rich-empty side-empty">
            <strong>暂无支出占比</strong>
            <span>本月有支出后，会生成黑金风分类环图。</span>
          </div>
        </section>
      </aside>
    </div>

    <div v-if="allModal" class="modal-backdrop" @click.self="closeAllModal">
      <section class="modal-card" role="dialog" aria-modal="true">
        <button class="modal-close" type="button" aria-label="关闭" @click="closeAllModal">
          <X :size="18" aria-hidden="true" />
        </button>
        <h2>{{ allModalTitle }}</h2>

        <div class="modal-body">
          <table v-if="allModal === 'expenses'" class="modal-table">
            <thead><tr><th>日期</th><th>分类</th><th>金额</th><th>备注</th><th>删除</th></tr></thead>
            <tbody>
              <tr v-for="record in fullExpenseRows" :key="record.id">
                <td>{{ record.date }}</td><td>{{ record.category }}</td><td>{{ shortCurrency(record.amount) }}</td><td>{{ record.note || "-" }}</td>
                <td><button class="modal-delete" type="button" @click="requestDeleteRecord(record)">删除</button></td>
              </tr>
            </tbody>
          </table>

          <table v-if="allModal === 'incomes'" class="modal-table">
            <thead><tr><th>日期</th><th>分类</th><th>金额</th><th>备注</th><th>删除</th></tr></thead>
            <tbody>
              <tr v-for="record in fullIncomeRows" :key="record.id">
                <td>{{ record.date }}</td><td>{{ record.category }}</td><td>{{ shortCurrency(record.amount) }}</td><td>{{ record.note || "-" }}</td>
                <td><button class="modal-delete" type="button" @click="requestDeleteRecord(record)">删除</button></td>
              </tr>
            </tbody>
          </table>

          <div v-if="allModal === 'ranking'" class="modal-list">
            <div v-for="item in allTopExpenses" :key="item.category">
              <span>{{ item.category }}</span><strong>{{ shortCurrency(item.amount) }}</strong>
              <button class="modal-delete" type="button" @click="requestDeleteCategory(item.category)">删除</button>
            </div>
          </div>

          <div v-if="allModal === 'breakdown'" class="modal-list">
            <div v-for="item in categoryBreakdown" :key="item.category">
              <span>{{ item.category }}</span><strong>{{ item.percentage.toFixed(2) }}% / {{ shortCurrency(item.amount) }}</strong>
              <button class="modal-delete" type="button" @click="requestDeleteCategory(item.category)">删除</button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div v-if="pendingDelete" class="modal-backdrop" @click.self="closeDeleteConfirm">
      <section class="modal-card confirm-modal" role="dialog" aria-modal="true">
        <button class="modal-close" type="button" aria-label="关闭" @click="closeDeleteConfirm">
          <X :size="18" aria-hidden="true" />
        </button>
        <h2>确认删除这条数据？</h2>
        <p>删除后该数据无法恢复。</p>
        <div class="modal-actions">
          <button class="secondary-button" type="button" @click="closeDeleteConfirm">取消</button>
          <button class="primary-button danger-button" type="button" @click="confirmDelete">确认删除</button>
        </div>
      </section>
    </div>
  </section>
</template>
