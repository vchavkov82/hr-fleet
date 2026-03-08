'use client'

import EmployeeTable from '@/components/dashboard/employee-table'

interface Props {
  token: string
}

export default function EmployeeDirectoryClient({ token }: Props) {
  return <EmployeeTable token={token} />
}
