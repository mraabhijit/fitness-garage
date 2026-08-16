import React, { useEffect, useState } from 'react';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { FormField } from '../../components/forms/FormField';
import { adminService } from '../../services/adminService';
import { Save, RefreshCw, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadConfigs = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getSiteConfigs();
      setFormData(Object.fromEntries(data.map((c) => [c.config_key, c.config_value])));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      await adminService.updateSiteConfigs(formData);
      setMessage('Site configuration successfully saved!');
    } catch (err: any) {
      alert(err.message || 'Saving failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncReviews = async () => {
    setIsSyncing(true);
    try {
      const res = await adminService.syncReviews();
      alert(`Google Reviews sync complete! Synced: ${res.synced_count ?? 0} reviews.`);
    } catch {
      alert('Review sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-garage-black">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display uppercase tracking-wider text-garage-white">
              SITE <span className="text-garage-chrome">/</span> CONFIGURATION
            </h1>
            <p className="text-xs text-garage-muted font-body mt-1">
              Global brand details, contact information, and integrations.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleSyncReviews}
            isLoading={isSyncing}
            leftIcon={<RefreshCw className="w-4 h-4 text-garage-chrome" />}
          >
            Sync Google Reviews
          </Button>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-status-active/10 border border-status-active/30 rounded-xl flex items-center gap-3 text-xs text-status-active">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <Card className="p-8">
          {isLoading ? (
            <Spinner size="lg" className="my-12" />
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Gym Brand Name"
                  value={formData['gym_name'] || ''}
                  onChange={(e) => setFormData({ ...formData, gym_name: e.target.value })}
                />
                <FormField
                  label="Contact Phone"
                  value={formData['gym_phone'] || ''}
                  onChange={(e) => setFormData({ ...formData, gym_phone: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Contact Email"
                  type="email"
                  value={formData['gym_email'] || ''}
                  onChange={(e) => setFormData({ ...formData, gym_email: e.target.value })}
                />
                <FormField
                  label="Physical Address"
                  value={formData['gym_address'] || ''}
                  onChange={(e) => setFormData({ ...formData, gym_address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Google Place ID"
                  value={formData['gym_google_place_id'] || ''}
                  onChange={(e) => setFormData({ ...formData, gym_google_place_id: e.target.value })}
                />
                <FormField
                  label="Hero Slideshow Interval (ms)"
                  type="number"
                  value={formData['hero_slideshow_interval_ms'] || '5000'}
                  onChange={(e) =>
                    setFormData({ ...formData, hero_slideshow_interval_ms: e.target.value })
                  }
                />
              </div>

              <div className="pt-6 border-t border-garage-mid flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSaving}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Save Configuration
                </Button>
              </div>
            </form>
          )}
        </Card>
      </main>
    </div>
  );
};
