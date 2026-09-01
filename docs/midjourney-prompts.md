# Midjourney 마스터 프롬프트 — Travel Café 베이크 이미지

`src/data/cities.js`의 10개 도시에 맞춰 "창문+테이블+꽃병+라디오+타이머+커피"가 한 장에 담긴
베이크 이미지를 만들기 위한 프롬프트 공식입니다. 만든 뒤 처리 순서는 README의
["에셋을 베이크인 + 분리 추출 방식으로 만드는 법"](../README.md) 참고.

## 마스터 공식 (그대로 복사해서 대괄호만 채우세요)

```
A photorealistic interior photo, shot from a seated eye-level first-person
perspective inside a cozy [INTERIOR_STYLE] café nook in [CITY].

Behind, a large full-height picture window spanning most of the frame width
(the window must dominate the upper two-thirds of the composition, not a
small window) — through the glass, a wide unobstructed daytime view of
[LANDMARK], [SKY_DESCRIPTION].

In the foreground, a [TABLE_MATERIAL] table stretches across the entire
bottom of the frame, viewed straight-on and centered. On the table, arranged
left to right:
— on the left, a small [VASE_STYLE] vase with [LOCAL_FLOWER]
— center-left, a compact vintage-style radio with a distinct small
  rectangular display window (blank, no text), one round volume knob, and
  one physical power button, all clearly separated and visible
— center-right, a small digital travel timer/clock with a blank rectangular
  LCD screen, sitting upright, facing camera
— on the right, a cup of [LOCAL_COFFEE] with a small side plate

[DECOR_ACCENT]. Warm, inviting, lo-fi study atmosphere, soft natural
window light, shallow depth of field on the tabletop objects, ultra-detailed
textures, cinematic photography, no people, no text, no watermark
--ar 16:9 --style raw --v 6.1 --seed [SEED]
```

**밤 버전 만드는 법**: 위 프롬프트에서 `[SKY_DESCRIPTION]`만 야경 묘사로 바꾸고,
`"daytime"` → `"nighttime, warm interior lamp light glowing on the table"`로 바꾼 뒤
**`--seed`는 낮 버전과 똑같은 값**을 씁니다. 구도가 거의 그대로 유지되면서 조명만 바뀝니다.

## 변수 설명

| 변수 | 역할 | 주의점 |
| --- | --- | --- |
| `INTERIOR_STYLE` | 실내 톤 (모던 유리, 빈티지 목조 등) | 나라별 분위기 결정 |
| `LANDMARK` | 창밖 랜드마크 | 너무 복잡한 랜드마크는 인페인팅 단계에서 복원이 어려울 수 있음 |
| `SKY_DESCRIPTION` | 하늘/날씨 | 기본은 맑음으로, 날씨 애니메이션은 코드에서 별도 처리하므로 프롬프트에 비/눈을 넣지 않기 |
| `TABLE_MATERIAL` | 테이블 재질 | 원목/대리석 등 |
| `VASE_STYLE` / `LOCAL_FLOWER` | 꽃병+꽃 | 나라 상징 꽃 추천은 아래 표 참고 |
| `LOCAL_COFFEE` | 그 나라 대표 커피 | 아래 표 참고 |
| `DECOR_ACCENT` | 추가 소품 한 줄 (선택) | 너무 많이 넣으면 라디오/타이머 식별이 어려워지니 1개만 |
| `SEED` | 낮/밤 구도 통일용 | 낮 생성 후 그 seed를 밤에도 재사용 |

## 10개 도시 변수표

