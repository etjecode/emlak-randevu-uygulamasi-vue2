<template>
  <div class="p-6">
    <FilterBar :agents="agents" @change="onFiltersChange" />

    <div v-if="filteredAndSortedAppointments.length > 0"
      class="mb-4 flex items-center justify-between border-b-2 border-gray-200 border-t-4 p-4">
      <div>
        {{ filteredAndSortedAppointments.length }}
        {{ filteredAndSortedAppointments.length === 1 ? 'Appointment' : 'Appointments' }} found.
      </div>
      <button
        @click="openCreate"
        class="flex items-center gap-2 rounded-lg bg-pink-500 px-4 py-2 font-semibold text-white hover:bg-pink-600"
      >
        <i class="fa-solid fa-circle-plus"></i>
        Create Appointment
      </button>
    </div>

    <AppointmentList
      :appointments="filteredAndSortedAppointments"
      @edit="openEdit"
    />

    <CreateAppointmentModal
      :show="showCreateModal"
      @close="closeCreate"
      @submit="onCreated"
    />

    <EditAppointmentModal
      :show="showEditModal"
      :appointment="selectedAppointment"
      :all-appointments="appointments"
      @close="closeEdit"
      @saved="onSaved"
    />
  </div>
</template>

<script>
import FilterBar from '@/components/FilterBar.vue'
import AppointmentList from '@/components/AppointmentList.vue'
import { fetchAllForHome } from '@/services/airtable'
import EditAppointmentModal from "@/components/EditAppointmentModal.vue"
import CreateAppointmentModal from '@/components/CreateAppointmentModal.vue'

export default {
  name: 'HomeView',
  components: { FilterBar, AppointmentList, EditAppointmentModal, CreateAppointmentModal },
  data() {
    return {
      appointments: [],
      agents: [],
      filters: {
        status: 'All Statuses',
        from: '',
        to: '',
        search: '',
        agents: [],
      },
      showEditModal: false,
      selectedAppointment: null,
      showCreateModal: false,
    }
  },
  async mounted() {
    try {
      const { appointments, agents } = await fetchAllForHome()
      this.appointments = appointments
      this.agents = agents
    } catch (e) {
      console.error("[HomeView] fetchAllForHome failed:", e)
    }
  },
  methods: {
    onFiltersChange(f) {
      this.filters = { ...this.filters, ...f }
    },
    // Create
    openCreate() { this.showCreateModal = true },
    closeCreate() { this.showCreateModal = false },
    onCreated(created) {
      if (created && created.id) {
        this.appointments = [{ ...created }, ...this.appointments]
      }
      this.closeCreate()
    },
    // Edit
    openEdit(ap) {
      this.selectedAppointment = ap
      this.showEditModal = true
    },
    closeEdit() {
      this.showEditModal = false
      this.selectedAppointment = null
    },
    onSaved(updated) {
      const i = this.appointments.findIndex(a => a.id === updated.id)
      if (i !== -1) this.$set(this.appointments, i, { ...this.appointments[i], ...updated })
    },
    _safeLower(v) { return (v ?? "").toString().toLowerCase() },
    _parseLocalDateTime(s) {
      if (!s) return null
      const d = new Date(s)
      return isNaN(d) ? null : d
    }
  },
  computed: {
    filteredAndSortedAppointments() {
      const now = new Date()
      const f = this.filters
      const from = this._parseLocalDateTime(f.from)
      const to = this._parseLocalDateTime(f.to)
      const MS_PER_DAY = 86400000

      // status + countdown (label) enrichment
      let list = (this.appointments || []).map(ap => {
        const date = ap.appointment_date ? new Date(ap.appointment_date) : null
        const cancelled = !!ap.is_cancelled

        let status = "Upcoming"
        if (cancelled) status = "Cancelled"
        else if (date && date.getTime() < now.getTime()) status = "Completed"

        let countdownLabel = null
        if (!cancelled && date && status === "Upcoming") {
          const diffDays = Math.ceil((date.getTime() - now.getTime()) / MS_PER_DAY)
          if (diffDays <= 0) countdownLabel = "Today"
          else if (diffDays === 1) countdownLabel = "1 day"
          else countdownLabel = `${diffDays} days`
        }

        return { ...ap, status, countdown: countdownLabel }
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

      const q = this._safeLower(f.search).trim()
      if (q) {
        list = list.filter((ap) => {
          const name = this._safeLower(`${ap.contact_name} ${ap.contact_surname}`)
          const email = this._safeLower(ap.contact_email)
          const phone = this._safeLower(ap.contact_phone)
          const addr = this._safeLower(ap.appointment_address)
          return name.includes(q) || email.includes(q) || phone.includes(q) || addr.includes(q)
        })
      }

      list.sort((a, b) => {
        const da = a.appointment_date ? new Date(a.appointment_date).getTime() : 0
        const db = b.appointment_date ? new Date(b.appointment_date).getTime() : 0
        return db - da
      })

      return list
    }
  }
}
</script>
