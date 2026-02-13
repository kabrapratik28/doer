'use client'

import { useParams } from 'next/navigation'
import { useProjectStore } from '@/stores/projectStore'
import ProjectView from '@/components/projects/ProjectView'
import EmptyState from '@/components/ui/EmptyState'
import Spinner from '@/components/ui/Spinner'

export default function ProjectPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const { getProjectById, isLoading } = useProjectStore()

  const project = getProjectById(projectId)

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size={24} />
      </div>
    )
  }

  if (!project) {
    return <EmptyState title="Project not found" description="This project doesn't exist or was deleted." />
  }

  return <ProjectView project={project} />
}
