import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCrossPlatformChannel } from '@/hooks/useCrossPlatformChannel';
import {
  KumiteStateSync,
  KUMITE_EVENTS,
  PenaltyType,
  TechniqueType,
  WarningType,
} from '@/types/events';
import { Card, CardBody, Chip } from '@heroui/react';
import WinnerModal from './WinnerModal';
import '@/styles/projection.css';

type BadgeTone = 'warning' | 'danger';

function MarkerDots({
  count,
  total = 3,
  activeClass,
  inactiveClass,
}: {
  count: number;
  total?: number;
  activeClass: string;
  inactiveClass: string;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, index) => {
        const active = index < count;
        return (
          <span
            key={index}
            className={`h-5 w-5 rounded-full border-2 ${active ? activeClass : inactiveClass}`}
          />
        );
      })}
    </div>
  );
}

function groupItems<T>(items: T[], size: number): T[][] {
  const grouped: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    grouped.push(items.slice(index, index + size));
  }

  return grouped;
}

function StatusChip({
  active,
  label,
}: {
  active: boolean;
  label: string;
}) {
  return (
    <span
      className={`rounded-full border px-3 py-1 font-black uppercase tracking-[0.22em] projection-text-xs ${
        active
          ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300'
          : 'border-amber-400/40 bg-amber-500/10 text-amber-200'
      }`}
    >
      {label}
    </span>
  );
}

