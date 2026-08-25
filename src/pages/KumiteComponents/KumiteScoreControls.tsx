import { Button } from "@heroui/react";

export function playBell() {
  if (typeof window === "undefined") return;
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;
  const audioContext = new AudioContextClass();
  const now = audioContext.currentTime;
  [0, 0.22].forEach((offset) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(1320, now + offset);
    gainNode.gain.setValueAtTime(0.0001, now + offset);
    gainNode.gain.exponentialRampToValueAtTime(0.18, now + offset + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.28);
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start(now + offset);
    oscillator.stop(now + offset + 0.3);
  });
  window.setTimeout(() => void audioContext.close().catch(() => undefined), 700);
}

export function MarkerDots({ count, total = 3, filledClass, emptyClass }: { count: number; total?: number; filledClass: string; emptyClass: string }) {
  return <div className="flex items-center justify-center gap-2">{Array.from({ length: total }).map((_, index) => <span key={index} className={`h-4 w-4 rounded-full border-2 ${index < count ? filledClass : emptyClass}`} />)}</div>;
}

export function ScoreControl({ label, points, onAdd, onRemove, disabled, currentMatch, side, markerType }: { label: string; points: number; onAdd: () => void; onRemove: () => void; disabled: boolean; currentMatch: any; side: "aka" | "shiro"; markerType?: "wazari" | "ippon" | "atenai" }) {
  const isShiro = side === "shiro";
  const markerCount = markerType === "atenai" ? (isShiro ? currentMatch.atenaiCountShiro || 0 : currentMatch.atenaiCountAka || 0) : markerType === "wazari" ? (isShiro ? currentMatch.techniqueCountsShiro?.wazari || 0 : currentMatch.techniqueCountsAka?.wazari || 0) : markerType === "ippon" ? (isShiro ? currentMatch.techniqueCountsShiro?.ippon || 0 : currentMatch.techniqueCountsAka?.ippon || 0) : 0;
  const markerTotal = markerType === "wazari" ? 5 : 3;
  const filledClass = isShiro ? markerType === "atenai" ? "border-amber-600 bg-transparent" : "border-slate-600 bg-transparent" : markerType === "atenai" ? "border-amber-200 bg-transparent" : "border-rose-100 bg-transparent";
  const emptyClass = isShiro ? markerType === "atenai" ? "border-amber-700/25 bg-amber-100/40" : "border-slate-400/40 bg-white/35" : markerType === "atenai" ? "border-amber-100/30 bg-amber-200/10" : "border-rose-100/35 bg-rose-200/15";
  return <div className="rounded-2xl border border-[rgba(80,125,196,0.18)] bg-[rgba(8,17,32,0.55)] p-1">
    {markerType && <MarkerDots count={markerCount} total={markerTotal} filledClass={filledClass} emptyClass={emptyClass} />}
    <div className="mb-2 text-center text-sm font-semibold text-slate-200">{label}</div>
    <div className="grid grid-cols-2 gap-2"><Button size="sm" variant="flat" className="bg-rose-500/18 text-rose-100" onPress={onRemove} isDisabled={disabled}>-{points}</Button><Button size="sm" color="primary" onPress={onAdd} isDisabled={disabled}>+{points}</Button></div>
  </div>;
}
