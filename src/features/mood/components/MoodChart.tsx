import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatDate, formatNumber } from '@/lib/format';
import type { MoodPoint } from '../aggregate';
import { moodLevel } from '../scale';

interface ChartTooltipProps {
  active?: boolean | undefined;
  payload?: readonly { payload?: unknown }[] | undefined;
}

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  const { t } = useTranslation();
  const point = payload?.[0]?.payload as MoodPoint | undefined;
  if (!active || !point) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-soft">
      <p className="font-medium">
        {formatDate(`${point.date}T06:00:00Z`, {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        })}
      </p>
      {point.average === null ? (
        <p className="text-muted-foreground">{t('mood.chart.noEntry')}</p>
      ) : (
        <p className="text-muted-foreground">
          {t(`mood.levels.${moodLevel(point.average).key}`)} · {formatNumber(point.average)}/
          {formatNumber(5)}
        </p>
      )}
    </div>
  );
}

/**
 * Daily average mood. Gaps are left as gaps (connectNulls=false) so missing days are visible.
 * A visually hidden table carries the same data for screen readers.
 */
export function MoodChart({ points, days }: { points: MoodPoint[]; days: number }) {
  const { t } = useTranslation();
  const tickEvery = days <= 7 ? 1 : days <= 30 ? 5 : 15;
  const ticks = useMemo(
    () => points.filter((_, i) => i % tickEvery === 0).map((p) => p.date),
    [points, tickEvery],
  );

  return (
    <figure>
      <div className="h-56 w-full text-primary" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            accessibilityLayer={false}
            data={points}
            margin={{ top: 8, right: 8, bottom: 0, left: -24 }}
          >
            <defs>
              <linearGradient id="mood-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity={0.3} />
                <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="date"
              ticks={ticks}
              tickFormatter={(d: string) =>
                formatDate(`${d}T06:00:00Z`, { day: 'numeric', month: 'short' })
              }
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tickFormatter={(v: number) => formatNumber(v)}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={(props) => <ChartTooltip active={props.active} payload={props.payload} />}
              cursor={{ stroke: 'var(--border)' }}
            />
            <Area
              type="monotone"
              dataKey="average"
              stroke="currentColor"
              strokeWidth={2.5}
              fill="url(#mood-fill)"
              connectNulls={false}
              dot={days <= 30 ? { r: 3, fill: 'var(--card)', strokeWidth: 2 } : false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">
        {t('mood.chart.caption', { days: formatNumber(days) })}
      </figcaption>
      <table className="sr-only">
        <thead>
          <tr>
            <th scope="col">{t('mood.chart.date')}</th>
            <th scope="col">{t('mood.chart.average')}</th>
          </tr>
        </thead>
        <tbody>
          {points
            .filter((p) => p.average !== null)
            .map((p) => (
              <tr key={p.date}>
                <td>{formatDate(`${p.date}T06:00:00Z`)}</td>
                <td>{formatNumber(p.average ?? 0)}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </figure>
  );
}
