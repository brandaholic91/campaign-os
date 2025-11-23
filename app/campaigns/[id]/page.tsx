import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/types'
import { format } from 'date-fns'
import { DeleteCampaignButton } from '@/components/campaigns/DeleteCampaignButton'
import { CampaignStatusCard } from '@/components/campaigns/CampaignStatusCard'
import { ValidationStatusSection } from '@/components/ai/ValidationStatusSection'
import { ValidationStatusBadge } from '@/components/ai/ValidationStatusBadge'

type Campaign = Database['campaign_os']['Tables']['campaigns']['Row']

const campaignTypeLabels: Record<Campaign['campaign_type'], string> = {
  political_election: 'Politikai választás',
  political_issue: 'Politikai ügy',
  brand_awareness: 'Márkaismertség',
  product_launch: 'Termék bevezetés',
  promo: 'Promóció',
  ngo_issue: 'NGO ügy',
}

const goalTypeLabels: Record<Campaign['primary_goal_type'], string> = {
  awareness: 'Tudatosság',
  engagement: 'Engedélyezés',
  list_building: 'Listaépítés',
  conversion: 'Konverzió',
  mobilization: 'Mobilizáció',
}

const statusLabels: Record<NonNullable<Campaign['status']>, string> = {
  planning: 'Tervezés',
  running: 'Fut',
  closed: 'Lezárva',
}

interface CampaignDetailPageProps {
  params: Promise<{ id: string }>
}

