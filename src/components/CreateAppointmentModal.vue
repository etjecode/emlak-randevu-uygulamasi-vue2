<template>
  <BaseModal :show="show" title="Create Appointment" @close="closeModal">
     <template v-slot:header-left>
    <i class="fa-regular fa-calendar text-pink-500 text-xl"></i>
  </template>

    <!-- Body (default slot) -->
    <div class="space-y-5">
      <SearchContacts
        v-model="selectedContact"
        :prefetched-contacts="contacts"
        label="Search Contact"
      />

   <div>
  <label class="mb-1 block text-sm font-medium text-gray-700">Address</label>
  <div class="relative">
    <input
      v-model="address"
      type="text"
      placeholder="Street, city…"
      class="w-full rounded-xl border border-gray-300 px-3 py-2.5 pr-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
    />
    <!-- Clear Button -->
    <button
      v-if="address"
      type="button"
      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      @click="address = ''"
      aria-label="Clear address"
    >
      ✕
    </button>
  </div>
  <p v-if="error && !address.trim()" class="mt-1 text-xs text-red-600">Address is required.</p>
</div>


      <!-- Agents -->
      <div class="relative">
        <label class="mb-1 block text-sm font-medium text-gray-700">Agents</label>

        <button
          ref="agentsTrigger"
          type="button"
          class="flex w-full items-center justify-between rounded-xl border border-gray-300 px-3 py-2.5 text-sm hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
          @click="agentsOpen = !agentsOpen"
          @keydown.escape.stop="agentsOpen = false"
          aria-haspopup="listbox"
          :aria-expanded="agentsOpen ? 'true' : 'false'"
        >
          <div class="flex flex-wrap items-center gap-2 text-left">
            <span v-if="!selectedAgents.length" class="text-gray-400">Agent</span>
            <template v-else>
              <span
                v-for="a in selectedAgents"
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
                <button type="button" class="ml-0.5 text-gray-500 hover:text-gray-700" @click.stop="removeAgent(a)">✕</button>
              </span>
            </template>
          </div>
          <i class="fa-solid fa-chevron-down h-3.5 w-3.5 shrink-0 text-gray-500"></i>
        </button>

        <div v-if="agentsOpen" ref="agentsPanel" class="absolute z-30 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-xl" role="listbox">
          <div class="border-b border-gray-100 p-2">
            <input
              v-model="agentQuery"
              type="text"
              placeholder="Search agents…"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
              @keydown.escape.stop="agentsOpen = false"
            />
          </div>

          <ul class="max-h-60 overflow-y-auto py-1">
            <li v-for="agent in filteredAgents" :key="agent.id" class="px-2">
              <button
                type="button"
                class="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition"
                @click="toggleAgent(agent)"
                :class="selectedAgentsMap[agent.id] ? 'bg-blue-50' : 'hover:bg-gray-50'"
                :style="selectedAgentsMap[agent.id]
                  ? { outline: `2px solid ${agent.color || '#3B82F6'}`, outlineOffset: '0', borderColor: agent.color || '#3B82F6' }
                  : { borderColor: 'transparent' }"
              >
                <span class="inline-block h-2.5 w-2.5 rounded-full ring-2 ring-white" :style="{ backgroundColor: agent.color || '#9CA3AF' }"></span>
                <span class="truncate">{{ agent.name }} {{ agent.surname }}</span>
                <i v-if="selectedAgentsMap[agent.id]" class="fa-solid fa-check ml-auto h-4 w-4 shrink-0" :style="{ color: agent.color || '#2563EB' }"></i>
              </button>
            </li>
            <li v-if="!filteredAgents.length" class="px-3 py-3 text-sm text-gray-500">No agents found.</li>
          </ul>

          <div class="flex items-center justify-between border-t border-gray-100 px-3 py-2">
            <button type="button" class="text-xs text-gray-500 hover:text-gray-700" @click="clearAgents">Clear</button>
            <button type="button" class="rounded-lg bg-pink-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-pink-600" @click="agentsOpen=false">Done</button>
          </div>
        </div>

        <p v-if="error && !selectedAgents.length" class="mt-1 text-xs text-red-600">Select at least one agent.</p>
      </div>

      <!-- Appointment Date -->
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700">Appointment Date</label>
        <input
          v-model="appointmentDate"
          type="datetime-local"
          class="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
        />
        <p v-if="error && !appointmentDate" class="mt-1 text-xs text-red-600">Select a date & time.</p>
      </div>

      <!-- Form error -->
      <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {{ error }}
      </div>
    </div>

    <!-- Footer (named slot) -->
    <!-- Seçenek 1: v-slot sözdizimi -->
    <template v-slot:footer>
      <button type="button" class="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100" @click="cancel">Cancel</button>
      <button type="button" class="rounded-xl bg-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-pink-600 focus:outline-none focus:ring-4 focus:ring-blue-200" @click="submit">
        Create
      </button>
    </template>

    <!-- Seçenek 2: klasik Vue 2 sözdizimi (aynı etki) -->
    <!--
    <template slot="footer">
      ...
    </template>
    -->
  </BaseModal>
