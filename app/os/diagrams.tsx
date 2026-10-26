import type { OsContent } from './content';
import styles from './os.module.css';

const ROW_GAP = 60;
const FIRST_ROW_Y = 40;
const SOURCE_Y = 220;

export function RoutingDiagram({ diagram }: { diagram: OsContent['diagram'] }) {
  const ends = diagram.channels.map((channel, i) => ({
    ...channel,
    y: FIRST_ROW_Y + i * ROW_GAP,
  }));

  return (
    <figure className={styles.diagram}>
      <svg
        className={styles.diagramSvg}
        viewBox="0 0 760 440"
        role="img"
        aria-label={`${diagram.source}: ${diagram.channels.map((c) => c.name).join(', ')}`}
      >
        <rect x="0" y={SOURCE_Y - 52} width="244" height="104" rx="4" className={styles.sourceBox} />
        <text x="24" y={SOURCE_Y - 6} className={styles.sourceTitle}>
          {diagram.source}
        </text>
        <text x="24" y={SOURCE_Y + 22} className={styles.sourceNote}>
          {diagram.sourceNote}
        </text>
        {ends.map((end, i) => (
          <g key={end.name} style={{ ['--i' as string]: i }}>
            <path
              d={`M244 ${SOURCE_Y} C 360 ${SOURCE_Y}, 340 ${end.y}, 452 ${end.y}`}
              pathLength={1}
              className={styles.route}
            />
            <circle cx="458" cy={end.y} r="5" className={styles.routeEnd} />
            <text x="480" y={end.y - 2} className={styles.channelName}>
              {end.name}
            </text>
            <text x="480" y={end.y + 18} className={styles.channelFormat}>
              {end.format}
            </text>
          </g>
        ))}
      </svg>

      <div className={styles.diagramMobile}>
        <p className={styles.mobileSource}>
          <strong>{diagram.source}</strong>
          <span>{diagram.sourceNote}</span>
        </p>
        <ul className={styles.mobileChannels} role="list">
          {diagram.channels.map((channel) => (
            <li key={channel.name}>
              <strong>{channel.name}</strong>
              <span>{channel.format}</span>
            </li>
          ))}
        </ul>
      </div>

      <figcaption className={styles.caption}>{diagram.caption}</figcaption>
    </figure>
  );
}

const SYS = {
  inputX: 0,
  inputW: 230,
  inputH: 58,
  inputYs: [72, 162, 252],
  coreX: 310,
  coreW: 220,
  coreY: 150,
  coreH: 120,
  agentX: 610,
  agentW: 250,
  agentH: 74,
  agentYs: [40, 173, 306],
  outX: 940,
  outW: 170,
  outY: 160,
  outH: 100,
};