function BadgeGrid({
  title,
  items,
  tone,
  light,
  translateKey,
}: {
  title: string;
  items: PenaltyType[] | WarningType[];
  tone: BadgeTone;
  light?: boolean;
  translateKey: 'penalties' | 'warnings';
}) {
  const rows = groupItems(items, 3);

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="flex min-h-0 flex-col gap-2">
      <p
        className={`projection-text-xs font-black uppercase tracking-[0.24em] ${
          light ? 'text-gray-600/80' : 'text-white/65'
        }`}
      >
        {title}
      </p>
      <div className="flex min-h-0 flex-col gap-2">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex flex-wrap justify-center gap-2">
            {row.map((item, itemIndex) => (
              <Chip
                key={`${item}-${rowIndex}-${itemIndex}`}
                color={tone}
                size="sm"
                variant="flat"
                className={`projection-text-xs font-bold ${
                  light ? 'text-gray-800' : 'text-white'
                }`}
              >
                {translateKey === 'penalties'
                  ? item
                  : item}
              </Chip>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function CompetitorPanel({
  accentClass,
  bodyClass,
  chipClass,
  isLight,
  label,
  name,
  score,
  penalties,
  techniqueCounts,
  atenaiCount,
  warnings,
  penaltyTitle,
  warningTitle,
  t,
}: {
  accentClass: string;
  bodyClass: string;
  chipClass: string;
  isLight: boolean;
  label: string;
  name: string;
  score: number;
  penalties: PenaltyType[];
  techniqueCounts: Record<TechniqueType, number>;
  atenaiCount: number;
  warnings: WarningType[];
  penaltyTitle: string;
  warningTitle: string;
  t: (key: string) => string;
}) {
  return (
    <Card className={`projection-panel h-full border-4 ${accentClass}`}>
      <CardBody className={`grid h-full min-h-0 grid-rows-[auto_auto_auto_1fr] ${bodyClass}`}>
        <div className="text-center">
          <span
            className={`inline-flex rounded-full px-4 py-1.5 projection-text-sm font-black tracking-[0.18em] ${chipClass}`}
          >
            {label}
          </span>
        </div>

        <div className="flex min-h-0 flex-col items-center justify-center text-center">
          <h2
            className={`projection-text-xl w-full truncate font-black ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}
          >
            {name || 'BYE'}
          </h2>
          <div
            className={`projection-text-score leading-none font-black ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}
          >
            {score}
          </div>
        </div>

        <div className="grid gap-3">
          <div>
            <p
              className={`mb-2 text-center projection-text-xs font-black uppercase tracking-[0.22em] ${
                isLight ? 'text-gray-700/80' : 'text-white/70'
              }`}
            >
              Wazari
            </p>
            <MarkerDots
              count={techniqueCounts.wazari || 0}
              activeClass={isLight ? 'border-gray-700 bg-transparent' : 'border-white bg-transparent'}
              inactiveClass={isLight ? 'border-gray-400/35 bg-white/35' : 'border-white/25 bg-white/10'}
            />
          </div>
          <div>
            <p
              className={`mb-2 text-center projection-text-xs font-black uppercase tracking-[0.22em] ${
                isLight ? 'text-amber-800/80' : 'text-amber-200/80'
              }`}
            >
              Atenai
            </p>
            <MarkerDots
              count={atenaiCount}
              activeClass={isLight ? 'border-amber-700 bg-transparent' : 'border-amber-200 bg-transparent'}
              inactiveClass={isLight ? 'border-amber-700/20 bg-amber-100/40' : 'border-amber-200/25 bg-amber-100/10'}
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-col justify-end gap-3">
          <BadgeGrid
            title={penaltyTitle}
            items={penalties}
            tone="warning"
            light={isLight}
            translateKey="penalties"
          />
          <BadgeGrid
            title={warningTitle}
            items={warnings}
            tone="danger"
            light={isLight}
            translateKey="warnings"
          />
          {penalties.length === 0 && warnings.length === 0 ? (
            <div
              className={`text-center projection-text-xs font-semibold uppercase tracking-[0.22em] ${
                isLight ? 'text-gray-600/65' : 'text-white/45'
              }`}
            >
              {t('common:noData')}
            </div>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
}

export default function VentanaKumite() {
  const { t } = useTranslation(['kumite', 'common']);
  const [kumiteData, setKumiteData] = useState<KumiteStateSync | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useCrossPlatformChannel<KumiteStateSync>(KUMITE_EVENTS.SYNC_STATE, (data) => {
    setKumiteData(data);
    setIsConnected(true);
  });

  useEffect(() => {
    document.body.classList.add('projection-body', 'projection-kumite');

    return () => {
      document.body.classList.remove('projection-body', 'projection-kumite');
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnected(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const statusLabel = useMemo(() => {
    if (!kumiteData) return '';
    if (kumiteData.status === 'pending') return t('kumite:bracket.pending').toUpperCase();
    if (kumiteData.status === 'completed') return t('kumite:bracket.completed').toUpperCase();
    return t('kumite:bracket.inProgress').toUpperCase();
  }, [kumiteData, t]);
  const isAtoshiBaraku =
    !!kumiteData &&
    kumiteData.timeRemaining > 0 &&
    kumiteData.timeRemaining <= 15;

  if (!kumiteData || !kumiteData.currentMatch) {
    return (
      <div className="projection-root bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="projection-shell flex items-center justify-center">
          <div className="projection-frame flex items-center justify-center">
            <div className="flex max-w-4xl flex-col items-center text-center">
              <div className="projection-text-hero mb-6 leading-none">KUMITE</div>
              <h1 className="projection-text-xl mb-3 font-black">
                {t('kumite:projection.title')}
              </h1>
              <p className="projection-text-md mb-6 text-gray-400">
                {t('kumite:projection.noMatch')}
              </p>
              <StatusChip
                active={isConnected}
                label={
                  isConnected
                    ? t('kumite:projection.connected')
                    : t('kumite:projection.connecting')
                }
              />
              <p className="projection-text-xs mt-5 text-gray-500">
                {t('kumite:projection.shortcuts')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="projection-root bg-gradient-to-br from-red-950 via-slate-950 to-blue-950 text-white">
      <div className="projection-shell">
        <div className="projection-frame grid min-h-0 grid-rows-[auto_minmax(0,0.95fr)_minmax(0,1.25fr)_auto_auto] gap-3">
          <header className="projection-panel grid min-h-0 grid-cols-[1fr_auto] items-center gap-3 rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-md">
            <div className="min-w-0">
              <h1 className="projection-text-lg truncate font-black uppercase tracking-[0.12em] text-white">
                {kumiteData.categoria || t('kumite:projection.currentMatch')}
              </h1>
              <p className="projection-text-sm truncate text-white/65">
                {kumiteData.area ? `${t('kumite:config.area')} ${kumiteData.area}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isConnected
                    ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]'
                    : 'bg-rose-400'
                }`}
              />
              <StatusChip
                active={kumiteData.isRunning}
                label={kumiteData.isRunning ? 'EN CURSO' : 'PAUSADO'}
              />
            </div>
          </header>

          <section className="projection-panel min-h-0 rounded-[2rem] border border-white/15 bg-black/35 shadow-2xl backdrop-blur-md">
            <Card className="h-full bg-transparent shadow-none">
              <CardBody className="flex h-full min-h-0 items-center justify-center px-4 py-3">
                <div className="text-center">
                  <div
                    className={`projection-text-timer font-black leading-none tracking-[0.08em] ${
                      isAtoshiBaraku
                        ? 'animate-pulse text-amber-300'
                        : kumiteData.timeRemaining === 0
                          ? 'text-red-600'
                          : 'text-white'
                    }`}
                  >
                    {formatTime(kumiteData.timeRemaining)}
                  </div>
                  {isAtoshiBaraku ? (
                    <div className="mt-3 projection-text-sm font-black uppercase tracking-[0.24em] text-amber-300">
                      Atoshi Baraku
                    </div>
                  ) : null}
                </div>
              </CardBody>
            </Card>
          </section>

          <section className="projection-panel grid min-h-0 grid-cols-2 gap-3">
            <CompetitorPanel
              accentClass="border-gray-300 bg-gradient-to-br from-gray-100 to-gray-400 text-gray-900"
              bodyClass="px-4 py-4"
              chipClass="bg-white/80 text-gray-800"
              isLight
              label={t('kumite:competitor.shiro').toUpperCase()}
              name={kumiteData.competidorShiro}
              score={kumiteData.scoreShiro}
              penalties={kumiteData.penaltiesShiro || []}
              techniqueCounts={kumiteData.techniqueCountsShiro}
              atenaiCount={kumiteData.atenaiCountShiro || 0}
              warnings={kumiteData.warningsShiro || []}
              penaltyTitle={t('kumite:penalties.title')}
              warningTitle={t('kumite:warnings.title')}
              t={t}
            />
            <CompetitorPanel
              accentClass="border-red-400 bg-gradient-to-br from-red-700/85 to-red-950/85"
              bodyClass="px-4 py-4"
              chipClass="bg-red-950/50 text-red-100"
              isLight={false}
              label={t('kumite:competitor.aka').toUpperCase()}
              name={kumiteData.competidorAka}
              score={kumiteData.scoreAka}
              penalties={kumiteData.penaltiesAka || []}
              techniqueCounts={kumiteData.techniqueCountsAka}
              atenaiCount={kumiteData.atenaiCountAka || 0}
              warnings={kumiteData.warningsAka || []}
              penaltyTitle={t('kumite:penalties.title')}
              warningTitle={t('kumite:warnings.title')}
              t={t}
            />
          </section>

          <div className="projection-panel flex items-center justify-center">
            <span className="rounded-full border border-white/15 bg-black/30 px-5 py-2 projection-text-sm font-black uppercase tracking-[0.2em] text-white shadow-lg">
              {statusLabel}
            </span>
          </div>

          <footer className="projection-panel text-center projection-text-xs font-medium text-white/45">
            {t('kumite:projection.shortcuts')}
          </footer>
        </div>
      </div>

      {kumiteData.winner && (
        <WinnerModal
          isOpen={!!kumiteData.winner}
          onClose={() => {}}
          winnerName={kumiteData.winner.name}
          scoreAka={kumiteData.scoreAka}
          scoreShiro={kumiteData.scoreShiro}
          side={kumiteData.winner.side}
          reason={kumiteData.winner.reason}
        />
      )}
    </div>
  );
}
