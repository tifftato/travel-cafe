<script setup>
import { useOptionalImage } from '../../composables/useOptionalImage'

// 창틀 + 테이블이 합쳐진 전경 레이어 (크로마키로 배경을 뚫은 투명 PNG)
// public/assets/frame_{countryEn}.png
const props = defineProps({
  city: { type: Object, required: true },
  visible: { type: Boolean, default: true }, // 끄면 배경 랜드마크만 화면 가득 보임
})

const { url: frameUrl, exists } = useOptionalImage('frame', props.city.countryEn, 'png')

// 나라마다 창틀/테이블 사진의 구도가 달라서 테이블이 시작되는 높이가 제각각입니다.
// cities.js 의 tableTopVh 값(각 frame_*.png 를 알파 채널 분석해서 실측한 값)을 그대로 사용합니다.
const itemsHeight = props.city.tableTopVh ? `${props.city.tableTopVh}vh` : '28vh'
</script>

<template>
  <div class="frame" :class="{ 'frame--hidden': !visible }">
    <img
      v-show="exists"
      :src="frameUrl"
      alt="카페 창틀과 테이블"
      class="frame__img"
      @error="exists = false"
    />
    <!-- 이미지가 없을 때: 정면 구도를 흉내낸 그라디언트 테이블 -->
    <div v-if="exists === false" class="frame__placeholder" :style="{ height: itemsHeight }"></div>

    <!-- 테이블 위 사물: 비행기 티켓만 남기고, 포모도로/라디오는 화면 전체 위젯으로 이동했습니다 -->
    <div class="frame__items" :style="{ height: itemsHeight }">
      <div class="frame__slot"><slot /></div>
    </div>
  </div>
</template>

<style scoped>
.frame {
  position: absolute;
  inset: 0;
  z-index: 5;
  opacity: 1;
  transition: opacity 0.4s ease;
}

/* 꺼져 있을 때: 배경 랜드마크만 화면 가득 보이도록 완전히 투명 + 클릭 통과 */
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

/* 사물 레이어: 나라별로 다른 테이블 높이(city.tableTopVh)에 맞춰 하단 정렬, 정면 구도 */
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
  pointer-events: none; /* 빈 공간은 클릭 통과 */
}

.frame__slot {
  pointer-events: auto; /* 실제 사물만 클릭 가능 */
  display: flex;
  align-items: flex-end;
}
</style>