function curve(x1: number, y1: number, x2: number, y2: number): string {
  const mid = (x1 + x2) / 2;
  return `M${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;
}

export function SystemDiagram({ system }: { system: OsContent['system'] }) {
  const coreMidY = SYS.coreY + SYS.coreH / 2;
  const outMidY = SYS.outY + SYS.outH / 2;

  return (
    <figure className={styles.systemFigure}>
      <svg
        className={styles.systemSvg}
        viewBox="0 0 1110 430"
        role="img"
        aria-label={[system.inputs.join(', '), system.core.name, system.agents.map((a) => a.name).join(', '), system.output.name].join(' / ')}
      >
        <text x={SYS.inputX} y="44" className={styles.sysLabel}>
          {system.inputsLabel}
        </text>
        {SYS.inputYs.map((y, i) => (
          <g key={system.inputs[i]}>
            <rect x={SYS.inputX} y={y} width={SYS.inputW} height={SYS.inputH} rx="6" className={styles.sysInput} />
            <text x={SYS.inputX + 18} y={y + SYS.inputH / 2 + 6} className={styles.sysInputText}>
              {system.inputs[i]}
            </text>
            <path
              d={curve(SYS.inputX + SYS.inputW, y + SYS.inputH / 2, SYS.coreX, coreMidY)}
              className={styles.sysEdge}
            />
          </g>
        ))}

        <rect x={SYS.coreX} y={SYS.coreY} width={SYS.coreW} height={SYS.coreH} rx="6" className={styles.sysCore} />
        <text x={SYS.coreX + 22} y={coreMidY - 6} className={styles.sysCoreTitle}>
          {system.core.name}
        </text>
        <foreignObject x={SYS.coreX + 22} y={coreMidY + 6} width={SYS.coreW - 40} height="48">
          <p className={styles.sysCoreNote}>{system.core.note}</p>
        </foreignObject>

        {SYS.agentYs.map((y, i) => {
          const agent = system.agents[i];
          const midY = y + SYS.agentH / 2;
          return (
            <g key={agent.name}>
              <path d={curve(SYS.coreX + SYS.coreW, coreMidY, SYS.agentX, midY)} className={styles.sysEdgeStrong} />
              <rect x={SYS.agentX} y={y} width={SYS.agentW} height={SYS.agentH} rx="6" className={styles.sysAgent} />
              <text x={SYS.agentX + 18} y={y + 30} className={styles.sysAgentName}>
                {agent.name}
              </text>
              <text x={SYS.agentX + 18} y={y + 54} className={styles.sysAgentBody}>
                {agent.body}
              </text>
              <path d={curve(SYS.agentX + SYS.agentW, midY, SYS.outX, outMidY)} className={styles.sysEdgeStrong} />
              <circle cx={SYS.agentX + SYS.agentW + 38} cy={midY + (outMidY - midY) * 0.18} r="7" className={styles.sysCheck} />
            </g>
          );
        })}

        <rect x={SYS.outX} y={SYS.outY} width={SYS.outW} height={SYS.outH} rx="6" className={styles.sysOut} />
        <text x={SYS.outX + 20} y={outMidY - 2} className={styles.sysOutTitle}>
          {system.output.name}
        </text>
        <text x={SYS.outX + 20} y={outMidY + 24} className={styles.sysOutNote}>
          {system.output.note}
        </text>

        <circle cx="617" cy="412" r="7" className={styles.sysCheck} />
        <text x="634" y="417" className={styles.sysLegend}>
          {system.checkpoint}
        </text>
      </svg>

      <ol className={styles.systemMobile} role="list">
        <li>
          <span className={styles.sysMobileLabel}>{system.inputsLabel}</span>
          <strong>{system.inputs.join(', ')}</strong>
        </li>
        <li className={styles.sysMobileCore}>
          <strong>{system.core.name}</strong>
          <span>{system.core.note}</span>
        </li>
        {system.agents.map((agent) => (
          <li key={agent.name}>
            <strong>{agent.name}</strong>
            <span>{agent.body}</span>
          </li>
        ))}
        <li className={styles.sysMobileCheck}>{system.checkpoint}</li>
        <li className={styles.sysMobileOut}>
          <strong>{system.output.name}</strong>
          <span>{system.output.note}</span>
        </li>
      </ol>
    </figure>
  );
}

export function LoopDiagram({ proof }: { proof: OsContent['proof'] }) {
  return (
    <figure className={styles.loopFigure}>
      <figcaption className={styles.subTitle}>{proof.loopTitle}</figcaption>
      <ol className={styles.loop} role="list">
        {proof.loop.map((step) => (
          <li key={step.name}>
            <h4 className={styles.loopName}>{step.name}</h4>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
      <p className={styles.loopReturn}>
        <span aria-hidden="true" className={styles.loopReturnLine} />
        {proof.loopReturn}
      </p>
    </figure>
  );
}

export function ReachChart({ reach, lang }: { reach: OsContent['proof']['reach']; lang: OsContent['lang'] }) {
  const max = Math.max(...reach.rows.map((r) => r.value));
  const format = new Intl.NumberFormat(lang === 'ko' ? 'ko-KR' : 'en-US');

  return (
    <figure className={styles.reach}>
      <figcaption className={styles.subTitle}>{reach.title}</figcaption>
      <ul className={styles.reachList} role="list">
        {reach.rows.map((row) => (
          <li key={row.channel} className={styles.reachRow} title={`${row.channel} ${format.format(row.value)}${reach.unit}`}>
            <span className={styles.reachLabel}>{row.channel}</span>
            <span className={styles.reachTrack} aria-hidden="true">
              <span className={styles.reachBar} style={{ width: `${Math.max((row.value / max) * 100, 0.8)}%` }} />
            </span>
            <span className={styles.reachValue}>
              {format.format(row.value)}
              {reach.unit}
            </span>
          </li>
        ))}
      </ul>
      <p className={styles.reachNote}>{reach.note}</p>
    </figure>
  );
}
