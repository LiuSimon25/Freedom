<script setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";
import * as echarts from "echarts";
import { BriefcaseBusiness, HeartPulse, Plus, Shield, ShieldCheck, TriangleAlert, X } from "lucide-vue-next";
import { getBucketSummary, getBucketTrendFromSnapshots, getInsuranceCategoryStats, INSURANCE_CATEGORIES, MONEY_BUCKETS } from "../utils/configCalc";
import {
  deletePolicy,
  getAssetSnapshots,
  getAssets,
  getPolicies,
  saveAssetBuckets,
  upsertPolicy,
} from "../utils/storage";
import { validatePolicyForm } from "../utils/validators";

const assets = ref([]);
const snapshots = ref([]);
const policies = ref([]);
const selectedYear = ref(2026);
const policyDrawerOpen = ref(false);
const bucketDrawerOpen = ref(false);
const editingPolicy = ref(null);
const policyToDelete = ref(null);
const policyListModalOpen = ref(false);
const trendChartRef = ref(null);
let trendChart = null;

const policyForm = ref({
  name: "",
  company: "",
  insuredPerson: "本人",
  category: "医疗",
  premiumAmount: "",
  paymentType: "年度缴费",
  isPaidOff: false,
  renewalDate: "2026-12-01",
  paymentYears: "",
  coverageAmount: "",
  note: "",
});
const policyErrors = ref({});

const bucketDraft = ref([]);

const bucketSummary = computed(() => getBucketSummary(assets.value));
const insuranceStats = computed(() => getInsuranceCategoryStats(policies.value));
const bucketTrend = computed(() => getBucketTrendFromSnapshots(snapshots.value, selectedYear.value));
const policyPreview = computed(() => policies.value.slice(0, 4));
const hasBucketAssets = computed(() => assets.value.some((asset) => asset.category !== "负债"));
const hasBucketTrendData = computed(() => MONEY_BUCKETS.some((bucket) => bucketTrend.value[bucket].some((value) => value > 0)));
const hasPolicies = computed(() => policies.value.length > 0);

const insuranceCards = computed(() => [
  { category: "医疗", icon: HeartPulse },
  { category: "意外", icon: TriangleAlert },
  { category: "寿险", icon: BriefcaseBusiness },
  { category: "重疾", icon: ShieldCheck },
]);

