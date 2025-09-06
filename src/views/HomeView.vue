<template>
  <div class="p-6 space-y-4">
    <h1 class="text-2xl font-bold">Appointments</h1>

    <div v-if="loading" class="text-gray-500">Loading...</div>
    <div v-else>
      <AppointmentList :appointments="firstTen" />
    </div>
  </div>
</template>

<script>
import { fetchAppointments } from '@/services/airtable'
import AppointmentList from '@/components/AppointmentList.vue'

export default {
  name: 'HomeView',
  components: { AppointmentList },
  data() {
    return {
      loading: true,
      appointments: [],
    }
  },
  computed: {
    firstTen() { return (this.appointments || []).slice(0, 10) },
  },
async mounted() {
  const haveEnv =
    !!import.meta.env.VITE_AIRTABLE_API_KEY &&
    !!import.meta.env.VITE_AIRTABLE_BASE_ID

  if (!haveEnv) {
    console.warn('[HomeView] Missing Airtable env; skipping fetch.')
    this.loading = false
    this.appointments = []
    return
  }

  try {
    const list = await fetchAppointments()
    this.appointments = list
  } catch (e) {
    console.error('[HomeView] fetchAppointments failed:', e)
    this.appointments = []
  } finally {
    this.loading = false
  }
}
}
</script>
