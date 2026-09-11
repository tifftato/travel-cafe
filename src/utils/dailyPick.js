// 오늘 날짜 + 시드 문자열을 섞어서 배열에서 하나를 결정적으로 고릅니다.
// 같은 날엔 새로고침해도 항상 같은 결과, 날짜가 바뀌면 다른 결과가 나옵니다.
// (오늘의 커피점, 랜드마크 한 줄 트리비아가 공통으로 씁니다)
export function todayKey(date = new Date()) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  }
  return hash
}

// list: 후보 배열, seed: 오늘 날짜와 섞을 시드(보통 "도시id:용도" 형태)
// extra: 리롤 등으로 같은 날 다른 값을 뽑고 싶을 때 넘기는 추가 시드(기본 0)
export function dailyPick(list, seed, extra = 0) {
  if (!list || !list.length) return null
  const hash = hashString(`${todayKey()}:${seed}:${extra}`)
  return list[hash % list.length]
}

export function dailyPickIndex(listLength, seed, extra = 0) {
  if (!listLength) return -1
  const hash = hashString(`${todayKey()}:${seed}:${extra}`)
  return hash % listLength
}
