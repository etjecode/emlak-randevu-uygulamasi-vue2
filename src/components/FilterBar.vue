<template>
  <div class="mb-6 flex w-full flex-wrap items-center justify-between gap-3">
    <div class="flex flex-wrap items-center gap-3">
      <!-- Kullanıcı Filtrelemesi -->
      <div class="flex items-center gap-2">
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="ag in agents"
            :key="ag.id"
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold ring-2 ring-white transition"
            :style="{ backgroundColor: ag.color || '#5B8AD9' }"
            :class="isSelected(ag.id) ? 'outline outline-2 outline-blue-500 scale-95' : 'hover:brightness-95'"
            :title="`${ag.name || ''} ${ag.surname || ''}`.trim()"
            @click="toggleAgent(ag.id)"
          >
            <span class="text-white">{{ initials(ag.name, ag.surname) }}</span>
          </button>
        </div>
      </div>

      <!-- Status -->
      <select
        class="h-10 rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
        v-model="status"
      >
        <option>All Statuses</option>
        <option>Upcoming</option>
        <option>Completed</option>
        <option>Cancelled</option>
      </select>

      <!-- Date range -->
      <div class="relative">
        <input
          v-model="from"
          type="datetime-local"
          class="h-10 rounded-lg border border-gray-300 px-3 pt-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
        />
        <span class="pointer-events-none absolute left-3 top-1 text-[10px] font-medium uppercase tracking-wide text-gray-400">From</span>
      </div>
      <div class="relative">
        <input
          v-model="to"
          type="datetime-local"
          class="h-10 rounded-lg border border-gray-300 px-3 pt-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
        />
        <span class="pointer-events-none absolute left-3 top-1 text-[10px] font-medium uppercase tracking-wide text-gray-400">To</span>
      </div>
    </div>

    <!-- Search -->
    <div class="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2">
      <i class="fa-solid fa-magnifying-glass text-gray-400"></i>
      <input
        v-model="search"
        type="text"
        placeholder="Search by name, email, phone or address…"
        class="w-64 outline-none text-sm"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'FilterBar',
  props: {
    agents: { type: Array, default: () => [] },
  },
  data() {
    return {
      status: 'All Statuses',
      from: '',
      to: '',
      search: '',
      selectedAgentIds: new Set(),
    }
  },
  computed: {
    selected() {
      return Array.from(this.selectedAgentIds)
    },
  },
  watch: {
    status() { this.emitChange() },
    from() { this.emitChange() },
    to() { this.emitChange() },
    search() { this.emitChange() },
    selected() { this.emitChange() },
  },
  methods: {
    toggleAgent(id) {
      const s = new Set(this.selectedAgentIds)
      s.has(id) ? s.delete(id) : s.add(id)
      this.selectedAgentIds = s
    },
    isSelected(id) {
      return this.selectedAgentIds.has(id)
    },
    initials(name = '', surname = '') {
      const a = (name || '').trim().charAt(0).toUpperCase()
      const b = (surname || '').trim().charAt(0).toUpperCase()
      return `${a}${b}` || 'A'
    },
    emitChange() {
      this.$emit('change', {
        status: this.status,
        from: this.from,
        to: this.to,
        search: this.search,
        agents: this.selected,
      })
    },
  },
}
</script>