async function getCampaign(id: string): Promise<Campaign | null> {
  const supabase = await createClient()
  const db = supabase.schema('campaign_os')
  const { data, error } = await db
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { id } = await params
  const campaign = await getCampaign(id)

  if (!campaign) {
    notFound()
  }

  const supabase = await createClient()
  const db = supabase.schema('campaign_os')

  // Get segments and topics count
  const { count: segmentsCount } = await db
    .from('segments')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', id)

  const { count: topicsCount } = await db
    .from('topics')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', id)

  const startDate = new Date(campaign.start_date)
  const endDate = new Date(campaign.end_date)
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="max-w-[1600px] mx-auto p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-gray-200 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-1">
            <Link href="/campaigns" className="hover:text-gray-900 transition-colors">Kampányok</Link>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
            <span className="text-primary-600 font-medium">{campaign.name}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 tracking-tight">
            {campaign.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold border border-gray-200 uppercase tracking-wide">
              {campaignTypeLabels[campaign.campaign_type]}
            </span>
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold border border-gray-200 uppercase tracking-wide">
              {goalTypeLabels[campaign.primary_goal_type]}
            </span>
            {/* Validation Status Badge */}
            <ValidationStatusBadge campaignId={id} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/campaigns/${id}/edit`}>
            <button className="group flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-700 font-medium text-sm hover:border-primary-200 hover:text-primary-700 hover:bg-gray-50 transition-all">
              <svg className="w-4 h-4 text-gray-400 group-hover:text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Szerkesztés
            </button>
          </Link>
          <DeleteCampaignButton campaignId={id} />
        </div>
      </div>

      {/* Bento Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Status Card */}
        <CampaignStatusCard campaignId={id} currentStatus={campaign.status} updatedAt={campaign.updated_at} />

        {/* Date Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-soft flex flex-col justify-between h-full min-h-[160px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Időszak</span>
             <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
               <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
               </svg>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
                <span className="text-lg font-display font-bold text-gray-900">{format(startDate, 'yyyy.MM.dd')}</span>
                <span className="text-gray-400">-</span>
                <span className="text-lg font-display font-bold text-gray-900">{format(endDate, 'yyyy.MM.dd')}</span>
            </div>
            <span className="text-xs text-gray-400 block mt-1">{daysDiff} napos kampány</span>
          </div>
        </div>

         {/* Budget Card or Empty spacer */}
         {campaign.budget_estimate ? (
           <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-soft flex flex-col justify-between h-full min-h-[160px]">
             <div className="flex items-center justify-between mb-4">
               <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Költségvetés</span>
               <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                 <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
               </div>
             </div>
             <div>
               <span className="text-2xl font-display font-bold text-gray-900 block mb-1">
                 {new Intl.NumberFormat('hu-HU').format(campaign.budget_estimate)} Ft
               </span>
             </div>
           </div>
         ) : (
           <div className="hidden lg:flex bg-gradient-to-br from-primary-900 to-primary-800 p-6 rounded-2xl shadow-soft flex-col justify-between text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl group-hover:scale-110 transition-transform"></div>
             <div className="relative z-10">
                <span className="text-sm font-semibold text-primary-200 uppercase tracking-wider block mb-2">Kampány Áttekintés</span>
                <span className="text-3xl font-display font-bold">Aktív</span>
             </div>
          </div>
         )}

        {/* Description Card (Full Width) */}
        {campaign.description && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white p-8 rounded-2xl border border-gray-200 shadow-soft">
            <h3 className="text-lg font-display font-bold text-gray-900 mb-4">Leírás</h3>
            <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
              <p>{campaign.description}</p>
            </div>
          </div>
        )}

        {/* Validation Status Checklist (Full Width) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <ValidationStatusSection campaignId={id} />
        </div>

        {/* Navigation / Module Cards */}
        
        {/* Audiences */}
        <Link href={`/campaigns/${id}/segments`}>
          <div className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-soft hover:shadow-md hover:border-primary-200 transition-all cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="flex items-center justify-between mb-1">
               <h3 className="text-lg font-display font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Célcsoportok</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">Célcsoportok kezelése és szegmentálása</p>
            <div className="flex items-center justify-between text-xs font-medium text-gray-400 uppercase tracking-wide border-t border-gray-100 pt-3">
               <span>{segmentsCount || 0} aktív szegmens</span>
               <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
               </svg>
            </div>
          </div>
        </Link>

        {/* Topics */}
        <Link href={`/campaigns/${id}/topics`}>
          <div className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-soft hover:shadow-md hover:border-primary-200 transition-all cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-display font-bold text-gray-900 group-hover:text-violet-600 transition-colors">Témák</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">Kommunikációs témák és üzenetek</p>
             <div className="flex items-center justify-between text-xs font-medium text-gray-400 uppercase tracking-wide border-t border-gray-100 pt-3">
               <span>{topicsCount || 0} téma definiálva</span>
               <svg className="w-4 h-4 text-gray-300 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
               </svg>
            </div>
          </div>
        </Link>

        {/* Messages - Main Action */}
        <Link href={`/campaigns/${id}/messages`}>
            <div className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-soft hover:shadow-lg hover:border-primary-400 transition-all cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                 <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                </div>
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-display font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">Üzenetek</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase">AI Generátor</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">Üzenetmátrix és tartalomgenerálás</p>
                 <div className="flex items-center justify-between text-xs font-medium text-gray-400 uppercase tracking-wide border-t border-gray-100 pt-3">
                 <span>Megnyitás</span>
                 <svg className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                 </svg>
              </div>
              </div>
            </div>
        </Link>

         {/* Sprints */}
         <Link href={`/campaigns/${id}/sprints`}>
            <div className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-soft hover:shadow-md hover:border-primary-200 transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div className="flex items-center justify-between mb-1">
                 <h3 className="text-lg font-display font-bold text-gray-900 group-hover:text-amber-600 transition-colors">Sprintek</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">Sprint és task board</p>
              <div className="flex items-center justify-between text-xs font-medium text-gray-400 uppercase tracking-wide border-t border-gray-100 pt-3">
                 <span>Tervezés alatt</span>
                 <svg className="w-4 h-4 text-gray-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                 </svg>
              </div>
            </div>
         </Link>

      </div>
    </div>
  )
}

