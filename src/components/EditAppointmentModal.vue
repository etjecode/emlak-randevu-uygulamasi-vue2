<template>
  <BaseModal :show="show" @close="onClose" title="Edit Appointment">
    <!-- HEADER -->
    <template v-slot:header-left>
      <i class="fa-regular fa-calendar text-pink-500 text-xl"></i>
    </template>

    <!-- BODY -->
    <template v-slot:default>
      <div class="-mr-1 pr-1 overflow-y-auto max-h-[70dvh] sm:max-h-[72dvh] md:max-h-[76dvh]">
        <div class="space-y-4">
          <!-- (1) Contact -->
          <SearchContacts
            v-model="selectedContact"
            :prefetched-contacts="contacts"
            label="Contact"
            :show-error="Boolean(error && !form.contact_id.length)"
            error-text="Please select a contact."
            @update:modelValue="onContactChanged"
          />

          <!-- (2) Address -->
          <div class="rounded-xl border bg-white p-4 shadow-md">
            <label class="mb-2 block text-sm font-medium text-gray-700">Address</label>
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-house text-gray-500"></i>
              <input
                v-model="form.appointment_address"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="Street, city…"
              />
              <button
                v-if="form.appointment_address"
                class="text-xs text-gray-500 hover:text-gray-700"
                @click="form.appointment_address = ''"
                aria-label="Clear address"
              >
                ×
              </button>
            </div>
            <p v-if="error && !trimmedAddress" class="mt-2 text-xs text-red-600">
              Address is required.
            </p>
          </div>

          <!-- (3) Agents -->
          <div class="relative rounded-xl border bg-white p-4 shadow-md">
            <label class="mb-2 block text-sm font-medium text-gray-700">Agents</label>

            <!-- Trigger -->
            <button
              ref="agentsTrigger"
              type="button"
              class="flex w-full items-center justify-between rounded-xl border border-gray-300 px-3 py-2.5 text-sm hover:bg-gray-50 focus:border-blue-500 focus:outline-none"
              @click="agentsOpen = !agentsOpen"
              @keydown.escape.stop="agentsOpen = false"
              aria-haspopup="listbox"
              :aria-expanded="agentsOpen ? 'true' : 'false'"
            >
              <div class="flex flex-wrap items-center gap-2 text-left">
                <span v-if="!selectedAgentsDetailed.length" class="text-gray-400">Agent</span>

                <!-- Selected chips -->
                <template v-else>
                  <span
                    v-for="a in selectedAgentsDetailed"
                    :key="a.id"
                    class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1"
                    :style="{
                      borderColor: a.color || '#93C5FD',
                      color: '#1f2937',
                      backgroundColor: 'white',
                      boxShadow: `0 0 0 1px ${a.color || '#93C5FD'} inset`
                    }"
                  >
                    <span class="inline-block h-2 w-2 rounded-full" :style="{ backgroundColor: a.color || '#93C5FD' }"></span>
                    <span class="truncate max-w-[9rem]">{{ a.name }} {{ a.surname }}</span>
                    <button
                      type="button"
                      class="ml-0.5 text-gray-500 hover:text-gray-700"
                      @click.stop="removeAgent(a)"
                      aria-label="Remove agent"
                    >✕</button>
                  </span>
                </template>
              </div>
              <i class="fa-solid fa-chevron-down text-gray-500"></i>
            </button>

            <!-- Dropdown -->
            <div
              v-if="agentsOpen"
              ref="agentsPanel"
              class="absolute z-30 mt-2 w-[calc(100%-2rem)] rounded-xl border border-gray-200 bg-white shadow-xl left-1/2 -translate-x-1/2"
              role="listbox"
            >
              <div class="border-b border-gray-100 p-2">
                <input
                  v-model="agentQuery"
                  type="text"
                  placeholder="Search agent…"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  @keydown.escape.stop="agentsOpen = false"
                />
              </div>
              <ul class="max-h-60 overflow-y-auto py-1">
                <li v-for="a in filteredAgents" :key="a.id" class="px-2">
                  <button
                    type="button"
                    class="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition"
                    @click="toggleAgent(a)"
                    :class="selectedAgentsMap[a.id] ? 'bg-blue-50' : 'hover:bg-gray-50'"
                    :style="selectedAgentsMap[a.id]
                      ? { outline: `2px solid ${a.color || '#3B82F6'}`, outlineOffset: '0', borderColor: a.color || '#3B82F6' }
                      : { borderColor: 'transparent' }"
                  >
                    <span class="inline-block h-2.5 w-2.5 rounded-full ring-2 ring-white" :style="{ backgroundColor: a.color || '#9CA3AF' }"></span>
                    <span class="truncate">{{ a.name }} {{ a.surname }}</span>
                    <i v-if="selectedAgentsMap[a.id]" class="fa-solid fa-check ml-auto" :style="{ color: a.color || '#2563EB' }"></i>
                  </button>
                </li>
                <li v-if="!filteredAgents.length" class="px-3 py-3 text-sm text-gray-500">No agents found.</li>
              </ul>
              <div class="flex items-center justify-between border-t border-gray-100 px-3 py-2">
                <button type="button" class="text-xs text-gray-500 hover:text-gray-700" @click="clearAgents">Clear</button>
                <button type="button" class="rounded-lg bg-pink-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-pink-600" @click="agentsOpen=false">Done</button>
              </div>
            </div>

            <p v-if="error && !form.agent_id.length" class="mt-2 text-xs text-red-600">Pick at least one agent.</p>
          </div>

          <!-- (4) Date & time -->
          <div class="rounded-xl border bg-white p-4 shadow-md">
            <label class="mb-2 block text-sm font-medium text-gray-700">Date & Time</label>
            <div class="flex items-center gap-2">
              <i class="fa-regular fa-calendar text-gray-500"></i>
              <input
                :value="localDateTime"
                @input="onLocalDateInput($event.target.value)"
                type="datetime-local"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <p v-if="error && !form.appointment_date" class="mt-2 text-xs text-red-600">Date & time is required.</p>
          </div>

          <!-- (5) Status -->
          <div class="relative rounded-xl border bg-white p-4 shadow-md">
            <label class="mb-2 block text-sm font-medium text-gray-700">Status</label>

            <button
              ref="statusTrigger"
              type="button"
              class="flex w-full items-center justify-between rounded-xl border border-gray-300 px-3 py-2.5 text-sm hover:bg-gray-50 focus:border-blue-500 focus:outline-none"
              @click="statusOpen = !statusOpen"
              @keydown.escape.stop="statusOpen = false"
            >
              <div class="flex items-center gap-2">
                <span class="inline-block h-2 w-2 rounded-full" :style="{ backgroundColor: statusDotColor }"></span>
                <span class="font-medium">{{ statusUi }}</span>
              </div>
              <i class="fa-solid fa-chevron-down text-gray-500"></i>
            </button>

            <div
              v-if="statusOpen"
              ref="statusPanel"
              class="absolute z-30 mt-2 w-[calc(100%-2rem)] rounded-xl border border-gray-200 bg-white shadow-xl left-1/2 -translate-x-1/2"
            >
              <ul class="py-1 max-h-48 overflow-y-auto">
                <li v-for="opt in statusOptions" :key="opt" class="px-2">
                  <button
                    type="button"
                    class="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-gray-50"
                    @click="setStatus(opt)"
                  >
                    <span class="inline-block h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: statusColorFor(opt) }"></span>
                    <span>{{ opt }}</span>
                    <i v-if="opt === statusUi" class="fa-solid fa-check ml-auto text-gray-600"></i>
                  </button>
                </li>
              </ul>
            </div>

            <p class="mt-1 text-xs text-gray-500">
              Selecting “Cancelled” will set <code>is_cancelled</code> to true.
            </p>
          </div>

          <!-- (6) Related Appointments -->
          <div class="rounded-xl border bg-white p-4 shadow-md">
            <div class="mb-3 font-semibold">Related Appointments</div>
            <div v-if="relatedAppointments.length === 0" class="text-sm text-gray-500">
              No other appointments for this contact.
            </div>

            <div v-else class="mt-3 -mr-1 pr-1 max-h-60 md:max-h-72 overflow-y-auto space-y-2">
              <div v-for="ap in relatedAppointments" :key="ap.id" class="rounded-xl border p-3">
                <div class="flex items-center gap-2 text-sm">
                  <i class="fa-solid fa-house text-gray-500"></i>
                  <span class="font-semibold truncate">{{ ap.appointment_address }}</span>
                </div>

                <div class="mt-2 inline-flex items-center gap-2 rounded-full bg-pink-500 px-2 py-1.5">
                  <div class="inline-flex items-center gap-2 rounded-full bg-white px-2.5 py-1">
                    <span class="text-xs font-semibold">{{ ap.status }}</span>
                    <span v-if="ap.status==='Upcoming' && ap.countdown !== null" class="text-xs font-semibold text-black">
                      · {{ ap.countdown }}d
                    </span>
                  </div>
                  <div class="inline-flex items-center gap-2 rounded-full bg-white px-2.5 py-1">
                    <i class="fa-regular fa-clock text-pink-500"></i>
                    <span class="text-xs font-semibold text-pink-500">{{ formatDate(ap.appointment_date) }}</span>
                  </div>
                  <div class="ml-2 flex -space-x-2">
                    <div
                      v-for="(c, i) in (ap.agent_color || []).slice(0,3)"
                      :key="i"
                      class="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-white"
                      :style="{ backgroundColor: c }"
                    >
                      <span class="text-white">AG</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p v-if="error" class="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {{ error }}
            </p>
          </div>
        </div>
      </div>
    </template>

    <!-- FOOTER -->
    <template v-slot:footer>
      <button @click="onClose" class="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100">
        Close
      </button>
      <!-- API'ye vur ve üst bileşene haber ver -->
      <button @click="emitSave" class="rounded-xl bg-pink-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-pink-600">
        Save
      </button>
    </template>
  </BaseModal>
