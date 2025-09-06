<template>
  <div>
    <div v-if="!hasItems" class="text-gray-500 text-center py-8">
      No appointments found.
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppointmentList',
  props: {
    appointments: { type: Array, default: () => [] },
  },
  computed: {
    hasItems() {
      return Array.isArray(this.appointments) && this.appointments.length > 0
    },
  },
}
</script>
