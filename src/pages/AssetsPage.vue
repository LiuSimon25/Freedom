<script setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";
import * as echarts from "echarts";
import { Plus, TrendingUp, X } from "lucide-vue-next";
import {
  ASSET_CATEGORY_LABELS,
  getAssetCategoryTotals,
  getAssetSummary,
  getAssetTrend,
} from "../utils/assetCalc";
import { buildMoneyYAxisOptions, buildTrendChartGrid } from "../utils/chartAxis";
import {
  deleteAsset,
  getAssetSnapshots,
  getAssets,
  upsertAsset,
} from "../utils/storage";
import { validateAssetForm } from "../utils/validators";

const assetCategories = ["流动资金", "固定资产", "投资理财", "应收款", "负债"];
const assetCategoryKeys = [
  { label: "流动资金", value: "liquid" },
  { label: "固定资产", value: "fixed" },
  { label: "投资理财", value: "investment" },
  { label: "应收款", value: "receivable" },
  { label: "负债", value: "liability" },
];

const assets = ref([]);
const snapshots = ref([]);
const selectedTrendCategory = ref("liquid");
const selectedYear = ref(2026);
const drawerOpen = ref(false);
const editingAsset = ref(null);
const assetToDelete = ref(null);
const allModalCategory = ref("");
const structureChartRef = ref(null);
const trendChartRef = ref(null);
let structureChart = null;
let trendChart = null;

const form = ref({
  name: "",
  amount: "",
  category: "流动资金",
  date: "2026-06-10",
  note: "",
  moneyBucket: "活钱",
});
const formErrors = ref({});

const summary = computed(() => getAssetSummary(assets.value));
const categoryTotals = computed(() => getAssetCategoryTotals(assets.value));
const hasAssets = computed(() => assets.value.length > 0);
const hasStructureData = computed(() => ["liquid", "fixed", "investment", "receivable"].some((key) => categoryTotals.value[key] > 0));
const groupedAssets = computed(() => {
  return assetCategories.map((category) => ({
    category,
    items: assets.value.filter((asset) => asset.category === category).slice(0, 3),
  }));
});
const modalAssets = computed(() => assets.value.filter((asset) => asset.category === allModalCategory.value));
const trendValues = computed(() => getAssetTrend(snapshots.value, selectedYear.value, selectedTrendCategory.value));
const hasTrendData = computed(() => trendValues.value.some((value) => value > 0));

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function compactCurrency(value) {
  return Number(value || 0).toLocaleString("zh-CN", { maximumFractionDigits: 0 });
}

function openAddDrawer(category = "流动资金") {
  editingAsset.value = null;
  formErrors.value = {};
  form.value = {
    name: "",
    amount: "",
    category,
    date: "2026-06-10",
    note: "",
    moneyBucket: category === "负债" ? "不纳入配置" : "活钱",
  };
  drawerOpen.value = true;
}

function openEditDrawer(asset) {
  editingAsset.value = asset;
  formErrors.value = {};
  form.value = {
    name: asset.name,
    amount: asset.amount,
    category: asset.category,
    date: asset.date,
    note: asset.note || "",
    moneyBucket: asset.moneyBucket || "活钱",
  };
  drawerOpen.value = true;
}

function closeDrawer() {
  drawerOpen.value = false;
  formErrors.value = {};
}

