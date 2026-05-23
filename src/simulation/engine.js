// Engine de simulação com passo fixo determinístico.
//
// O loop visual (requestAnimationFrame) entrega deltas variáveis e dependentes
// da taxa de quadros. Para que rampas, proteções e o modelo do motor sejam
// reproduzíveis e testáveis, acumulamos o tempo e avançamos a física sempre
// em passos fixos de TICK_MS, independentemente do quadro.

export const TICK_MS = 1;

// Limite de acumulo: evita "espiral da morte" quando a aba fica em segundo
// plano e devolve um delta enorme. 250 ms = no máximo 250 ticks por quadro.
const MAX_ACCUMULATED_MS = 250;

export function createEngine() {
  return { accumulatorMs: 0, totalTicks: 0 };
}

// Avança a simulação. `stepOnce(tickMs)` é chamado uma vez por tick fixo e
// deve aplicar a fisica desse intervalo (tipicamente atualizando refs).
// Retorna quantos ticks foram processados neste quadro.
export function advance(engine, deltaMs, stepOnce) {
  let accumulator = engine.accumulatorMs + Math.max(0, deltaMs);

  if (accumulator > MAX_ACCUMULATED_MS) {
    accumulator = MAX_ACCUMULATED_MS;
  }

  let ticks = 0;
  while (accumulator >= TICK_MS) {
    stepOnce(TICK_MS);
    accumulator -= TICK_MS;
    ticks += 1;
  }

  engine.accumulatorMs = accumulator;
  engine.totalTicks += ticks;
  return ticks;
}