</template>

<script>
import BaseModal from '@/components/BaseModal.vue'
import SearchContacts from '@/components/SearchContacts.vue'
import { fetchAgents, fetchContacts } from '@/services/airtable'

export default {
  name: 'CreateAppointmentModal',
  components: { BaseModal, SearchContacts },
  props: { show: { type: Boolean, default: false } },
  data() {
    return {
      contacts: [],
      selectedContact: null,
      address: '',
      agents: [],
      selectedAgents: [],
      appointmentDate: '',
      error: '',
      agentsOpen: false,
      agentQuery: '',
    }
  },
  computed: {
    selectedAgentsMap() {
      const m = {}
      for (const a of this.selectedAgents) m[a.id] = true
      return m
    },
    filteredAgents() {
      const q = (this.agentQuery || '').toLowerCase().trim()
      const base = [...this.agents].sort((a,b) =>
        `${a.name} ${a.surname}`.localeCompare(`${b.name} ${b.surname}`, undefined, { sensitivity: 'base' })
      )
      if (!q) return base
      return base.filter(a => `${a.name} ${a.surname}`.toLowerCase().includes(q))
    },
  },
  watch: {
    show(val) { if (val) this.loadData() },
  },
  methods: {
    async loadData() {
      try {
        this.contacts = await fetchContacts()
        this.agents = await fetchAgents()
      } catch (e) {
        console.error('[CreateAppointmentModal] loadData error:', e)
      }
    },
    toggleAgent(agent) {
      if (this.selectedAgentsMap[agent.id]) {
        this.selectedAgents = this.selectedAgents.filter(a => a.id !== agent.id)
      } else {
        this.selectedAgents.push(agent)
      }
    },
    removeAgent(agent) {
      this.selectedAgents = this.selectedAgents.filter(a => a.id !== agent.id)
    },
    clearAgents() {
      this.selectedAgents = []
      this.agentQuery = ''
    },
    convertToISOString(input) {
      if (!input) return null
      let s = input.trim().replace(' ', 'T')
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) s += ':00'
      const d = new Date(s)
      return isNaN(d.getTime()) ? null : d.toISOString()
    },
    submit() {
      // Şimdilik API yok: sadece doğrula ve payload emit et
      if (!this.selectedContact) return (this.error = 'Please select a contact.')
      if (!this.address.trim()) return (this.error = 'Address is required.')
      if (!this.selectedAgents.length) return (this.error = 'Pick at least one agent.')
      if (!this.appointmentDate) return (this.error = 'Select a date & time.')

      const isoDate = this.convertToISOString(this.appointmentDate)
      if (!isoDate) return (this.error = 'Invalid date format. Use a valid local datetime.')
      this.error = ''

      const payload = {
        contactId: this.selectedContact.id,
        address: this.address,
        agentIds: this.selectedAgents.map(a => a.id),
        date: isoDate,
      }
      this.$emit('submit', payload)
      this.closeModal()
    },
    closeModal() {
      this.$emit('close')
      this.resetForm()
    },
    cancel() { this.closeModal() },
    resetForm() {
      this.selectedContact = null
      this.address = ''
      this.selectedAgents = []
      this.appointmentDate = ''
      this.agentQuery = ''
      this.error = ''
    },
  },
}
</script>
