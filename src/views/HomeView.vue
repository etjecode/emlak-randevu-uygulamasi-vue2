<template>
  <div class="p-6">
    <FilterBar :agents="agents" @change="onFiltersChange" />

    <div v-if="filteredAndSortedAppointments.length > 0"
         class="mb-4 flex items-center justify-between border-b-2 border-gray-200 border-t-4 p-4">
      {{ filteredAndSortedAppointments.length }}
      {{ filteredAndSortedAppointments.length === 1 ? 'Appointment' : 'Appointments' }} found.
      <button
        @click="openCreate"
        class="flex items-center gap-2 rounded-lg bg-pink-500 px-4 py-2 font-semibold text-white hover:bg-pink-600"
        type="button"
      >
        <i class="fa-solid fa-circle-plus"></i>
        Create Appointment
      </button>
    </div>

    <AppointmentList
      :appointments="filteredAndSortedAppointments"
      :items-per-page="10"
    />

    <CreateAppointmentModal
      :show="isCreateOpen"
      @close="closeCreate"
      @saved="/* TODO: API bağlanınca listeyi yenile */"
    />

  </div>
</template>

<script>
import FilterBar from '@/components/FilterBar.vue'
import AppointmentList from '@/components/AppointmentList.vue'
import { fetchAllForHome } from '@/services/airtable'
import { differenceInDays, isBefore } from 'date-fns'
import CreateAppointmentModal from '@/components/CreateAppointmentModal.vue'

export default {
  name: 'HomeView',
  components: { FilterBar, AppointmentList, CreateAppointmentModal },
  data() {
    return {
      allAppointments: [],
      agents: [],
      filters: {
        status: 'All Statuses',
        from: '',
        to: '',
        search: '',
        agents: [],
      },
      isCreateOpen: false,
      isEditOpen: false,
      selectedAppointment: null,
      loading: true,
    }
  },
  async mounted() {
    const haveEnv =
      !!import.meta.env.VITE_AIRTABLE_API_KEY &&
      !!import.meta.env.VITE_AIRTABLE_BASE_ID

    if (!haveEnv) {
      console.warn('[HomeView] Missing Airtable env; skipping fetch.')
      this.loading = false
      return
    }

    const { agents, appointments } = await fetchAllForHome()
    this.allAppointments = appointments
    this.agents = agents
    this.loading = false
  },
  computed: {
    filteredAndSortedAppointments() {
      const now = new Date()
      const f = this.filters

      const from = this.parseLocalDateTime(f.from)
      const to = this.parseLocalDateTime(f.to)

      let list = (this.allAppointments || []).map((ap) => {
        const date = ap.appointment_date ? new Date(ap.appointment_date) : null
        const cancelled = !!ap.is_cancelled

        let status = 'Upcoming'
        if (cancelled) status = 'Cancelled'
        else if (date && isBefore(date, now)) status = 'Completed'

        const countdown = !cancelled && date ? Math.max(0, differenceInDays(date, now)) : null
        return { ...ap, status, countdown }
      })

      if (f.status === 'Cancelled') list = list.filter((ap) => ap.status === 'Cancelled')
      else if (f.status === 'Upcoming') list = list.filter((ap) => ap.status === 'Upcoming')
      else if (f.status === 'Completed') list = list.filter((ap) => ap.status === 'Completed')

      if (f.agents && f.agents.length) {
        const set = new Set(f.agents)
        list = list.filter((ap) => (ap.agent_id || []).some((id) => set.has(id)))
      }

      if (from) list = list.filter((ap) => ap.appointment_date && new Date(ap.appointment_date).getTime() >= from.getTime())
      if (to) list = list.filter((ap) => ap.appointment_date && new Date(ap.appointment_date).getTime() <= to.getTime())

      const q = this.safeLower(f.search).trim()
      if (q) {
        list = list.filter((ap) => {
          const name = this.safeLower(`${ap.contact_name} ${ap.contact_surname}`)
          const email = this.safeLower(ap.contact_email)
          const phone = this.safeLower(ap.contact_phone)
          const addr = this.safeLower(ap.appointment_address)
          return name.includes(q) || email.includes(q) || phone.includes(q) || addr.includes(q)
        })
      }

      list.sort((a, b) => {
        const da = a.appointment_date ? new Date(a.appointment_date).getTime() : 0
        const db = b.appointment_date ? new Date(b.appointment_date).getTime() : 0
        return db - da
      })

      return list
    },
  },
  methods: {
    onFiltersChange(f) {
      this.filters = { ...this.filters, ...f }
    },
    safeLower(v) {
      return (v == null ? '' : String(v)).toLowerCase()
    },
    parseLocalDateTime(s) {
      if (!s) return null
      const d = new Date(s)
      return isNaN(d) ? null : d
    },
    openCreate() { this.isCreateOpen = true },
    closeCreate() { this.isCreateOpen = false },
  }
  }
</script>