function formatCurrency(value) {
  return `¥${Number(value || 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function openBucketDrawer() {
  bucketDraft.value = assets.value
    .filter((asset) => asset.category !== "负债")
    .map((asset) => ({ id: asset.id, name: asset.name, amount: asset.amount, moneyBucket: asset.moneyBucket || "不纳入配置" }));
  bucketDrawerOpen.value = true;
}

function saveBuckets() {
  const result = saveAssetBuckets(bucketDraft.value);
  assets.value = result.assets;
  snapshots.value = result.snapshots;
  bucketDrawerOpen.value = false;
}

function openPolicyDrawer(policy = null) {
  editingPolicy.value = policy;
  policyErrors.value = {};
  policyForm.value = policy
    ? { ...policy }
    : {
        name: "",
        company: "",
        insuredPerson: "本人",
        category: "医疗",
        premiumAmount: "",
        paymentType: "年度缴费",
        isPaidOff: false,
        renewalDate: "2026-12-01",
        paymentYears: "",
        coverageAmount: "",
        note: "",
      };
  policyDrawerOpen.value = true;
}

function savePolicy() {
  policyErrors.value = validatePolicyForm(policyForm.value);
  if (Object.keys(policyErrors.value).length > 0) {
    return;
  }
  policies.value = upsertPolicy({
    ...policyForm.value,
    id: editingPolicy.value?.id,
    premiumAmount: Number(policyForm.value.premiumAmount || 0),
    coverageAmount: Number(policyForm.value.coverageAmount || 0),
  });
  policyDrawerOpen.value = false;
  policyErrors.value = {};
}

function closePolicyDrawer() {
  policyDrawerOpen.value = false;
  policyErrors.value = {};
}

function clearPolicyError(field) {
  if (!policyErrors.value[field]) {
    return;
  }

  policyErrors.value = {
    ...policyErrors.value,
    [field]: "",
  };
}

function removePolicy(policy) {
  policyToDelete.value = policy;
}

function confirmDeletePolicy() {
  if (!policyToDelete.value) {
    return;
  }
  policies.value = deletePolicy(policyToDelete.value.id);
  policyToDelete.value = null;
}

function handleDataCleared() {
  assets.value = [];
  snapshots.value = [];
  policies.value = [];
  policyListModalOpen.value = false;
  policyToDelete.value = null;
  trendChart?.clear();
}

function closePolicyListModal() {
  policyListModalOpen.value = false;
}

function openPolicyListModal() {
  policyListModalOpen.value = true;
}

function renderTrendChart() {
  if (!trendChartRef.value || !hasBucketTrendData.value) {
    trendChart?.clear();
    return;
  }

  trendChart = trendChart || echarts.init(trendChartRef.value);
  trendChart.setOption({
    backgroundColor: "transparent",
    color: ["#f0c27b", "#cc9166", "#777a88"],
    tooltip: {
      trigger: "axis",
      backgroundColor: "#121317",
      borderColor: "#2e3038",
      textStyle: { color: "#e2e3e9" },
    },
    legend: {
      top: 0,
      left: 0,
      textStyle: { color: "#acafb9" },
      itemWidth: 20,
      itemHeight: 4,
    },
    grid: { left: 42, right: 18, top: 42, bottom: 30 },
    xAxis: {
      type: "category",
      data: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
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
      { name: "活钱", type: "line", smooth: true, symbolSize: 5, data: bucketTrend.value.活钱 },
      { name: "短期", type: "line", smooth: true, symbolSize: 5, data: bucketTrend.value.短期 },
      { name: "长期", type: "line", smooth: true, symbolSize: 5, data: bucketTrend.value.长期 },
    ],
  });
}

watch([bucketTrend, selectedYear], () => nextTick(renderTrendChart), { deep: true });

onMounted(() => {
  assets.value = getAssets();
  snapshots.value = getAssetSnapshots();
  policies.value = getPolicies();
  nextTick(renderTrendChart);
  window.addEventListener("freedom-data-cleared", handleDataCleared);
  window.addEventListener("resize", () => trendChart?.resize());
});
</script>

<template>
  <section class="config-page">
    <div class="config-top-grid">
      <section class="panel bucket-panel">
        <div class="panel-title-row">
          <h2>三笔钱配置</h2>
          <button class="secondary-button" type="button" @click="openBucketDrawer">
            <Shield :size="16" aria-hidden="true" />
            管理三笔钱
          </button>
        </div>
        <div class="bucket-bars">
          <article v-for="bucket in MONEY_BUCKETS" :key="bucket" class="bucket-item">
            <h3>{{ bucket }}</h3>
            <p>{{ bucket === "活钱" ? "1年以内" : bucket === "短期" ? "1-5年" : "5年以上" }}</p>
            <span>{{ bucketSummary[bucket].percentage.toFixed(0) }}%</span>
            <strong>{{ formatCurrency(bucketSummary[bucket].amount) }}</strong>
            <div class="bar-wrap">
              <i :style="{ height: `${Math.max(bucketSummary[bucket].percentage, 8)}%` }"></i>
            </div>
          </article>
        </div>
        <div v-if="!hasBucketAssets" class="empty-state rich-empty bucket-empty">
          <strong>暂无可配置资产</strong>
          <span>先在资产页新增非负债资产，再回到这里分配到活钱、短期、长期三笔钱。</span>
        </div>
      </section>

      <section class="panel insurance-panel">
        <h2>保险管理</h2>
        <div class="insurance-category-grid">
          <article v-for="card in insuranceCards" :key="card.category">
            <div class="insurance-icon">
              <component :is="card.icon" :size="24" aria-hidden="true" />
            </div>
            <div>
              <strong>{{ card.category }}</strong>
              <span>{{ insuranceStats[card.category] }}份保单</span>
            </div>
          </article>
        </div>
        <button class="insurance-add" type="button" @click="openPolicyDrawer()">
          <Plus :size="16" aria-hidden="true" />
          录入保单
        </button>
      </section>
    </div>

    <div class="config-bottom-grid">
      <section class="panel bucket-trend-panel">
        <div class="panel-title-row">
          <h2>三笔钱变化趋势图</h2>
          <select v-model.number="selectedYear" class="year-select">
            <option :value="2025">2025年</option>
            <option :value="2026">2026年</option>
            <option :value="2027">2027年</option>
          </select>
        </div>
        <div v-show="hasBucketTrendData" ref="trendChartRef" class="bucket-trend-chart"></div>
        <div v-if="!hasBucketTrendData" class="empty-state rich-empty chart-empty">
          <strong>暂无三笔钱趋势</strong>
          <span>完成资产归属配置后，趋势图会按月份显示活钱、短期、长期变化。</span>
        </div>
      </section>

      <section class="panel policies-panel">
        <div class="panel-title-row">
          <h2>保单列表</h2>
          <a v-if="hasPolicies" href="#" class="view-all" @click.prevent="openPolicyListModal">查看全部</a>
        </div>
        <div v-if="hasPolicies" class="policy-list">
          <div v-for="policy in policyPreview" :key="policy.id" class="policy-row">
            <button class="policy-main" type="button" @click="openPolicyDrawer(policy)">
              <span class="policy-icon"><ShieldCheck :size="18" aria-hidden="true" /></span>
              <span>
                <strong>{{ policy.name }}</strong>
                <em>{{ policy.company }} ｜ {{ policy.insuredPerson }} ｜ {{ policy.renewalDate }}续保</em>
              </span>
            </button>
            <button class="policy-delete" type="button" @click.stop="removePolicy(policy)">删除</button>
          </div>
        </div>
        <div v-else class="empty-state rich-empty policy-empty">
          <strong>还没有保单</strong>
          <span>录入医疗、意外、寿险或重疾保单后，这里会显示续保和保障信息。</span>
          <button class="empty-action" type="button" @click="openPolicyDrawer()">录入保单</button>
        </div>
      </section>
    </div>

    <div v-if="bucketDrawerOpen" class="drawer-backdrop" @click.self="bucketDrawerOpen = false">
      <aside class="drawer">
        <div class="drawer-header">
          <h2>管理三笔钱</h2>
          <button type="button" @click="bucketDrawerOpen = false"><X :size="18" aria-hidden="true" /></button>
        </div>
        <div v-if="bucketDraft.length > 0" class="bucket-drawer-list">
          <label v-for="asset in bucketDraft" :key="asset.id">
            <span>
              <strong>{{ asset.name }}</strong>
              <em>{{ formatCurrency(asset.amount) }}</em>
            </span>
            <select v-model="asset.moneyBucket">
              <option>活钱</option>
              <option>短期</option>
              <option>长期</option>
              <option>不纳入配置</option>
            </select>
          </label>
        </div>
        <div v-else class="empty-state rich-empty drawer-empty">
          <strong>暂无可配置资产</strong>
          <span>资产页新增非负债资产后，可以在这里设置三笔钱归属。</span>
        </div>
        <div class="drawer-footer">
          <button class="secondary-button" type="button" @click="bucketDrawerOpen = false">取消</button>
          <button class="primary-button" type="button" :disabled="bucketDraft.length === 0" @click="saveBuckets">保存</button>
        </div>
      </aside>
    </div>

    <div v-if="policyDrawerOpen" class="drawer-backdrop" @click.self="closePolicyDrawer">
      <aside class="drawer">
        <div class="drawer-header">
          <h2>{{ editingPolicy ? "编辑保单" : "录入保单" }}</h2>
          <button type="button" @click="closePolicyDrawer"><X :size="18" aria-hidden="true" /></button>
        </div>
        <form class="drawer-form" @submit.prevent="savePolicy">
          <label>
            <span>保险名称</span>
            <input v-model="policyForm.name" :class="{ invalid: policyErrors.name }" type="text" placeholder="例如：百万医疗险" @input="clearPolicyError('name')" />
            <em class="field-error" :class="{ empty: !policyErrors.name }">{{ policyErrors.name || "占位" }}</em>
          </label>
          <label>
            <span>保险公司</span>
            <input v-model="policyForm.company" :class="{ invalid: policyErrors.company }" type="text" placeholder="例如：中国平安" @input="clearPolicyError('company')" />
            <em class="field-error" :class="{ empty: !policyErrors.company }">{{ policyErrors.company || "占位" }}</em>
          </label>
          <label>
            <span>被保险人</span>
            <input v-model="policyForm.insuredPerson" :class="{ invalid: policyErrors.insuredPerson }" type="text" @input="clearPolicyError('insuredPerson')" />
            <em class="field-error" :class="{ empty: !policyErrors.insuredPerson }">{{ policyErrors.insuredPerson || "占位" }}</em>
          </label>
          <label>
            <span>保险分类</span>
            <select v-model="policyForm.category" :class="{ invalid: policyErrors.category }" @change="clearPolicyError('category')">
              <option v-for="category in INSURANCE_CATEGORIES" :key="category">{{ category }}</option>
            </select>
            <em class="field-error" :class="{ empty: !policyErrors.category }">{{ policyErrors.category || "占位" }}</em>
          </label>
          <label>
            <span>缴费金额</span>
            <input v-model="policyForm.premiumAmount" :class="{ invalid: policyErrors.premiumAmount }" type="number" min="0" step="0.01" @input="clearPolicyError('premiumAmount')" />
            <em class="field-error" :class="{ empty: !policyErrors.premiumAmount }">{{ policyErrors.premiumAmount || "占位" }}</em>
          </label>
          <label>
            <span>缴费方式</span>
            <select v-model="policyForm.paymentType"><option>年度缴费</option><option>月度缴费</option><option>一次性缴费</option></select>
            <em class="field-error empty">占位</em>
          </label>
          <label>
            <span>续保时间</span>
            <input v-model="policyForm.renewalDate" :class="{ invalid: policyErrors.renewalDate }" type="date" @input="clearPolicyError('renewalDate')" />
            <em class="field-error" :class="{ empty: !policyErrors.renewalDate }">{{ policyErrors.renewalDate || "占位" }}</em>
          </label>
          <label>
            <span>总缴费年限</span>
            <input v-model="policyForm.paymentYears" :class="{ invalid: policyErrors.paymentYears }" type="text" placeholder="例如：20年 / 已缴清" @input="clearPolicyError('paymentYears')" />
            <em class="field-error" :class="{ empty: !policyErrors.paymentYears }">{{ policyErrors.paymentYears || "占位" }}</em>
          </label>
          <label>
            <span>保额</span>
            <input v-model="policyForm.coverageAmount" :class="{ invalid: policyErrors.coverageAmount }" type="number" min="0" step="0.01" @input="clearPolicyError('coverageAmount')" />
            <em class="field-error" :class="{ empty: !policyErrors.coverageAmount }">{{ policyErrors.coverageAmount || "占位" }}</em>
          </label>
          <label class="checkbox-row"><input v-model="policyForm.isPaidOff" type="checkbox" /> 是否结清</label>
          <label>
            <span>备注</span>
            <textarea v-model="policyForm.note" :class="{ invalid: policyErrors.note }" rows="3" maxlength="110" placeholder="可选" @input="clearPolicyError('note')"></textarea>
            <em class="field-error" :class="{ empty: !policyErrors.note }">{{ policyErrors.note || "占位" }}</em>
          </label>
          <div class="drawer-footer">
            <button class="secondary-button" type="button" @click="closePolicyDrawer">取消</button>
            <button class="primary-button" type="submit">保存保单</button>
          </div>
        </form>
      </aside>
    </div>

    <div v-if="policyListModalOpen" class="modal-backdrop" @click.self="closePolicyListModal">
      <section class="modal-card" role="dialog" aria-modal="true">
        <button class="modal-close" type="button" aria-label="关闭" @click="closePolicyListModal">
          <X :size="18" aria-hidden="true" />
        </button>
        <h2>全部保单</h2>
        <div class="modal-body">
          <table class="modal-table">
            <thead><tr><th>名称</th><th>公司</th><th>被保人</th><th>续保时间</th><th>保费</th><th>删除</th></tr></thead>
            <tbody>
              <tr v-for="policy in policies" :key="policy.id">
                <td>{{ policy.name }}</td>
                <td>{{ policy.company }}</td>
                <td>{{ policy.insuredPerson }}</td>
                <td>{{ policy.renewalDate }}</td>
                <td>{{ formatCurrency(policy.premiumAmount) }}</td>
                <td><button class="modal-delete" type="button" @click="removePolicy(policy)">删除</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <div v-if="policyToDelete" class="modal-backdrop" @click.self="policyToDelete = null">
      <section class="modal-card confirm-modal" role="dialog" aria-modal="true">
        <button class="modal-close" type="button" aria-label="关闭" @click="policyToDelete = null">
          <X :size="18" aria-hidden="true" />
        </button>
        <h2>确认删除这份保单？</h2>
        <p>删除后该保单信息将无法恢复。</p>
        <div class="modal-actions">
          <button class="secondary-button" type="button" @click="policyToDelete = null">取消</button>
          <button class="primary-button danger-button" type="button" @click="confirmDeletePolicy">确认删除</button>
        </div>
      </section>
    </div>
  </section>
</template>
