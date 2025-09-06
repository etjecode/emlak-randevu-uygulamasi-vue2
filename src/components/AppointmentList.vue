<template>
  <div>
    <div v-if="!hasItems" class="text-gray-500 text-center py-8">
      No appointments found.
    </div>

    <div v-else class="space-y-3">
      <AppointmentCard
        v-for="(ap, idx) in appointments"
        :key="ap.id"
        :ap="ap"
        :index="idx"
        @edit="$emit('edit', ap)"
      />
    </div>
  </div>
</template>

<script>
import AppointmentCard from '@/components/AppointmentCard.vue'

export default {
  name: 'AppointmentList',
  components: { AppointmentCard },
  props: {
    appointments: { type: Array, default: () => [] },
  },
  computed: {
    hasItems() { return Array.isArray(this.appointments) && this.appointments.length > 0 },
  },
}
</script>