</template>

<script>
import BaseModal from '@/components/BaseModal.vue'
import SearchContacts from '@/components/SearchContacts.vue'
import { fetchContacts, fetchAgents, updateAppointment } from '@/services/airtable.js'
import { format } from 'date-fns'

export default {
  name: 'EditAppointmentModal',
  components: { BaseModal, SearchContacts },
  props: {
    show: { type: Boolean, default: false },
    appointment: { type: Object, default: () => ({}) },
    allAppointments: { type: Array, default: () => [] },
    prefetchedContacts: { type: Array, default: () => [] },
    prefetchedAgents: { type: Array, default: () => [] },
  },
  data() {
    return {
      form: {
        id: '',
        appointment_address: '',
        appointment_date: '',
        contact_id: [],
        agent_id: [],
        is_cancelled: false,
      },
      contacts: [],
      selectedContact: null,
      agents: [],
      agentsOpen: false,
      agentQuery: '',
      statusOpen: false,
      error: '',
    }
  },
  computed: {
    trimmedAddress() {
      return (this.form.appointment_address || '').trim()
    },
    // datetime-local için: "YYYY-MM-DDTHH:mm" (lokal)
    localDateTime() {
      const iso = this.form.appointment_date
      if (!iso) return ''
      const d = new Date(iso)
      if (isNaN(d)) return ''
      const pad = (n) => String(n).padStart(2, '0')
      const yyyy = d.getFullYear()
      const mm = pad(d.getMonth() + 1)
      const dd = pad(d.getDate())
      const hh = pad(d.getHours())
      const mi = pad(d.getMinutes())
      return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
    },
    statusOptions() {
      const d = this.form.appointment_date ? new Date(this.form.appointment_date) : null
      const past = d ? d.getTime() < Date.now() : false
      return past ? ['Completed', 'Cancelled'] : ['Upcoming', 'Cancelled']
    },
    statusUi: {
      get() {
        if (this.form.is_cancelled) return 'Cancelled'
        const d = this.form.appointment_date ? new Date(this.form.appointment_date) : null
        if (d && d.getTime() < Date.now()) return 'Completed'
        return 'Upcoming'
      },
      set(v) {
        this.form.is_cancelled = v === 'Cancelled'
      },
    },
    statusDotColor() {
      const v = this.statusUi
      if (v === 'Cancelled') return '#EF4444'
      if (v === 'Completed') return '#6B7280'
      return '#10B981'
    },
    statusColorFor() {
      return (v) => {
        if (v === 'Cancelled') return '#EF4444'
        if (v === 'Completed') return '#6B7280'
        return '#10B981'
      }
    },
    filteredAgents() {
      const q = (this.agentQuery || '').toLowerCase().trim()
      const base = [...this.agents].sort((a, b) =>
        `${a.name} ${a.surname}`.localeCompare(`${b.name} ${b.surname}`, undefined, { sensitivity: 'base' })
      )
      if (!q) return base
      return base.filter((a) => `${a.name} ${a.surname}`.toLowerCase().includes(q))
    },
    selectedAgentsMap() {
      const m = {}
      for (const id of this.form.agent_id) m[id] = true
      return m
    },
    selectedAgentsDetailed() {
      const byId = new Map(this.agents.map((a) => [a.id, a]))
      return (this.form.agent_id || []).map((id) => byId.get(id)).filter(Boolean)
    },
    relatedAppointments() {
      const cid = (this.form.contact_id || [])[0]
      if (!cid) return []
      return (this.allAppointments || [])
        .filter((ap) => ap.id !== this.form.id && (ap.contact_id || [])[0] === cid)
        .map((ap) => {
          const date = ap.appointment_date ? new Date(ap.appointment_date) : null
          const cancelled = !!ap.is_cancelled
          let status = 'Upcoming'
          if (cancelled) status = 'Cancelled'
          else if (date && date.getTime() < Date.now()) status = 'Completed'
          const msPerDay = 24 * 60 * 60 * 1000
          const countdown = !cancelled && date ? Math.max(0, Math.ceil((date - Date.now()) / msPerDay)) : null
          return { ...ap, status, countdown }
        })
    },
  },
  watch: {
    show: {
      immediate: true,
      async handler(val) {
        if (val) await this.ensureData()
      },
    },
    appointment: {
      immediate: true,
      handler(ap) {
        this.hydrate(ap)
      },
    },
  },
  mounted() {
    // dropdown kapatma
    this.onDocClick = (e) => {
      if (this.agentsOpen) {
        const t = this.$refs.agentsTrigger, p = this.$refs.agentsPanel
        const inT = t && t.contains(e.target), inP = p && p.contains(e.target)
        if (!inT && !inP) this.agentsOpen = false
      }
      if (this.statusOpen) {
        const t2 = this.$refs.statusTrigger, p2 = this.$refs.statusPanel
        const inT2 = t2 && t2.contains(e.target), inP2 = p2 && p2.contains(e.target)
        if (!inT2 && !inP2) this.statusOpen = false
      }
    }
    document.addEventListener('click', this.onDocClick, true)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.onDocClick, true)
  },
  methods: {
    formatDate(d) {
      try { return format(new Date(d), 'dd/MM/yyyy HH:mm') } catch { return '-' }
    },
    onLocalDateInput(val) {
      if (!val) { this.form.appointment_date = ''; return }
      const d = new Date(val)
      if (!isNaN(d)) this.form.appointment_date = d.toISOString()
    },
    hydrate(ap) {
      if (!ap || !ap.id) return
      this.form = {
        id: ap.id,
        appointment_address: ap.appointment_address || '',
        appointment_date: ap.appointment_date || '',
        contact_id: ap.contact_id || [],
        agent_id: ap.agent_id || [],
        is_cancelled: !!ap.is_cancelled,
      }

      const hasCid = Array.isArray(ap.contact_id) && ap.contact_id.length
      this.selectedContact = hasCid
        ? {
            id: ap.contact_id[0],
            name: Array.isArray(ap.contact_name) ? ap.contact_name[0] : (ap.contact_name || ''),
            surname: Array.isArray(ap.contact_surname) ? ap.contact_surname[0] : (ap.contact_surname || ''),
            email: Array.isArray(ap.contact_email) ? ap.contact_email[0] : (ap.contact_email || ''),
            phone: String(Array.isArray(ap.contact_phone) ? (ap.contact_phone[0] ?? '') : (ap.contact_phone ?? '')),
          }
        : null

      this.error = ''
    },
    async ensureData() {
      // CONTACTS
      if (this.prefetchedContacts.length) {
        this.contacts = this.prefetchedContacts
      } else if (!this.contacts.length) {
        try {
          const c = await fetchContacts()
          this.contacts = c || []
        } catch (e) {
          console.error('[EditModal][contacts] failed:', e)
        }
      }

      // AGENTS
      if (this.prefetchedAgents.length) {
        this.agents = this.prefetchedAgents
      } else if (!this.agents.length) {
        try {
          const a = await fetchAgents()
          this.agents = a || []
        } catch (e) {
          console.error('[EditModal][agents] failed:', e)
        }
      }

      // seçili contact’ı listeden eşle
      if (!this.selectedContact && this.form.contact_id?.length) {
        const c = this.contacts.find((x) => x.id === this.form.contact_id[0])
        if (c) this.selectedContact = c
      }
    },
    onContactChanged(contact) {
      if (contact && contact.id) {
        this.form.contact_id = [contact.id]
      } else {
        this.form.contact_id = []
      }
    },
    toggleAgent(a) {
      const id = a.id
      if (this.selectedAgentsMap[id]) {
        this.form.agent_id = this.form.agent_id.filter((x) => x !== id)
      } else {
        this.form.agent_id = [...this.form.agent_id, id]
      }
    },
    removeAgent(a) {
      this.form.agent_id = this.form.agent_id.filter((id) => id !== a.id)
    },
    clearAgents() {
      this.form.agent_id = []
      this.agentQuery = ''
    },
    setStatus(opt) {
      this.statusUi = opt
      this.statusOpen = false
    },
    onClose() {
      this.$emit('close')
    },
    async emitSave() {
      // Sadece API entegrasyonu: form'u update ediyoruz ve üst bileşene 'saved' ile dönüyoruz.
      try {
        this.error = ''
        if (!this.form.id) throw new Error('Missing appointment id')

        // updateAppointment sadece izinli alanları alır; form'u direkt iletmek sorun olmaz.
        const updated = await updateAppointment({
          id: this.form.id,
          appointment_date: this.form.appointment_date,
          appointment_address: this.form.appointment_address,
          contact_id: this.form.contact_id,
          agent_id: this.form.agent_id,
          is_cancelled: this.form.is_cancelled,
        })

        this.$emit('saved', { ...updated })
      } catch (e) {
        console.error('[EditAppointmentModal] save error:', e)
        this.error = 'Failed to save. Please try again.'
      }
    },
  },
}
</script>