| 도시 | INTERIOR_STYLE | LANDMARK | TABLE_MATERIAL | VASE_STYLE / LOCAL_FLOWER | LOCAL_COFFEE |
| --- | --- | --- | --- | --- | --- |
| 서울 (korea) | modern glass-and-steel high-rise | N Seoul Tower and the Han River skyline | light oak wood | minimalist celadon vase / a branch of plum blossoms | iced americano with condensation on the glass |
| 로마 (italy) | rustic dark wood with terracotta walls | the Colosseum | reclaimed dark wood | rustic terracotta vase / sunflowers | a small espresso in a white ceramic cup |
| 파리 (france) | elegant Haussmannian apartment with wrought iron balcony | the Eiffel Tower | white marble round | fine porcelain vase / tulips | a café crème with latte art |
| 뉴욕 (usa) | industrial loft with exposed brick | the Statue of Liberty across the harbor | reclaimed dark wood | mason jar / wildflowers | a large black drip coffee in a paper cup |
| 도쿄 (japan) | minimalist light wood Japanese interior | Tokyo Tower and the Shibuya skyline | pale ash wood | simple ikebana vase / a single branch of cherry blossoms | a hand-drip pour-over coffee in a glass dripper |
| 멜버른 (australia) | dark-framed industrial café interior with potted plant | Flinders Street Station | reclaimed dark wood | rustic vase / eucalyptus leaves | a flat white with latte art |
| 이스탄불 (turkey) | ornate carved dark wood with an arched window | the Hagia Sophia | dark wood with brass inlay | traditional Turkish ceramic vase / red tulips | Turkish coffee in a small copper cup with foam |
| 빈 (austria) | opulent gold-trimmed wood-paneled interior | St. Stephen's Cathedral | dark polished wood with rounded edge | ornate porcelain vase / roses | a Vienna coffee (Melange) with whipped cream |
| 하노이 (vietnam) | weathered green wooden shutters, tropical | Hoan Kiem Lake and old quarter rooftops | worn teak wood | simple clay vase / a lotus flower | egg coffee in a small glass with a spoon |
| 아바나 (cuba) | weathered blue colonial shutters, tropical | El Capitolio and colorful colonial rooftops | worn wood painted pastel | colorful ceramic vase / hibiscus flowers | a café Cubano in a tiny espresso cup |

## 예시 (하노이 완성본)

```
A photorealistic interior photo, shot from a seated eye-level first-person
perspective inside a cozy weathered green wooden shutters, tropical café
nook in Hanoi.

Behind, a large full-height picture window spanning most of the frame width
(the window must dominate the upper two-thirds of the composition, not a
small window) — through the glass, a wide unobstructed daytime view of
Hoan Kiem Lake and old quarter rooftops, soft golden afternoon light.

In the foreground, a worn teak wood table stretches across the entire
bottom of the frame, viewed straight-on and centered. On the table, arranged
left to right:
— on the left, a small simple clay vase with a lotus flower
— center-left, a compact vintage-style radio with a distinct small
  rectangular display window (blank, no text), one round volume knob, and
  one physical power button, all clearly separated and visible
— center-right, a small digital travel timer/clock with a blank rectangular
  LCD screen, sitting upright, facing camera
— on the right, egg coffee in a small glass with a spoon, with a small side plate

Woven bamboo blinds partially rolled up beside the window. Warm, inviting,
lo-fi study atmosphere, soft natural window light, shallow depth of field
on the tabletop objects, ultra-detailed textures, cinematic photography,
no people, no text, no watermark
--ar 16:9 --style raw --v 6.1 --seed 482910
```

## 완성 후: 라디오/타이머 좌표 기록하기

`frame_{country}.png`가 완성되면, `cities.js`의 `hotspots`에 넣을 좌표 6개를 이미지 편집기(포토샵,
미리보기 등)로 하나씩 확인합니다. 픽셀 좌표를 이미지 전체 크기로 나누면 0~1 비율이 됩니다.

- 라디오 표시창 네 귀퉁이 → `radio.display: { x, y, width, height }`
- 라디오 전원 버튼 중심 → `radio.power: { x, y }`
- 라디오 볼륨 노브 중심 → `radio.volume: { x, y }`
- 타이머 화면 네 귀퉁이 → `timer.screen: { x, y, width, height }`

자세한 스키마와 주의사항(소품은 가로 0.3~0.7 사이 권장 등)은 `src/data/cities.js` 상단 주석 참고.