function saveAsset() {
  formErrors.value = validateAssetForm(form.value);
  if (Object.keys(formErrors.value).length > 0) {
    return;
  }

  const result = upsertAsset({
    id: editingAsset.value?.id,
    name: form.value.name.trim(),
    amount: Number(form.value.amount),
    category: form.value.category,
    date: form.value.date,
    note: form.value.note.trim(),
    moneyBucket: form.value.category === "负债" ? undefined : form.value.moneyBucket,
  });
  assets.value = result.assets;
  snapshots.value = result.snapshots;
  closeDrawer();
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

function handleCategoryChange() {
  clearFieldError("category");
  if (form.value.category === "负债") {
    form.value.moneyBucket = "不纳入配置";
    clearFieldError("moneyBucket");
  } else if (form.value.moneyBucket === "不纳入配置") {
    form.value.moneyBucket = "活钱";
  }
}

function removeAsset(asset) {
  assetToDelete.value = asset;
}

function confirmDeleteAsset() {
  if (!assetToDelete.value) {
    return;
  }

  const result = deleteAsset(assetToDelete.value.id);
  assets.value = result.assets;
  snapshots.value = result.snapshots;
  assetToDelete.value = null;
}

function closeDeleteConfirm() {
  assetToDelete.value = null;
}

function openAllModal(category) {
  allModalCategory.value = category;
}

function closeAllModal() {
  allModalCategory.value = "";
}

function handleDataCleared() {
  assets.value = [];
  snapshots.value = [];
  assetToDelete.value = null;
  closeAllModal();
}

function renderStructureChart() {
  if (!structureChartRef.value || !hasStructureData.value) {
    return;
  }

  structureChart = structureChart || echarts.init(structureChartRef.value);
  const data = [
    { name: "流动资金", value: categoryTotals.value.liquid },
    { name: "固定资产", value: categoryTotals.value.fixed },
    { name: "投资理财", value: categoryTotals.value.investment },
    { name: "应收款", value: categoryTotals.value.receivable },
  ].filter((item) => item.value > 0);

  structureChart.setOption({
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "#121317",
      borderColor: "#2e3038",
      textStyle: { color: "#e2e3e9" },
    },
    color: ["#f0c27b", "#ae9357", "#cc9166", "#777a88"],
    series: [
      {
        type: "pie",
        radius: ["48%", "76%"],
        center: ["48%", "50%"],
        label: { show: false },
        labelLine: { show: false },
        data,
      },
    ],
  });
}

function renderTrendChart() {
  if (!trendChartRef.value || !hasTrendData.value) {
    return;
  }

  trendChart = trendChart || echarts.init(trendChartRef.value);
  trendChart.setOption({
    backgroundColor: "transparent",
    color: ["#f0c27b"],
    tooltip: {
      trigger: "axis",
      backgroundColor: "#121317",
      borderColor: "#2e3038",
      textStyle: { color: "#e2e3e9" },
    },
    grid: buildTrendChartGrid(28, 28),
    xAxis: {
      type: "category",
      data: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
      axisLine: { lineStyle: { color: "#2e3038" } },
      axisTick: { show: false },
      axisLabel: { color: "#777a88" },
    },
    yAxis: buildMoneyYAxisOptions([trendValues.value]),
    series: [
      {
        name: ASSET_CATEGORY_LABELS[selectedTrendCategory.value],
        type: "line",
        smooth: true,
        symbolSize: 5,
        data: trendValues.value,
      },
    ],
  });
}

function renderCharts() {
  nextTick(() => {
    renderStructureChart();
    renderTrendChart();
  });
}

watch([assets, snapshots, selectedTrendCategory, selectedYear], renderCharts, { deep: true });

onMounted(() => {
  assets.value = getAssets();
  snapshots.value = getAssetSnapshots();
  renderCharts();
  window.addEventListener("freedom-data-cleared", handleDataCleared);
  window.addEventListener("resize", () => {
    structureChart?.resize();
    trendChart?.resize();
  });
});
</script>

