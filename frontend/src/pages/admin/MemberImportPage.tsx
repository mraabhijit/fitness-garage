import React, { useState } from 'react'
import { AdminSidebar } from '../../components/layout/AdminSidebar'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { FileUpload } from '../../components/forms/FileUpload'
import { adminService } from '../../services/adminService'
import { AlertCircle, CheckCircle2, FileSpreadsheet } from 'lucide-react'

export const MemberImportPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    imported_count: number
    failed_count: number
    errors: Record<string, unknown>[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async () => {
    if (!file) {
      alert('Please choose a CSV or Excel file to upload')
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await adminService.importMembers(file)
      setResult(data)
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Import failed'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-garage-black">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-display uppercase tracking-wider text-garage-white">
            BULK <span className="text-garage-chrome">/</span> MEMBER IMPORT
          </h1>
          <p className="text-xs text-garage-muted font-body mt-1">
            Import existing member rosters from CSV or Excel (.xlsx). PII fields are automatically
            encrypted before database insertion.
          </p>
        </div>

        <Card className="p-8 mb-8 space-y-6">
          <div className="flex items-center gap-3 p-4 bg-garage-chrome/5 border border-garage-chrome/20 rounded-xl text-xs text-garage-muted font-body">
            <FileSpreadsheet className="w-6 h-6 text-garage-chrome shrink-0" />
            <div>
              <span className="font-bold text-garage-white uppercase block">Expected Columns</span>
              <span>
                full_name (required), phone_number, email_address, plan_tier, plan_duration,
                start_date, expiry_date, notes
              </span>
            </div>
          </div>

          <FileUpload
            label="Upload CSV or Excel File"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onFileSelect={(f) => {
              setFile(f)
            }}
          />

          <Button
            onClick={handleUpload}
            variant="primary"
            size="md"
            className="w-full"
            isLoading={isLoading}
            disabled={!file}
          >
            Process & Import Records
          </Button>

          {error && (
            <div className="p-4 bg-status-expired/10 border border-status-expired/30 rounded-xl flex items-center gap-3 text-xs text-status-expired">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="p-6 bg-status-active/10 border border-status-active/30 rounded-xl space-y-4">
              <div className="flex items-center gap-3 text-status-active">
                <CheckCircle2 className="w-6 h-6" />
                <h4 className="text-xl font-display uppercase tracking-wide">
                  Import Batch Finished
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs font-body">
                <div className="p-3 bg-garage-dark rounded border border-garage-mid">
                  <span className="text-garage-muted block">Successfully Created</span>
                  <span className="text-xl font-bold text-status-active">
                    {result.imported_count} members
                  </span>
                </div>
                <div className="p-3 bg-garage-dark rounded border border-garage-mid">
                  <span className="text-garage-muted block">Failed / Skipped</span>
                  <span className="text-xl font-bold text-status-expired">
                    {result.failed_count} records
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}
