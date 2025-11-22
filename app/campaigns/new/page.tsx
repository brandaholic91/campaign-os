import { CampaignForm } from '@/components/campaigns/CampaignForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewCampaignPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-6">
          <Link href="/campaigns">
            <button className="self-start flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-600 font-medium text-sm hover:bg-gray-50 hover:text-primary-600 transition-all mb-4">
              <ArrowLeft className="w-4 h-4" />
              Vissza a kampányokhoz
            </button>
          </Link>
          <h1 className="text-3xl font-display font-bold text-gray-900">Új kampány</h1>
          <p className="text-gray-500 mt-1">
            Hozz létre egy új kampányt a tervezéshez
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Kampány Adatok</CardTitle>
            <CardDescription>
              Add meg a kampány alapvető adatait
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CampaignForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

