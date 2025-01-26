'use client'

interface BreadcrumbProps {
  label: string
  url: string
}

interface AdminComponentProps {
  cellData: BreadcrumbProps[]
  rowData: {
    title: string
    breadcrumbs: BreadcrumbProps[]
  }
}

export function Cell({ cellData, rowData }: AdminComponentProps) {
  return <span>{cellData.length ? cellData.map((c) => c.label).join(' / ') : rowData.title}</span>
}
