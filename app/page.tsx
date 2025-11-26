import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function Home() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h1 className="text-4xl font-bold">Campaign OS</h1>
        <p className="text-lg text-muted-foreground">
          Kommunikációs és social média kampánytervező eszköz
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link href="/campaigns" className="w-full md:w-auto">
            <Button className="h-11 px-8 w-full md:w-auto">
              Kampányok megtekintése
            </Button>
          </Link>
          <Link href="/campaigns/new" className="w-full md:w-auto">
            <Button variant="secondary" className="h-11 px-8 w-full md:w-auto">
              <Plus className="mr-2 h-5 w-5" />
              Új kampány
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
