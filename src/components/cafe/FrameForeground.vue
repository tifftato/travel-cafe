<script setup>
import { computed, ref, provide } from 'vue'
import { useOptionalImage } from '../../composables/useOptionalImage'
import { useImageHotspot } from '../../composables/useImageHotspot'
import Hotspot from './Hotspot.vue'
import PomodoroPanel from './PomodoroPanel.vue'
import RadioPanel from './RadioPanel.vue'
import TimerInline from './TimerInline.vue'
import RadioInline from './RadioInline.vue'
import CoffeeEffect from './CoffeeEffect.vue'
import NapkinMemo from './NapkinMemo.vue'
import CoffeeFortune from './CoffeeFortune.vue'

// 창틀 + 테이블이 합쳐진 전경 레이어 (크로마키로 배경을 뚫은 투명 PNG)
// public/assets/frame_{countryEn}.png (낮, 필수) + frame_{countryEn}-night.png (밤, 선택)
const props = defineProps({
  city: { type: Object, required: true },
  visible: { type: Boolean, default: true }, // 끄면 배경 랜드마크만 화면 가득 보임
  isNight: { type: Boolean, default: false },
})

const { url: frameDayUrl, exists: dayExists } = useOptionalImage('frame', props.city.countryEn, 'png')
const { url: frameNightUrl, exists: nightExists } = useOptionalImage('frame', `${props.city.countryEn}-night`, 'png')

// 나라마다 창틀/테이블 사진의 구도가 달라서 테이블이 시작되는 높이가 제각각입니다.
const itemsHeight = props.city.tableTopVh ? `${props.city.tableTopVh}vh` : '28vh'

// hotspots가 있는 나라 = 소품까지 다 그려진 "원본 베이크인" 이미지를 bg로 쓰는 나라입니다
// (SceneBackground가 보여주는 배경 자체에 이미 창틀·테이블·소품이 다 담겨 있음).
// 이런 나라는 frame.png를 화면에 또 그리면 완전히 같은 그림이 중복으로 겹쳐질 뿐이라
// 화면에서는 숨기고(opacity: 0), 핫스팟 좌표 계산용 기준 엘리먼트로만 씁니다.
// 대신 날씨는 frame.png를 반전한 mask_{country}.png로 창문 모양에만 클리핑합니다
// (WeatherOverlay.vue 참고).
//
// hotspots가 없는 나라(기존 방식)는 bg.jpg가 랜드마크만 있는 순수 배경이라
// frame.png를 그대로 화면에 그려야 창틀·테이블이 보입니다 — 이 나라들은 예전처럼
// frame.png가 실제로 렌더링되고, z-index + 알파 투명도로 날씨가 자연스럽게 클리핑됩니다.
const isBakedIn = computed(() => Boolean(props.city.hotspots))

// 핫스팟 좌표는 항상 "낮 이미지" 기준입니다. 같은 --seed로 뽑은 밤 이미지는 구도가
// 동일하다고 가정하므로 좌표를 그대로 재사용할 수 있습니다 (별도 밤 전용 좌표 불필요).
const frameImgRef = ref(null)
// 최상위 ref를 자동으로 .value까지 언랩해버려서, 자식이 받는 값이 "ref 객체"가 아니라
// "이미 풀린 값"(처음엔 null, 나중엔 DOM 엘리먼트 그 자체)이 됩니다. 그러면 자식 쪽
// 컴포저블(useImageHotspot/useImageRegion)의 imgRef.value가 null.value로 터지거나
// (엘리먼트).value → undefined로 조용히 실패해서, 라디오/타이머/커피 위치 계산이
// 낮/밤 상관없이 항상 멈춰버립니다. provide/inject는 이 자동 언랩을 타지 않으므로
// ref 객체 그 자체가 그대로 전달됩니다.
provide('frameImgRef', frameImgRef)
const openPanel = ref(null) // null | 'radio' | 'timer' (점 기반 팝오버 모드에서만 사용)

function togglePanel(key) {
  openPanel.value = openPanel.value === key ? null : key
}

