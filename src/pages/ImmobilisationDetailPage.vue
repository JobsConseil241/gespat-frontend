<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { immosApi, amortissementsApi } from '@/api/endpoints'
import type { Immobilisation } from '@/types'
import { ArrowLeftIcon, QrCodeIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const immo = ref<Immobilisation | null>(null)
const amortissements = ref<any[]>([])
const loading = ref(true)

const fmt = (v: number | string | null) => v == null ? '—' : new Intl.NumberFormat('fr-FR').format(typeof v === 'string' ? parseFloat(v) : v)

onMounted(async () => {
  const id = Number(route.params.id)
  try {
    const { data } = await immosApi.get(id)
    immo.value = data.data

    if (immo.value.date_mise_en_service) {
      const { data: amort } = await amortissementsApi.simuler(id, new Date().getFullYear() + 3)
      amortissements.value = amort.data
    }
  } catch (e) {
    router.push('/immobilisations')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-if="loading" class="text-slate-500">Chargement…</div>

  <div v-else-if="immo">
    <button @click="router.back()" class="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-4">
      <ArrowLeftIcon class="w-4 h-4" /> Retour
    </button>

    <div class="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold">{{ immo.libelle }}</h1>
        <div class="flex items-center gap-2 mt-2">
          <span class="font-mono text-sm bg-slate-100 px-2 py-1 rounded">{{ immo.code_inventaire }}</span>
          <span class="badge-info">{{ immo.categorie?.code }}</span>
          <span class="badge-gray">{{ immo.statut }}</span>
        </div>
      </div>
      <div v-if="immo.qr_payload" class="text-center">
        <div class="text-xs text-slate-500 mb-1">Lien QR</div>
        <code class="text-xs text-slate-700 break-all max-w-xs inline-block">{{ immo.qr_payload }}</code>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <!-- Infos générales -->
        <div class="card p-5">
          <h2 class="text-lg font-semibold mb-4">Informations générales</h2>
          <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt class="text-slate-500">Description</dt>
              <dd class="font-medium">{{ immo.description || '—' }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">Site / Localisation</dt>
              <dd class="font-medium">{{ immo.site?.code }} — {{ immo.localisation?.libelle || 'n/a' }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">Service affectataire</dt>
              <dd class="font-medium">{{ immo.service?.libelle || '—' }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">État physique</dt>
              <dd><span class="badge-gray">{{ immo.etat_physique }}</span></dd>
            </div>
            <div>
              <dt class="text-slate-500">Date d'acquisition</dt>
              <dd class="font-medium">{{ immo.date_acquisition || '—' }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">Mise en service</dt>
              <dd class="font-medium">{{ immo.date_mise_en_service || '—' }}</dd>
            </div>
          </dl>
        </div>

        <!-- Valorisation -->
        <div class="card p-5">
          <h2 class="text-lg font-semibold mb-4">Valorisation comptable</h2>
          <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt class="text-slate-500">Valeur d'acquisition</dt>
              <dd class="text-xl font-bold">{{ fmt(immo.valeur_acquisition) }} {{ immo.devise }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">Méthode d'amortissement</dt>
              <dd class="font-medium">{{ immo.methode_amortissement }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">Durée (mois)</dt>
              <dd class="font-medium">{{ immo.duree_amortissement_mois || '—' }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">Mode d'acquisition</dt>
              <dd class="font-medium">{{ immo.mode_acquisition }}</dd>
            </div>
          </dl>
        </div>

        <!-- Amortissements -->
        <div v-if="amortissements.length > 0" class="card p-5">
          <h2 class="text-lg font-semibold mb-4">Plan d'amortissement (simulation SYSCOHADA)</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Exercice</th>
                <th class="text-right">VNC début</th>
                <th class="text-right">Dotation</th>
                <th class="text-right">Cumul</th>
                <th class="text-right">VNC fin</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in amortissements" :key="row.exercice">
                <td class="font-medium">{{ row.exercice }}</td>
                <td class="text-right tabular-nums">{{ fmt(row.vnc_debut) }}</td>
                <td class="text-right tabular-nums text-amber-700 font-semibold">{{ fmt(row.dotation_exercice) }}</td>
                <td class="text-right tabular-nums">{{ fmt(row.cumul_amortissement_fin) }}</td>
                <td class="text-right tabular-nums text-emerald-700">{{ fmt(row.vnc_fin) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Sidebar : QR code, photos -->
      <div class="space-y-6">
        <div class="card p-5 text-center">
          <QrCodeIcon class="w-32 h-32 mx-auto text-slate-300" />
          <div class="text-xs text-slate-500 mt-2">QR & code-barres disponibles via le module Étiquettes</div>
        </div>

        <div v-if="immo.photos && immo.photos.length > 0" class="card p-5">
          <h3 class="font-semibold mb-3">Photos ({{ immo.photos.length }})</h3>
          <div class="grid grid-cols-2 gap-2">
            <img v-for="p in immo.photos" :key="p.id"
                 :src="`/storage/${p.path}`" :alt="p.legende || ''"
                 class="rounded border border-slate-200">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
