<script setup lang="ts">
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, DoughnutController, BarController, Title } from 'chart.js'
import { Doughnut, Bar } from 'vue-chartjs'
import { computed } from 'vue'

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, DoughnutController, BarController, Title)

const props = defineProps<{
  type: 'doughnut' | 'bar'
  labels: string[]
  datasets: Array<{ label?: string; data: number[]; backgroundColor?: string | string[] }>
  title?: string
}>()

const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.datasets,
}))

const options = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' as const, labels: { font: { size: 11 } } },
    title: props.title ? { display: true, text: props.title } : undefined,
  },
  scales: props.type === 'bar' ? {
    y: { beginAtZero: true, ticks: { font: { size: 11 } } },
    x: { ticks: { font: { size: 11 } } },
  } : undefined,
}))
</script>

<template>
  <div class="relative" style="height: 280px">
    <Doughnut v-if="type === 'doughnut'" :data="chartData" :options="options as any" />
    <Bar v-else :data="chartData" :options="options as any" />
  </div>
</template>
