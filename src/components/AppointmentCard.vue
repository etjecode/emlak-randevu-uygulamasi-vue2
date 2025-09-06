<template>
  <div
    class="w-full rounded-xl border px-4 py-4 shadow-sm cursor-pointer transition hover:shadow-md"
    :class="bgClass"
    :style="{ borderColor: '#e5e7eb' }"
    @click="$emit('edit', ap)"
    role="button"
    tabindex="0"
  >
    <div class="grid grid-cols-4">
      <div class="min-w-0 flex-1">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-user text-gray-500"></i>
            <div class="truncate font-semibold text-black">
              {{ ap.contact_name }} {{ ap.contact_surname }}
            </div>
          </div>

          <div v-if="ap.contact_email" class="flex items-center gap-2 text-sm">
            <i class="fa-solid fa-envelope text-gray-500"></i>
            <div class="truncate text-gray-600">
              {{ ap.contact_email }}
            </div>
          </div>

          <div v-if="ap.contact_phone" class="flex items-center gap-2 text-sm">
            <i class="fa-solid fa-phone text-gray-500"></i>
            <div class="truncate text-gray-600">
              {{ ap.contact_phone }}
            </div>
          </div>
        </div>
      </div>

      <div class="min-w-0 my-auto sm:flex-1 sm:min-w-[14rem] mr-20">
        <div class="flex items-center gap-2 text-sm">
          <i class="fa-solid fa-house text-gray-500"></i>
          <span
            class="font-semibold text-black truncate block max-w-full sm:max-w-[16rem] md:max-w-[20rem] lg:max-w-[28rem] whitespace-nowrap"
            :title="ap.appointment_address"
          >
            {{ ap.appointment_address }}
          </span>
        </div>
      </div>

      <div class="sm:flex-1 flex items-center sm:justify-center">
        <div class="w-full shrink-0 inline-flex items-center gap-2 rounded-full bg-pink-500 px-2 py-1.5">
          <div class="inline-flex justify-center w-full items-center gap-2 rounded-full bg-white px-2.5 py-1">
            <span class="text-xs font-semibold" :style="{ color: statusText }">
              {{ statusLabel }}
            </span>
            <span
              v-if="statusLabel === 'Upcoming' && countdownDisplay"
              class="text-xs font-semibold text-black"
            >
              · {{ countdownDisplay }}
            </span>
          </div>

          <div class="inline-flex w-full items-center gap-2 rounded-full bg-white px-2.5 py-1">
            <i class="fa-regular fa-clock text-pink-500"></i>
            <span class="text-xs font-semibold text-pink-500">
              {{ formattedDate }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-start sm:justify-end">
        <div class="flex -space-x-2">
          <div
            v-for="agent in agentsToShow.slice(0,4)"
            :key="agent.id"
            class="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ring-2 ring-white"
            :style="{ backgroundColor: agent.color }"
            :title="agent.title"
          >
            <span class="text-white drop-shadow-sm">{{ agent.initials }}</span>
          </div>
          <div
            v-if="agentsToShow.length > 4"
            class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-[11px] font-semibold text-gray-700 ring-2 ring-white"
          >
            +{{ agentsToShow.length - 4 }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { format, isBefore, differenceInDays } from 'date-fns'

export default {
  name: 'AppointmentCard',
  props: {
    ap: { type: Object, required: true },
    index: { type: Number, required: true },
  },
  computed: {
    bgClass() { return this.index % 2 === 0 ? 'bg-white' : 'bg-gray-50' },
    statusText() {
      if (this.ap.statusColor && this.ap.statusColor.text) return this.ap.statusColor.text
      if (this.statusLabel === 'Upcoming') return '#059669'
      if (this.statusLabel === 'Cancelled') return '#DC2626'
      return '#4B5563'
    },
    statusLabel() {
      const cancelled = !!this.ap.is_cancelled
      const date = this.ap.appointment_date ? new Date(this.ap.appointment_date) : null
      if (cancelled) return 'Cancelled'
      if (date && isBefore(date, new Date())) return 'Completed'
      return 'Upcoming'
    },
    // Kalan gün hesaplama: ap.countdown varsa onu kullan; yoksa hesapla
    countdownDays() {
      if (typeof this.ap.countdown === 'number') return this.ap.countdown
      const d = this.ap.appointment_date ? new Date(this.ap.appointment_date) : null
      if (!d || isNaN(d)) return null
      const diff = differenceInDays(d, new Date())
      return Math.max(0, diff)
    },
    countdownDisplay() {
      const n = this.countdownDays
      if (n == null) return ''
      if (n === 0) return 'Today'
      if (n === 1) return '1 day'
      return `${n} days`
    },
    formattedDate() {
      const d = this.ap.appointment_date ? new Date(this.ap.appointment_date) : null
      return d ? format(d, 'dd/MM/yyyy HH:mm') : '-'
    },
    agentsToShow() {
      if (this.ap.displayAgents && this.ap.displayAgents.length) return this.ap.displayAgents
      const names = this.ap.agent_name || []
      const surnames = this.ap.agent_surname || []
      const colors = this.ap.agent_color || []
      return names.map((n, i) => {
        const fn = n || ''
        const ln = surnames?.[i] || ''
        const initials = `${(fn[0] || '').toUpperCase()}${(ln[0] || '').toUpperCase()}`
        return {
          id: `${fn}-${ln}-${i}`,
          initials,
          color: colors?.[i] || '#5B8AD9',
          title: `${fn} ${ln}`.trim(),
        }
      })
    },
  },
}
</script>