// 타이머: hotspots.timer.screen(영역)이 있으면 "빈 화면에 직접 삽입" 모드,
// hotspots.timer.x(점)만 있으면 예전처럼 팝오버 모드
const timerMode = computed(() => {
  const t = props.city.hotspots?.timer
  if (t?.screen) return 'inline'
  if (t?.x != null) return 'popover'
  return 'none'
})
const timerPointHotspot = timerMode.value === 'popover'
  ? useImageHotspot(frameImgRef, props.city.hotspots.timer.x, props.city.hotspots.timer.y)
  : null

// 라디오: hotspots.radio.display/power/volume 중 하나라도 있으면 인라인 모드,
// hotspots.radio.x(점)만 있으면 팝오버 모드
const radioMode = computed(() => {
  const r = props.city.hotspots?.radio
  if (r?.display || r?.power || r?.volume) return 'inline'
  if (r?.x != null) return 'popover'
  return 'none'
})
const radioPointHotspot = radioMode.value === 'popover'
  ? useImageHotspot(frameImgRef, props.city.hotspots.radio.x, props.city.hotspots.radio.y)
  : null

// 커피: region이 있으면 김/물방울 효과 + 클릭 시 "냅킨 메모"와 "커피점" 중 고르는 작은 카드를 얹습니다.
// 둘 다 같은 소품(커피잔) 근처를 히트박스로 쓰다 보니 좌표가 겹쳐서, 클릭하면 바로 열지 않고
// 어떤 걸 볼지 먼저 고르게 했습니다.
const hasCoffee = computed(() => Boolean(props.city.hotspots?.coffee?.region))
const coffeeMenuOpen = ref(false)
const napkinOpen = ref(false)
const fortuneOpen = ref(false)
// useImageHotspot은 내부에 onMounted/onUnmounted가 있어서 조건부로 호출하면 안 되므로,
// hasCoffee가 false인 나라는 좌표 0,0으로 무조건 호출만 해두고(어차피 템플릿에서 안 씀) 항상 실행합니다.
const coffeeMenuStyle = useImageHotspot(
  frameImgRef,
  props.city.hotspots?.coffee?.point?.x ?? 0,
  props.city.hotspots?.coffee?.point?.y ?? 0
).style

// CafeWorkspace가 "이미 화면에 그려졌으니 플로팅 위젯에서 뺄 패널"을 알 수 있도록 알려줌
defineExpose({ timerMode, radioMode })
const emit = defineEmits(['coverage-change'])
</script>

