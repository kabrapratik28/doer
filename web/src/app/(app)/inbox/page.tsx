'use client'

import { useProjectStore } from '@/stores/projectStore'
import ProjectView from '@/components/projects/ProjectView'
import Spinner from '@/components/ui/Spinner'

export default function InboxPage() {
  const { projects, isLoading } = useProjectStore()
  const inbox = projects.find((p) => p.is_inbox)

  if (isLoading || !inbox) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size={24} />
      </div>
    )
  }

  return <ProjectView project={inbox} />
}
