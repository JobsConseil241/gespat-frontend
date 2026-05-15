<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">{{ title }}</h1>
      <p v-if="subtitle" class="text-sm text-slate-500 mt-1">{{ subtitle }}</p>
    </div>
    <div class="flex gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
