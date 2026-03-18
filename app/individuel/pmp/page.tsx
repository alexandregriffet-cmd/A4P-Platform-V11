import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import PMPClient from './PMPClient'

export default async function PMPPage() {
  const cookieStore = await cookies()
  const email = cookieStore.get('a4p_individual_email')?.value || ''
  const accessCode = cookieStore.get('a4p_individual_code')?.value || ''

  if (!email || !accessCode) {
    redirect('/individuel/connexion')
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return <main style={{ padding: 24 }}>Configuration Supabase incomplète.</main>
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const { data: access } = await supabase
    .from('individual_access')
    .select('*')
    .eq('email', email)
    .eq('access_code', accessCode)
    .single()

  if (!access || !access.access_enabled) {
    redirect('/individuel/connexion')
  }

  if (!access.pmp_allowed) {
    return <main style={{ padding: 24 }}>Le PMP n’est pas autorisé pour ce compte.</main>
  }

  if (access.pmp_completed) {
    redirect('/individuel/pmp/resultat')
  }

  return <PMPClient fullName={access.full_name || ''} email={email} />
}
