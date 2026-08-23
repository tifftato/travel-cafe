import { ref, watchEffect } from 'vue'

// public/assets/{prefix}_{countryEn}.{ext} 형태의 경로를 만들어줍니다.
// public 폴더는 빌드 시 그대로 복사되므로 import.meta.glob 으로는 감지할 수 없어,
// 런타임에 Image 프리로드로 존재 여부를 확인합니다.
export function assetPath(prefix, countryEn, ext) {
  return `/assets/${prefix}_${countryEn}.${ext}`
}

// 사용 예: const { url, exists } = useOptionalImage('bg', city.countryEn, 'jpg')
export function useOptionalImage(prefix, countryEn, ext) {
  const url = assetPath(prefix, countryEn, ext)
  const exists = ref(null) // null = 확인 중, true/false = 결과

  watchEffect((onCleanup) => {
    exists.value = null
    let cancelled = false
    const img = new Image()
    img.onload = () => {
      if (!cancelled) exists.value = true
    }
    img.onerror = () => {
      if (!cancelled) exists.value = false
    }
    img.src = url
    onCleanup(() => {
      cancelled = true
    })
  })

  return { url, exists }
}
