<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold">Appointments</h1>
    <AppointmentList :appointments="appointments" />
  </div>
</template>

<script>
import AppointmentList from '@/components/AppointmentList.vue'

export default {
  name: 'HomeView',
  components: { AppointmentList },
  data() {
    return {
      appointments: [],
    }
  },
}
</script>
