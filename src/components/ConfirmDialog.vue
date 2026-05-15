<script setup lang="ts">
const props = defineProps<{
  open: boolean
  title?: string
  message: string
  confirmLabel?: string
  variant?: 'danger' | 'primary'
}>()
const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
         @click.self="emit('cancel')">
      <div class="card w-full max-w-md p-6">
        <h3 class="text-lg font-semibold">{{ props.title ?? 'Confirmation' }}</h3>
        <p class="mt-2 text-slate-600 text-sm">{{ props.message }}</p>
        <div class="mt-6 flex justify-end gap-2">
          <button class="btn-secondary" @click="emit('cancel')">Annuler</button>
          <button :class="props.variant === 'danger' ? 'btn-danger' : 'btn-primary'"
                  @click="emit('confirm')">
            {{ props.confirmLabel ?? 'Confirmer' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
