<script setup lang="ts">
const props = defineProps<{
  meta: { current_page?: number; last_page?: number; total?: number; per_page?: number } | null
}>()

const emit = defineEmits<{ change: [page: number] }>()

const change = (p: number) => emit('change', p)
</script>

<template>
  <div v-if="props.meta && (props.meta.last_page ?? 1) > 1"
       class="flex items-center justify-between mt-4 text-sm">
    <div class="text-slate-500">
      Page {{ props.meta.current_page }} / {{ props.meta.last_page }}
      <span v-if="props.meta.total != null"> · {{ props.meta.total }} éléments</span>
    </div>
    <div class="flex gap-1">
      <button :disabled="(props.meta.current_page ?? 1) <= 1"
              @click="change((props.meta.current_page ?? 1) - 1)"
              class="btn-secondary px-3 py-1">Précédent</button>
      <button :disabled="(props.meta.current_page ?? 1) >= (props.meta.last_page ?? 1)"
              @click="change((props.meta.current_page ?? 1) + 1)"
              class="btn-secondary px-3 py-1">Suivant</button>
    </div>
  </div>
</template>
