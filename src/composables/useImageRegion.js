import { ref, onMounted, onUnmounted } from 'vue'

// useImageHotspot과 같은 원리지만, 점 하나가 아니라 사각형 영역(예: 타이머의 빈 화면,
// 라디오의 빈 주파수 표시창)의 화면상 left/top/width/height(%)를 계산합니다.
// region = { x, y, width, height } — 전부 원본 이미지 기준 0~1 비율
export function useImageRegion(imgRef, region) {
  const style = ref({ left: '50%', top: '90%', width: '0%', height: '0%', opacity: 0 })

  function recalc() {
    const el = imgRef.value
    if (!el || !el.naturalWidth || !region) return

    const containerW = el.clientWidth
    const containerH = el.clientHeight
    const naturalW = el.naturalWidth
    const naturalH = el.naturalHeight
    if (!containerW || !containerH) return

    const scale = Math.max(containerW / naturalW, containerH / naturalH)
    const displayedW = naturalW * scale
    const displayedH = naturalH * scale
    const offsetX = (containerW - displayedW) / 2
    const offsetY = containerH - displayedH

    const screenX = offsetX + region.x * displayedW
    const screenY = offsetY + region.y * displayedH
    const screenW = region.width * displayedW
    const screenH = region.height * displayedH

    style.value = {
      left: `${(screenX / containerW) * 100}%`,
      top: `${(screenY / containerH) * 100}%`,
      width: `${(screenW / containerW) * 100}%`,
      height: `${(screenH / containerH) * 100}%`,
      opacity: 1,
    }
  }

  let resizeObserver = null
  onMounted(() => {
    recalc()
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
