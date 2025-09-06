import axios from 'axios'

const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID
const API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY
const API_URL = `https://api.airtable.com/v0/${BASE_ID}`

const APPOINTMENTS_TABLE = 'tbl9reEf5STrkSA85' // "Appointments" table
const headers = {
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
}

const api = axios.create({ baseURL: API_URL, headers })

export async function fetchAppointments() {
  try {
    const res = await api.get(`/${APPOINTMENTS_TABLE}`, { params: { pageSize: 100 } })
    const records = res.data?.records || []

    return records.map((rec) => {
      const f = rec.fields || {}
      const name = Array.isArray(f.contact_name) ? f.contact_name[0] : f.contact_name
      const surname = Array.isArray(f.contact_surname) ? f.contact_surname[0] : f.contact_surname
      const email = Array.isArray(f.contact_email) ? f.contact_email[0] : f.contact_email
      const phone = String(Array.isArray(f.contact_phone) ? f.contact_phone[0] : (f.contact_phone ?? ''))
      const agentNames = Array.isArray(f.agent_name) ? f.agent_name : []
      const agentSurnames = Array.isArray(f.agent_surname) ? f.agent_surname : []
      const agentColors = Array.isArray(f.agent_color) ? f.agent_color : []

      return {
        id: rec.id,
        appointment_date: f.appointment_date || '',
        appointment_address: f.appointment_address || '',
        contact_name: name || '',
        contact_surname: surname || '',
        contact_email: email || '',
        contact_phone: phone || '',
        agent_name: agentNames,
        agent_surname: agentSurnames,
        agent_color: agentColors,
        is_cancelled: !!f.is_cancelled,
      }
    })
  } catch (err) {
    console.error('[fetchAppointments] error:', err?.response?.data || err)
    return []
  }
}