<template>
  <div class="frame" :class="{ 'frame--hidden': !visible }">
    <!-- 낮/밤 이미지를 별도 <img>로 나누지 않고 src만 바꿉니다 — 이전에는 밤에 v-show로
         낮 이미지를 display:none 시켰는데, frameImgRef가 그 낮 이미지에만 걸려있어서
         밤에 크기가 0으로 잡혀 라디오/타이머/커피 핫스팟 위치 계산이 전부 깨졌습니다. -->
    <img
      ref="frameImgRef"
      v-show="dayExists"
      :src="isNight && nightExists ? frameNightUrl : frameDayUrl"
      alt=""
      class="frame__img"
      :class="{ 'frame__img--reference-only': isBakedIn }"
      @error="dayExists = false"
    />
    <!-- 이미지가 없을 때: 정면 구도를 흉내낸 그라디언트 테이블 -->
    <div v-if="dayExists === false" class="frame__placeholder" :style="{ height: itemsHeight }"></div>

    <!-- 타이머: 빈 화면 영역에 직접 삽입 -->
    <TimerInline
      v-if="timerMode === 'inline'"
      :region="city.hotspots.timer.screen"
    />
    <template v-else-if="timerMode === 'popover'">
      <Hotspot
        :x="city.hotspots.timer.x"
        :y="city.hotspots.timer.y"
        label="포모도로 타이머"
        :active="openPanel === 'timer'"
        @click="togglePanel('timer')"
      />
      <div v-if="openPanel === 'timer'" class="frame__popover" :style="timerPointHotspot.style.value">
        <PomodoroPanel />
      </div>
    </template>

    <!-- 라디오: 이름(빈 디스플레이)+재생(버튼)+볼륨(노브)을 각각 소품 위에 직접 삽입 -->
    <RadioInline
      v-if="radioMode === 'inline'"
      :config="city.hotspots.radio"
    />
    <template v-else-if="radioMode === 'popover'">
      <Hotspot
        :x="city.hotspots.radio.x"
        :y="city.hotspots.radio.y"
        label="라디오"
        :active="openPanel === 'radio'"
        @click="togglePanel('radio')"
      />
      <div v-if="openPanel === 'radio'" class="frame__popover" :style="radioPointHotspot.style.value">
        <RadioPanel :city="city" />
      </div>
    </template>

    <!-- 커피: 뜨거우면 김, 아이스면 물방울. 잔 근처를 누르면 냅킨 메모/커피점 중 고르는 카드가 뜹니다 -->
    <template v-if="hasCoffee">
      <CoffeeEffect
        :region="city.hotspots.coffee.region"
        :iced="Boolean(city.hotspots.coffee.iced)"
      />
      <Hotspot
        :x="city.hotspots.coffee.point.x"
        :y="city.hotspots.coffee.point.y"
        label="냅킨 메모 또는 오늘의 커피점 보기"
        :active="coffeeMenuOpen"
        @click="coffeeMenuOpen = !coffeeMenuOpen"
      />
      <div
        v-if="coffeeMenuOpen"
        class="frame__popover frame__popover--coffee-menu"
        :style="coffeeMenuStyle"
      >
        <button class="coffee-menu__btn" @click="coffeeMenuOpen = false; napkinOpen = true">
          🍵 오늘의 냅킨 메모
        </button>
        <button class="coffee-menu__btn" @click="coffeeMenuOpen = false; fortuneOpen = true">
          ☕ 오늘의 커피점
        </button>
      </div>
    </template>

    <!-- 테이블 위 사물: 비행기 티켓 자리 -->
    <div class="frame__items" :style="{ height: itemsHeight }">
      <div class="frame__slot"><slot /></div>
    </div>
  </div>

  <NapkinMemo v-if="napkinOpen" :city-id="city.id" @close="napkinOpen = false" />
  <CoffeeFortune v-if="fortuneOpen" :city-id="city.id" @close="fortuneOpen = false" />
</template>

<style scoped>
.frame {
  position: absolute;
  inset: 0;
  z-index: 5;
  opacity: 1;
  transition: opacity 0.4s ease;
}

.frame--hidden {
  opacity: 0;
  pointer-events: none;
}

.frame__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center bottom;
  pointer-events: none;
}

/* 베이크인 국가: 배경(bg.jpg)에 이미 이 그림이 통째로 들어있으므로 화면엔 안 그리고,
   핫스팟 좌표 계산의 기준 엘리먼트로만 DOM에 유지합니다 */
.frame__img--reference-only {
  opacity: 0;
}

.frame__placeholder {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  min-height: 180px;
  background-image: repeating-linear-gradient(100deg, #7a5636 0px, #6b4a30 18px, #7a5636 36px);
  box-shadow: 0 -24px 40px -10px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

.frame__items {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  min-height: 160px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 4vw 2vh;
  pointer-events: none;
}

.frame__slot {
  pointer-events: auto;
  display: flex;
  align-items: flex-end;
}

.frame__popover {
  position: absolute;
  transform: translate(-50%, calc(-100% - 14px));
  width: min(240px, 78vw);
  background: rgba(13, 15, 22, 0.85);
  border: 1px solid var(--color-line);
  border-radius: 16px;
  padding: 16px;
  backdrop-filter: blur(14px);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4);
  z-index: 10;
  pointer-events: auto;
}

.frame__popover--coffee-menu {
  width: min(200px, 70vw);
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.coffee-menu__btn {
  background: transparent;
  border: 1px solid var(--color-line);
  color: var(--color-cream);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
}
.coffee-menu__btn:hover,
.coffee-menu__btn:focus-visible {
  background: rgba(255, 179, 71, 0.12);
}
</style>
