import { ref, onMounted, onUnmounted } from 'vue'

// object-fit: cover + object-position: center bottom 로 렌더링된 <img> 위에서,
// "원본 이미지 기준 (fx, fy) 위치(0~1)에 있는 소품"이 화면상 몇 %/몇 %에 보이는지 계산합니다.
//
// 왜 필요한가: cover는 뷰포트 비율에 따라 이미지를 다르게 잘라냅니다(가로를 자를 때도,
// 세로를 자를 때도 있음). 그냥 CSS %로 고정하면 화면 비율이 바뀔 때마다 소품 위치가 틀어집니다.
// 이 함수는 실제 렌더링된 <img> 박스 크기와 원본 이미지 크기를 비교해서 매번 정확히 다시 계산합니다.
export function useImageHotspot(imgRef, fx, fy) {
  const style = ref({ left: '50%', top: '90%', opacity: 0 })

  function recalc() {
    const el = imgRef.value
    if (!el || !el.naturalWidth) return

    const containerW = el.clientWidth
    const containerH = el.clientHeight
    const naturalW = el.naturalWidth
    const naturalH = el.naturalHeight
    if (!containerW || !containerH) return

    // object-fit: cover 스케일 계산
    const scale = Math.max(containerW / naturalW, containerH / naturalH)
    const displayedW = naturalW * scale
    const displayedH = naturalH * scale

    // object-position: center bottom → 가로는 중앙 정렬, 세로는 바닥 고정
    const offsetX = (containerW - displayedW) / 2
    const offsetY = containerH - displayedH

    const screenX = offsetX + fx * displayedW
    const screenY = offsetY + fy * displayedH

    style.value = {
      left: `${(screenX / containerW) * 100}%`,
      top: `${(screenY / containerH) * 100}%`,
      opacity: 1,
    }
  }

  let resizeObserver = null
  onMounted(() => {
    recalc()
    // 이미지 로드가 늦게 끝나는 경우 대비
    imgRef.value?.addEventListener('load', recalc)
    resizeObserver = new ResizeObserver(recalc)
    if (imgRef.value) resizeObserver.observe(imgRef.value)
    window.addEventListener('resize', recalc)
  })
  onUnmounted(() => {
    imgRef.value?.removeEventListener('load', recalc)
    resizeObserver?.disconnect()
    window.removeEventListener('resize', recalc)
  })

  return { style, recalc }
}
