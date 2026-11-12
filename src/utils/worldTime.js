// 도시별 현지 시각 계산 (전광판 도트 시계용).
// Intl.DateTimeFormat 생성이 꽤 비싸서 타임존별로 한 번만 만들어 재사용합니다 (1초마다 갱신되므로).

const fmtCache = new Map()

function formatter(tz) {
  if (!fmtCache.has(tz)) {
    fmtCache.set(
      tz,
      new Intl.DateTimeFormat('en-CA', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    )
  }
  return fmtCache.get(tz)
}

function parts(date, tz) {
  const o = {}
  for (const p of formatter(tz).formatToParts(date)) o[p.type] = p.value
  return o
}

// 사용자 현지 날짜 대비 며칠 차이인지(+1D/-1D 표기용). 날짜 문자열끼리 UTC로 비교해 DST 영향을 피합니다.
function dayIndex(p) {
  return Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day)) / 86400000
}

const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone

// 갈리프레이처럼 timezone === 'relative' 인 곳은 사용자의 현지 시간을 그대로 보여줍니다.
export function getCityTime(city, date = new Date()) {
  const tz = !city.timezone || city.timezone === 'relative' ? userTz : city.timezone
  try {
    const p = parts(date, tz)
    const mine = parts(date, userTz)
    return {
      hh: p.hour,
      mm: p.minute,
      dayDiff: dayIndex(p) - dayIndex(mine),
      relative: city.timezone === 'relative',
    }
  } catch {
    return { hh: '--', mm: '--', dayDiff: 0, relative: false }
  }
}

export function formatDayDiff(n) {
  if (!n) return ''
  return n > 0 ? `+${n}D` : `${n}D`
}