<template>
  <section class="assets-page">
    <header class="page-header compact-header">
      <div class="asset-actions">
        <button class="primary-button" type="button" @click="openAddDrawer()">
          <Plus :size="16" aria-hidden="true" />
          新增
        </button>
      </div>
    </header>

    <div class="asset-summary-grid">
      <article class="metric-card">
        <span>总资产（元）</span>
        <strong>{{ formatCurrency(summary.totalAssets) }}</strong>
      </article>
      <article class="metric-card">
        <span>净资产（元）</span>
        <strong>{{ formatCurrency(summary.netAssets) }}</strong>
      </article>
      <article class="metric-card ratio-card">
        <span>资产负债率</span>
        <strong>{{ summary.liabilityRatio.toFixed(2) }}%</strong>
        <div class="ratio-icon"><TrendingUp :size="34" aria-hidden="true" /></div>
      </article>
    </div>

    <div class="asset-chart-grid">
      <section class="panel asset-structure-panel">
        <h2>资产结构</h2>
        <div class="asset-structure-content">
          <div v-show="hasStructureData" ref="structureChartRef" class="asset-structure-chart"></div>
          <div v-if="!hasStructureData" class="empty-state rich-empty chart-empty asset-chart-empty">
            <strong>暂无资产结构</strong>
            <span>新增现金、投资或固定资产后，这里会生成资产结构环图。</span>
            <button class="empty-action" type="button" @click="openAddDrawer()">新增资产</button>
          </div>
          <div v-if="hasStructureData" class="asset-structure-list">
            <div v-for="item in assetCategoryKeys" :key="item.value">
              <span></span>
              <em>{{ item.label }}</em>
              <strong>{{ compactCurrency(categoryTotals[item.value]) }}</strong>
            </div>
          </div>
        </div>
      </section>

      <section class="panel asset-trend-panel">
        <div class="panel-title-row">
          <h2>资产变化趋势</h2>
          <div class="asset-selects">
            <select v-model="selectedTrendCategory" class="year-select">
              <option v-for="item in assetCategoryKeys" :key="item.value" :value="item.value">{{ item.label }}</option>
            </select>
            <select v-model.number="selectedYear" class="year-select">
              <option :value="2025">2025年</option>
              <option :value="2026">2026年</option>
              <option :value="2027">2027年</option>
            </select>
          </div>
        </div>
        <div v-show="hasTrendData" ref="trendChartRef" class="asset-trend-chart"></div>
        <div v-if="!hasTrendData" class="empty-state rich-empty chart-empty">
          <strong>暂无资产变化趋势</strong>
          <span>保存资产或负债记录后，系统会按月份沉淀趋势数据。</span>
        </div>
      </section>
    </div>

    <div v-if="!hasAssets" class="empty-state rich-empty page-empty">
      <strong>还没有资产数据</strong>
      <span>先录入现金账户、投资理财、固定资产或负债，资产页会自动生成汇总、结构和趋势。</span>
      <button class="empty-action" type="button" @click="openAddDrawer()">新增第一笔资产</button>
    </div>

    <div class="asset-detail-grid">
      <section v-for="group in groupedAssets" :key="group.category" class="panel asset-list-card">
        <div class="asset-list-title">
          <h2>{{ group.category }}</h2>
          <button type="button" @click="openAddDrawer(group.category)">+</button>
        </div>
        <div class="asset-list-head">
          <span>项目（元）</span>
          <span>金额（元）</span>
        </div>
        <button
          v-for="asset in group.items"
          :key="asset.id"
          class="asset-row"
          type="button"
          @click="openEditDrawer(asset)"
        >
          <span>{{ asset.name }}</span>
          <strong>{{ formatCurrency(asset.amount) }}</strong>
        </button>
        <div v-if="group.items.length === 0" class="empty-state rich-empty asset-list-empty">
          <strong>暂无{{ group.category }}</strong>
          <span>{{ group.category === "负债" ? "可录入房贷、信用卡或其他负债。" : "点击右上角 + 添加该类资产。" }}</span>
        </div>
        <a v-else href="#" class="view-all" @click.prevent="openAllModal(group.category)">查看全部</a>
      </section>
    </div>

    <div v-if="drawerOpen" class="drawer-backdrop" @click.self="closeDrawer">
      <aside class="drawer">
        <div class="drawer-header">
          <h2>{{ editingAsset ? "编辑资产" : "新增资产 / 负债" }}</h2>
          <button type="button" @click="closeDrawer"><X :size="18" aria-hidden="true" /></button>
        </div>
        <form class="drawer-form" @submit.prevent="saveAsset">
          <label>
            <span>名称</span>
            <input
              v-model="form.name"
              :class="{ invalid: formErrors.name }"
              type="text"
              placeholder="例如：现金账户、房贷"
              @input="clearFieldError('name')"
            />
            <em class="field-error" :class="{ empty: !formErrors.name }">{{ formErrors.name || "占位" }}</em>
          </label>
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
            <select v-model="form.category" :class="{ invalid: formErrors.category }" @change="handleCategoryChange">
              <option v-for="category in assetCategories" :key="category" :value="category">{{ category }}</option>
            </select>
            <em class="field-error" :class="{ empty: !formErrors.category }">{{ formErrors.category || "占位" }}</em>
          </label>
          <label>
            <span>日期</span>
            <input v-model="form.date" :class="{ invalid: formErrors.date }" type="date" @input="clearFieldError('date')" />
            <em class="field-error" :class="{ empty: !formErrors.date }">{{ formErrors.date || "占位" }}</em>
          </label>
          <label v-if="form.category !== '负债'">
            <span>三笔钱归属</span>
            <select v-model="form.moneyBucket" :class="{ invalid: formErrors.moneyBucket }" @change="clearFieldError('moneyBucket')">
              <option>活钱</option>
              <option>短期</option>
              <option>长期</option>
              <option>不纳入配置</option>
            </select>
            <em class="field-error" :class="{ empty: !formErrors.moneyBucket }">{{ formErrors.moneyBucket || "占位" }}</em>
          </label>
          <label>
            <span>备注</span>
            <textarea
              v-model="form.note"
              :class="{ invalid: formErrors.note }"
              rows="4"
              maxlength="90"
              placeholder="可选"
              @input="clearFieldError('note')"
            ></textarea>
            <em class="field-error" :class="{ empty: !formErrors.note }">{{ formErrors.note || "占位" }}</em>
          </label>
          <div class="drawer-footer">
            <button class="secondary-button" type="button" @click="closeDrawer">取消</button>
            <button class="primary-button" type="submit">保存</button>
          </div>
        </form>
      </aside>
    </div>

    <div v-if="allModalCategory" class="modal-backdrop" @click.self="closeAllModal">
      <section class="modal-card" role="dialog" aria-modal="true">
        <button class="modal-close" type="button" aria-label="关闭" @click="closeAllModal">
          <X :size="18" aria-hidden="true" />
        </button>
        <h2>{{ allModalCategory }}全部明细</h2>
        <div class="modal-body">
          <table class="modal-table">
            <thead><tr><th>名称</th><th>金额</th><th>日期</th><th>备注</th><th>删除</th></tr></thead>
            <tbody>
              <tr v-for="asset in modalAssets" :key="asset.id">
                <td>{{ asset.name }}</td>
                <td>{{ formatCurrency(asset.amount) }}</td>
                <td>{{ asset.date }}</td>
                <td>{{ asset.note || "-" }}</td>
                <td><button class="modal-delete" type="button" @click="removeAsset(asset)">删除</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <div v-if="assetToDelete" class="modal-backdrop" @click.self="closeDeleteConfirm">
      <section class="modal-card confirm-modal" role="dialog" aria-modal="true">
        <button class="modal-close" type="button" aria-label="关闭" @click="closeDeleteConfirm">
          <X :size="18" aria-hidden="true" />
        </button>
        <h2>确认删除这条资产？</h2>
        <p>删除后该资产信息将无法恢复。</p>
        <div class="modal-actions">
          <button class="secondary-button" type="button" @click="closeDeleteConfirm">取消</button>
          <button class="primary-button danger-button" type="button" @click="confirmDeleteAsset">确认删除</button>
        </div>
      </section>
    </div>
  </section>
</template>
