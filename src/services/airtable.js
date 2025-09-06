import axios from 'axios'

const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID
const API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY
const API_URL = `https://api.airtable.com/v0/${BASE_ID}`

const AGENTS_TABLE = 'tblejF2oJbI8ze105'
const APPOINTMENTS_TABLE = 'tbl9reEf5STrkSA85'
const FID_AGENT_COLOR = 'fldyA8BCFirmIlkXI'
const CONTACTS_TABLE = 'Contacts'

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
      const agentIds = Array.isArray(f.agent_id) ? f.agent_id : (f.agent_id ? [f.agent_id] : [])

      return {
        id: rec.id,
        appointment_date: f.appointment_date || '',
        appointment_address: f.appointment_address || '',
        contact_id: Array.isArray(f.contact_id) ? f.contact_id : (f.contact_id ? [f.contact_id] : []),
        contact_name: name || '',
        contact_surname: surname || '',
        contact_email: email || '',
        contact_phone: phone || '',
        agent_id: agentIds,
        agent_name: Array.isArray(f.agent_name) ? f.agent_name : [],
        agent_surname: Array.isArray(f.agent_surname) ? f.agent_surname : [],
        agent_color: Array.isArray(f.agent_color) ? f.agent_color : [],
        is_cancelled: !!f.is_cancelled,
      }
    })
  } catch (err) {
    console.error('[fetchAppointments] error:', err?.response?.data || err)
    return []
  }
}

export async function fetchAgents() {
  try {
    const res = await api.get(`/${AGENTS_TABLE}`, { params: { pageSize: 100 } })
    const agents = (res.data.records || []).map((rec) => ({
      id: rec.id,
      name: rec.fields.agent_name || '',
      surname: rec.fields.agent_surname || '',
      color: rec.fields.color || rec.fields[FID_AGENT_COLOR] || '#5B8AD9',
    }))
    return agents
  } catch (err) {
    console.error('[fetchAgents] error:', err?.response?.data || err)
    return []
  }
}

export function enrichAppointmentsWithAgentColors(appointments, agents) {
  if (!appointments?.length) return []
  const colorById = new Map((agents || []).map((a) => [a.id, a.color || '#5B8AD9']))
  return appointments.map((ap) => {
    if (ap.agent_color && ap.agent_color.length) return ap
    const colors = (ap.agent_id || []).map((id) => colorById.get(id) || '#5B8AD9')
    return { ...ap, agent_color: colors }
  })
}

export async function fetchAllForHome() {
  const [agents, rawAppointments] = await Promise.all([fetchAgents(), fetchAppointments()])
  const appointments = enrichAppointmentsWithAgentColors(rawAppointments, agents)
  return { agents, appointments }
}

export async function fetchContacts() {
  try {
    const res = await api.get(`/${CONTACTS_TABLE}`, {
      params: {
        pageSize: 100,
        fields: ['contact_name', 'contact_surname', 'contact_email', 'contact_phone'],
      },
    })

    const list = res.data?.records || []

    const norm = (v) => {
      const raw = Array.isArray(v) ? (v[0] ?? '') : (v ?? '')
      return String(raw ?? '')
    }

    return list.map((record) => {
      const f = record.fields || {}
      return {
        id: record.id,
        name: norm(f.contact_name),
        surname: norm(f.contact_surname),
        email: norm(f.contact_email),
        phone: norm(f.contact_phone),
      }
    })
  } catch (err) {
    console.error('[fetchContacts] error:', err?.response?.data || err)
    return []
  }
}