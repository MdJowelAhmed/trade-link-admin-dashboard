import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {  CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

interface PricingConfig {
  oneDay: number;
  threeDays: number;
  sevenDays: number;
  fourteenDays: number;
  oneMonth: number;
}

interface WeekendConfig {
  selectedDays: ('Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat')[];
  weekendPrice: number;
}

interface PricingConfigurationProps {
  pricing: PricingConfig;
  weekend: WeekendConfig;
  onPricingChange: (pricing: PricingConfig) => void;
  onWeekendChange: (weekend: WeekendConfig) => void;
  errors?: {
    pricing?: Partial<Record<keyof PricingConfig, string>>;
    weekend?: { selectedDays?: string; weekendPrice?: string };
  };
}

const weekDays = [
  { value: 'Sun', label: 'Sun' },
  { value: 'Mon', label: 'Mon' },
  { value: 'Tue', label: 'Tue' },
  { value: 'Wed', label: 'Wed' },
  { value: 'Thu', label: 'Thu' },
  { value: 'Fri', label: 'Fri' },
  { value: 'Sat', label: 'Sat' },
] as const;

const pricingDurations = [
  { key: 'oneDay' as const, label: '1 Day (1 Day)', days: 1 },
  { key: 'threeDays' as const, label: '3 Days (2-3 Days)', days: 3 },
  { key: 'sevenDays' as const, label: '7 Days (4-7 Days)', days: 7 },
  { key: 'fourteenDays' as const, label: '14 Days (8-14 Days)', days: 14 },
  { key: 'oneMonth' as const, label: '1 Month (15-30 Days)', days: 30 },
];

export function PricingConfiguration({
  pricing,
  weekend,
  onPricingChange,
  onWeekendChange,
  errors,
}: PricingConfigurationProps) {
  const handlePricingChange = (key: keyof PricingConfig, value: number) => {
    onPricingChange({
      ...pricing,
      [key]: value,
    });
  };

  const toggleWeekendDay = (day: 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat') => {
    const newSelectedDays = weekend.selectedDays.includes(day)
      ? weekend.selectedDays.filter((d) => d !== day)
      : [...weekend.selectedDays, day];
    
    onWeekendChange({
      ...weekend,
      selectedDays: newSelectedDays,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pricing Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Pricing Configuration
          </CardTitle>
        </div>
        <div className="space-y-2">
          {pricingDurations.map((duration) => (
            <div key={duration.key} className=" flex items-center justify-between">
              <Label htmlFor={duration.key} className="text-sm font-medium text-gray-700">
                {duration.label}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  €
                </span>
                <Input
                  id={duration.key}
                  type="number"
                  // step="1"
                  min="0"
                  value={pricing[duration.key] || ''}
                  onChange={(e) =>
                    handlePricingChange(duration.key, parseFloat(e.target.value) || 0)
                  }
                  className={cn(
                    "pl-8",
                    errors?.pricing?.[duration.key] && "border-destructive"
                  )}
                  placeholder="0.00"
                />
              </div>
              {errors?.pricing?.[duration.key] && (
                <p className="text-xs text-destructive">
                  {errors.pricing[duration.key]}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Weekend Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Select your Weekend
          </CardTitle>
        </div>
        <div className="space-y-2">
          {/* Day Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Select Days</Label>
            <div className="flex flex-wrap gap-2">
              {weekDays.map((day) => {
                const isSelected = weekend.selectedDays.includes(day.value);
                return (
                  <Button
                    key={day.value}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleWeekendDay(day.value)}
                    className={cn(
                      "min-w-[50px]",
                      isSelected
                        ? "bg-primary text-white hover:bg-primary/90"
                        : "bg-white hover:bg-gray-50"
                    )}
                  >
                    {day.label}
                  </Button>
                );
              })}
            </div>
            {errors?.weekend?.selectedDays && (
              <p className="text-xs text-destructive">
                {errors.weekend.selectedDays}
              </p>
            )}
          </div>

          {/* Weekend Price */}
          <div className="space-y-1.5">
            <Label htmlFor="weekendPrice" className="text-sm font-medium text-gray-700">
              Weekend Price
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                €
              </span>
              <Input
                id="weekendPrice"
                type="number"
                step="0.01"
                min="0"
                value={weekend.weekendPrice || ''}
                onChange={(e) =>
                  onWeekendChange({
                    ...weekend,
                    weekendPrice: parseFloat(e.target.value) || 0,
                  })
                }
                className={cn(
                  "pl-8",
                  errors?.weekend?.weekendPrice && "border-destructive"
                )}
                placeholder="0.00"
              />
            </div>
            {errors?.weekend?.weekendPrice && (
              <p className="text-xs text-destructive">
                {errors.weekend.weekendPrice}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
