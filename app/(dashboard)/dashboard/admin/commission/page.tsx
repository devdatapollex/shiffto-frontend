'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Percent,
  Save,
  Calculator,
  ShieldCheck,
  DollarSign,
  CheckCircle2,
  RefreshCw,
  Info,
  TrendingUp,
  Coins,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminSettingService } from '@/services/admin-setting.service';

const PRESET_RATES = [10, 15, 20, 25, 30];

export default function CommissionSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Stored active rate from DB (as percentage integer/float e.g. 30 for 30%)
  const [activeRate, setActiveRate] = useState<number>(30);
  // Form input percentage
  const [inputRate, setInputRate] = useState<string>('30');

  // Interactive Live Preview Sample Amount
  const [sampleAmount, setSampleAmount] = useState<string>('100');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const settings = await adminSettingService.getAdminSettings();
      const rawRateStr = settings.WITHDRAWAL_COMMISSION_RATE || '0.30';
      const parsedDecimal = parseFloat(rawRateStr);
      // Convert decimal (e.g. 0.30) to percentage number (30)
      const percentVal = Number.isNaN(parsedDecimal)
        ? 30
        : Math.round(parsedDecimal * 100 * 100) / 100;

      setActiveRate(percentVal);
      setInputRate(percentVal.toString());
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err?.message || 'Failed to load commission settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const numericInput = parseFloat(inputRate);
    if (Number.isNaN(numericInput) || numericInput < 0 || numericInput > 100) {
      toast.error('Please enter a valid commission rate between 0% and 100%');
      return;
    }

    // Convert percentage (e.g. 30) to decimal format expected by backend (e.g. 0.30)
    const decimalRate = numericInput / 100;

    setSaving(true);
    try {
      await adminSettingService.updateCommissionRate(decimalRate);
      setActiveRate(numericInput);
      toast.success(`Commission rate updated successfully to ${numericInput}%`);
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err?.message || 'Failed to update commission rate');
    } finally {
      setSaving(false);
    }
  };

  const handlePresetSelect = (preset: number) => {
    setInputRate(preset.toString());
  };

  const currentFormRateNum = parseFloat(inputRate) || 0;
  const validSampleAmount = parseFloat(sampleAmount) || 0;

  // Calculation breakdown based on current input rate
  const platformCutAmount = (validSampleAmount * currentFormRateNum) / 100;
  const travelerPayoutAmount = validSampleAmount - platformCutAmount;

  const isChanged = currentFormRateNum !== activeRate;

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-primary/10 text-primary">
              <Percent className="h-6 w-6" />
            </span>
            <h1 className="text-3xl font-bold tracking-tight">Commission Settings</h1>
          </div>
          <p className="text-muted-foreground mt-1.5 text-sm md:text-base">
            Manage global platform commission rate applied on shipment payments and traveler
            payouts.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchSettings}
          disabled={loading || saving}
          className="self-start md:self-auto gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Settings
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 h-[380px] animate-pulse bg-muted/40" />
          <Card className="h-[380px] animate-pulse bg-muted/40" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Controls Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Active Rate Status Banner */}
            <Card className="border-primary/20 bg-primary/[0.1]">
              <CardContent className="">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                      Active Platform Commission Rate
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold text-primary">{activeRate}%</span>
                      <span className="text-xs text-muted-foreground font-medium">
                        ({(activeRate / 100).toFixed(2)} decimal cut)
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Commission Rate Modification Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Coins className="h-5 w-5 text-primary" />
                  Update Commission Cut
                </CardTitle>
                <CardDescription>
                  Enter a new commission percentage to apply for future shipment payouts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Rate Input Field */}
                <div className="space-y-2">
                  <Label htmlFor="commission-rate" className="font-semibold text-sm">
                    Commission Percentage (%)
                  </Label>
                  <div className="relative">
                    <Input
                      id="commission-rate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={inputRate}
                      onChange={(e) => setInputRate(e.target.value)}
                      placeholder="e.g. 30"
                      className="pr-10 text-lg font-bold"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                      %
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="h-3.5 w-3.5 shrink-0 text-primary" />
                    Values must be between 0.0% and 100.0%.
                  </p>
                </div>

                {/* Quick Presets */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground font-medium">
                    Quick Preset Rates
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_RATES.map((preset) => {
                      const isSelected = currentFormRateNum === preset;
                      return (
                        <Button
                          key={preset}
                          type="button"
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePresetSelect(preset)}
                          className="font-semibold"
                        >
                          {preset}%
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Save Action */}
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {isChanged ? 'Unsaved changes pending' : 'No changes made'}
                  </span>
                  <div className="flex gap-3">
                    {isChanged && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setInputRate(activeRate.toString())}
                        disabled={saving}
                      >
                        Reset
                      </Button>
                    )}
                    <Button
                      type="button"
                      onClick={handleSave}
                      disabled={saving || !isChanged}
                      className="gap-2 font-bold px-6"
                    >
                      {saving ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Update Commission Rate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Live Impact Calculator Preview */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="lg:col-span-5"
          >
            <Card className="h-full border-primary/20 shadow-md">
              <CardHeader className="bg-muted/30 border-b border-border">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Live Payout Impact Preview
                </CardTitle>
                <CardDescription>
                  Simulate payout split on a sample shipment amount using the selected rate.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Sample Shipment Price Input */}
                <div className="space-y-2">
                  <Label
                    htmlFor="sample-amount"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    Sample Shipment Payment Amount
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="sample-amount"
                      type="number"
                      min="1"
                      value={sampleAmount}
                      onChange={(e) => setSampleAmount(e.target.value)}
                      className="pl-9 font-semibold"
                    />
                  </div>
                </div>

                {/* Calculation Cards */}
                <div className="space-y-3 pt-2">
                  <div className="p-4 rounded-lg bg-card border border-border flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground font-medium block">
                        Gross Shipment Payment
                      </span>
                      <span className="text-lg font-bold">${validSampleAmount.toFixed(2)}</span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded bg-muted text-muted-foreground font-semibold">
                      100%
                    </span>
                  </div>

                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-primary font-semibold block">
                        Platform Commission ({currentFormRateNum}%)
                      </span>
                      <span className="text-xl font-extrabold text-primary">
                        ${platformCutAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="p-2 rounded-full bg-primary/20 text-primary">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block">
                        Traveler Net Payout ({Math.max(0, 100 - currentFormRateNum)}%)
                      </span>
                      <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                        ${travelerPayoutAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Info Note */}
                <div className="p-3.5 rounded-lg bg-muted/50 text-xs text-muted-foreground space-y-1 border border-border/50">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-primary" />
                    How this applies
                  </span>
                  <p>
                    When a traveler completes delivery for a shipment, the system calculates
                    platform earnings using this rate upon release/withdrawal.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
