// File: src/components/dashboard/AIInsightsPanel.tsx
import { useEffect } from "react";
import {
  Sparkles, RefreshCw, TrendingUp, TrendingDown, Minus,
  AlertTriangle, Lightbulb, ShieldAlert, ArrowUp, ArrowDown,
  Clock, Wifi, WifiOff,
} from "lucide-react";
import { useStore } from "../../store/useStore";
import { cn } from "../../lib/utils";
import { formatDistanceToNow } from "date-fns";

// ─── Market Mood Badge ────────────────────────────────────────────────────────

function MoodBadge({ mood }: { mood: 'growing' | 'stable' | 'declining' }) {
  const config = {
    growing:  { icon: TrendingUp,   label: 'Market Growing',  cls: 'bg-success/10 text-success border-success/20' },
    stable:   { icon: Minus,        label: 'Market Stable',   cls: 'bg-primary/10 text-primary border-primary/20' },
    declining:{ icon: TrendingDown, label: 'Market Declining', cls: 'bg-warning/10 text-warning border-warning/20' },
  }[mood];

  const Icon = config.icon;

  return (
    <span className={cn('flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border', config.cls)}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

// ─── Price Recommendation Row ─────────────────────────────────────────────────

function PriceRow({ rec }: {
  rec: {
    productName: string;
    currentPrice: number;
    suggestedPrice: number;
    direction: 'raise' | 'lower' | 'hold';
    reason: string;
  }
}) {
  const isRaise = rec.direction === 'raise';
  const diff = Math.abs(rec.suggestedPrice - rec.currentPrice);
  const pct = rec.currentPrice > 0 ? Math.round((diff / rec.currentPrice) * 100) : 0;

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
        isRaise ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
      )}>
        {isRaise ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-sm font-bold text-white truncate">{rec.productName}</p>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-text-muted line-through">{rec.currentPrice.toLocaleString()}</span>
            <span className={cn('text-xs font-black', isRaise ? 'text-success' : 'text-danger')}>
              → {rec.suggestedPrice.toLocaleString()} RWF
            </span>
            <span className={cn(
              'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
              isRaise ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
            )}>
              {isRaise ? '+' : '-'}{pct}%
            </span>
          </div>
        </div>
        <p className="text-xs text-text-muted mt-0.5">{rec.reason}</p>
      </div>
    </div>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 bg-white/5 rounded-lg w-3/4" />
      <div className="h-4 bg-white/5 rounded-lg w-full" />
      <div className="h-4 bg-white/5 rounded-lg w-5/6" />
      <div className="h-16 bg-white/5 rounded-xl mt-4" />
      <div className="h-16 bg-white/5 rounded-xl" />
      <div className="h-16 bg-white/5 rounded-xl" />
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export function AIInsightsPanel() {
  const { aiInsights, aiLoading, aiError, aiLastFetched, fetchAIInsights } = useStore();

  // Auto-fetch on first mount if no cached insights or cache is stale (> 30 min)
  useEffect(() => {
    const isStale = !aiLastFetched || Date.now() - aiLastFetched > 30 * 60 * 1000;
    if (isStale && !aiLoading) {
      fetchAIInsights();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cooldownMs = aiLastFetched ? 30 * 60 * 1000 - (Date.now() - aiLastFetched) : 0;
  const onCooldown = cooldownMs > 0;
  const cooldownMin = Math.ceil(cooldownMs / 60000);

  return (
    <div
      className="rounded-2xl border flex flex-col"
      style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.05) 0%, rgba(0,212,170,0.03) 100%)',
        borderColor: 'rgba(139,92,246,0.2)',
      }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #00d4aa)' }}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">AI Market Insights</h3>
            <p className="text-[10px] text-text-muted">Powered by Gemini 2.0 Flash</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Last updated */}
          {aiLastFetched && !aiLoading && (
            <span className="hidden sm:flex items-center gap-1 text-[10px] text-text-muted">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(aiLastFetched), { addSuffix: true })}
            </span>
          )}

          {/* Refresh button */}
          <button
            onClick={() => fetchAIInsights(true)}
            disabled={aiLoading}
            title={onCooldown ? `Cooldown: ${cooldownMin} min remaining` : 'Refresh AI insights'}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border',
              aiLoading
                ? 'opacity-50 cursor-not-allowed border-white/10 text-text-muted'
                : onCooldown
                ? 'border-warning/20 text-warning/70 hover:bg-warning/5'
                : 'border-violet-500/30 text-violet-400 hover:bg-violet-500/10'
            )}
          >
            <RefreshCw className={cn('w-3.5 h-3.5', aiLoading && 'animate-spin')} />
            {aiLoading ? 'Analyzing...' : onCooldown ? `${cooldownMin}m` : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-5 space-y-5 flex-1">

        {/* Error toast */}
        {aiError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-warning/10 border border-warning/20 text-xs text-warning font-medium">
            <WifiOff className="w-4 h-4 shrink-0" />
            {aiError}
          </div>
        )}

        {/* Loading skeleton */}
        {aiLoading && !aiInsights && <Skeleton />}

        {/* No data yet */}
        {!aiLoading && !aiInsights && (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #8b5cf620, #00d4aa20)' }}>
              <Sparkles className="w-6 h-6 text-violet-400" />
            </div>
            <p className="text-sm font-bold text-white">No insights yet</p>
            <p className="text-xs text-text-muted max-w-[200px]">
              Click Refresh to get AI-powered market analysis for your store.
            </p>
          </div>
        )}

        {/* ── Insights content ── */}
        {aiInsights && (
          <>
            {/* Summary + mood */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <MoodBadge mood={aiInsights.marketMood} />
                {aiLoading && (
                  <span className="flex items-center gap-1 text-[10px] text-violet-400 animate-pulse">
                    <Sparkles className="w-3 h-3" /> Updating...
                  </span>
                )}
              </div>
              <p className="text-sm text-text-muted leading-relaxed">{aiInsights.summary}</p>
            </div>

            {/* Price recommendations */}
            {aiInsights.priceRecommendations.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3" /> Price Actions
                </p>
                {aiInsights.priceRecommendations.map((rec, i) => (
                  <PriceRow key={i} rec={rec} />
                ))}
              </div>
            )}

            {/* Urgent restock */}
            {aiInsights.restockUrgent.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted flex items-center gap-1.5">
                  <ShieldAlert className="w-3 h-3" /> Restock Now
                </p>
                <div className="flex flex-wrap gap-2">
                  {aiInsights.restockUrgent.map((name, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-danger/10 text-danger border border-danger/20"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Opportunity + Risk */}
            <div className="grid grid-cols-1 gap-3">
              <div className="p-3 rounded-xl bg-success/5 border border-success/15">
                <p className="text-[10px] font-bold uppercase tracking-widest text-success mb-1 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" /> Top Opportunity
                </p>
                <p className="text-xs text-white">{aiInsights.topOpportunity}</p>
              </div>
              <div className="p-3 rounded-xl bg-warning/5 border border-warning/15">
                <p className="text-[10px] font-bold uppercase tracking-widest text-warning mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Risk to Watch
                </p>
                <p className="text-xs text-white">{aiInsights.riskWarning}</p>
              </div>
            </div>

            {/* Live indicator */}
            <div className="flex items-center gap-2 pt-1">
              <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
              <span className="text-[10px] text-text-muted">
                Connected · Updates every 30 min
              </span>
              <Wifi className="w-3 h-3 text-text-muted ml-auto" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}