<template>
  <div class="relative">
    <label class="mb-1 block text-sm font-medium text-gray-700">Contact</label>

    <!-- Seçili kart -->
    <div v-if="selected" class="min-w-0 flex-1 p-3 border rounded-lg bg-white shadow-md">
      <div class="flex justify-between items-start">
        <!-- Sol kısım -->
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-user text-gray-500"></i>
            <div class="truncate font-semibold text-black">
              {{ selected.name }} {{ selected.surname }}
            </div>
          </div>

          <div v-if="selected.email" class="flex items-center gap-2 text-sm">
            <i class="fa-solid fa-envelope text-gray-500"></i>
            <div class="truncate text-gray-600">{{ selected.email }}</div>
          </div>

          <div v-if="selected.phone" class="flex items-center gap-2 text-sm">
            <i class="fa-solid fa-phone text-gray-500"></i>
            <div class="truncate text-gray-600">{{ selected.phone }}</div>
          </div>
        </div>

        <!-- Sağ üst ✕ -->
        <button @click="clearSelected" class="text-gray-400 hover:text-gray-600 ml-3" type="button">
          ✕
        </button>
      </div>
    </div>

    <!-- Arama input + dropdown (seçili yoksa) -->
    <div v-else>
      <div class="relative">
        <input
          v-model="query"
          type="text"
          placeholder="Type a name, email or phone…"
          class="w-full rounded-xl border border-gray-300 px-3 py-2.5 pr-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
        />
        <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">⌕</span>
      </div>

      <div
        v-if="query && filteredContacts.length"
        class="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
      >
        <ul class="max-h-56 overflow-y-auto">
          <li
            v-for="c in filteredContacts"
            :key="c.id"
            @click="selectContact(c)"
            class="flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50"
          >
            <i class="fa-solid fa-user text-gray-500"></i>
            <div class="min-w-0">
              <div class="truncate font-medium">
                {{ c.name }} {{ c.surname }}
              </div>
              <div class="truncate text-xs text-gray-500">
                {{ c.email }}<span v-if="c.phone" class="text-gray-400"> • {{ c.phone }}</span>
              </div>
            </div>
          </li>

          <li v-if="!filteredContacts.length" class="px-3 py-3 text-sm text-gray-500">
            No contacts found.
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchContacts } from '@/services/airtable'

export default {
  name: 'SearchContacts',
  // Vue 2 v-model: value + input
  model: { prop: 'value', event: 'input' },
  props: {
    value: { type: Object, default: null },              // v-model
    prefetchedContacts: { type: Array, default: () => [] }
  },
  data() {
    return {
      contacts: [],
      query: '',
      loading: false,
    }
  },
  computed: {
    // v-model proxy
    selected: {
      get() { return this.value || null },
      set(v) { this.$emit('input', v) },
    },
    filteredContacts() {
      const q = (this.query || '').toLowerCase().trim()
      if (!q) return []

      const norm = (v) => {
        const raw = Array.isArray(v) ? (v[0] ?? '') : (v ?? '')
        return String(raw ?? '')
      }

      return this.contacts.filter((c) => {
        const name = `${norm(c.name)} ${norm(c.surname)}`.toLowerCase()
        const email = norm(c.email).toLowerCase()
        const phone = norm(c.phone).toLowerCase()
        return name.includes(q) || email.includes(q) || phone.includes(q)
      })
    },
  },
  watch: {
    prefetchedContacts: {
      immediate: true,
      handler(v) {
        if (Array.isArray(v) && v.length) {
          this.contacts = v.map(this.normalizeContact)
        }
      },
    },
  },
  async mounted() {
    if (!this.contacts.length) {
      try {
        this.loading = true
        const list = await fetchContacts()
        this.contacts = (list || []).map(this.normalizeContact)
        this.$emit('loaded', this.contacts)
      } catch (e) {
        console.error('[SearchContacts] fetch failed:', e)
      } finally {
        this.loading = false
      }
    }
  },
  methods: {
    normalizeContact(c) {
      const norm = (v) => {
        const raw = Array.isArray(v) ? (v[0] ?? '') : (v ?? '')
        return String(raw ?? '')
      }
      return {
        id: c.id,
        name: norm(c.name),
        surname: norm(c.surname),
        email: norm(c.email),
        phone: norm(c.phone),
      }
    },
    selectContact(c) {
      this.selected = c
      this.query = ''
    },
    clearSelected() {
      this.selected = null
      this.query = ''
    },
  },
}
</script>
