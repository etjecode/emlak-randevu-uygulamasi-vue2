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
      const norm = (v) => (Array.isArray(v) ? (v[0] ?? '') : (v ?? ''))
      return {
        id: rec.id,
        appointment_date: f.appointment_date || '',
        appointment_address: f.appointment_address || '',
        contact_id: Array.isArray(f.contact_id) ? f.contact_id : (f.contact_id ? [f.contact_id] : []),
        contact_name: norm(f.contact_name) || '',
        contact_surname: norm(f.contact_surname) || '',
        contact_email: norm(f.contact_email) || '',
        contact_phone: String(norm(f.contact_phone) || ''),
        agent_id: Array.isArray(f.agent_id) ? f.agent_id : (f.agent_id ? [f.agent_id] : []),
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
    const records = res.data?.records || []
    return records.map((rec) => ({
      id: rec.id,
      name: rec.fields.agent_name || '',
      surname: rec.fields.agent_surname || '',
      color: rec.fields.color || rec.fields[FID_AGENT_COLOR] || '#5B8AD9',
    }))
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
    const norm = (v) => String(Array.isArray(v) ? (v[0] ?? '') : (v ?? ''))
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

export async function updateAppointment(partial = {}) {
  const { id } = partial
  if (!id) throw new Error('[updateAppointment] "id" is required')

  const ALLOWED = [
    'appointment_date',
    'appointment_address',
    'contact_id',
    'agent_id',
    'is_cancelled',
  ]
  const fields = {}
  for (const k of ALLOWED) {
    if (Object.prototype.hasOwnProperty.call(partial, k)) {
      fields[k] = partial[k]
    }
  }

  const body = { records: [{ id, fields }] }

  try {
    const res = await api.patch(`/${APPOINTMENTS_TABLE}`, body)
    const rec = res.data?.records?.[0]
    if (!rec) return res.data

    const f = rec.fields || {}
    const norm = (v) => (Array.isArray(v) ? (v[0] ?? '') : (v ?? ''))
    const agentIds = Array.isArray(f.agent_id) ? f.agent_id : (f.agent_id ? [f.agent_id] : [])
    return {
      id: rec.id,
      appointment_date: f.appointment_date || '',
      appointment_address: f.appointment_address || '',
      contact_id: Array.isArray(f.contact_id) ? f.contact_id : (f.contact_id ? [f.contact_id] : []),
      contact_name: norm(f.contact_name) || '',
      contact_surname: norm(f.contact_surname) || '',
      contact_email: norm(f.contact_email) || '',
      contact_phone: String(norm(f.contact_phone) || ''),
      agent_id: agentIds,
      agent_name: Array.isArray(f.agent_name) ? f.agent_name : [],
      agent_surname: Array.isArray(f.agent_surname) ? f.agent_surname : [],
      agent_color: Array.isArray(f.agent_color) ? f.agent_color : [],
      is_cancelled: !!f.is_cancelled,
    }
  } catch (err) {
    console.error('[updateAppointment] error:', err?.response?.data || err)
    throw err
  }
}

export async function createAppointment({ contactId, address, agentIds, date }) {
  const airtableBody = {
    records: [
      {
        fields: {
          appointment_date: date,           // ISO 8601 string (örn: 2025-09-06T12:00:00.000Z)
          appointment_address: address,
          contact_id: [contactId],
          agent_id: agentIds || [],
          is_cancelled: false,
        },
      },
    ],
  }

  try {
    const res = await api.post(`/${APPOINTMENTS_TABLE}`, airtableBody)
    const created = res.data?.records?.[0]
    if (!created) return res.data

    const f = created.fields || {}
    const norm = (v) => (Array.isArray(v) ? (v[0] ?? '') : (v ?? ''))
    return {
      id: created.id,
      appointment_date: f.appointment_date || '',
      appointment_address: f.appointment_address || '',
      contact_id: Array.isArray(f.contact_id) ? f.contact_id : (f.contact_id ? [f.contact_id] : []),
      contact_name: norm(f.contact_name),
      contact_surname: norm(f.contact_surname),
      contact_email: norm(f.contact_email),
      contact_phone: String(norm(f.contact_phone)),
      agent_id: Array.isArray(f.agent_id) ? f.agent_id : (f.agent_id ? [f.agent_id] : []),
      agent_name: Array.isArray(f.agent_name) ? f.agent_name : [],
      agent_surname: Array.isArray(f.agent_surname) ? f.agent_surname : [],
      agent_color: Array.isArray(f.agent_color) ? f.agent_color : [],
      is_cancelled: !!f.is_cancelled,
    }
  } catch (err) {
    console.error('[createAppointment] error:', err?.response?.data || err)
    throw err
  }
}
