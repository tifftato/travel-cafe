// GET /api/weather?lat=..&lon=..
// Vercel 프로젝트 환경변수에 OPENWEATHER_API_KEY 를 등록해야 합니다.
// https://openweathermap.org/api 에서 무료 키 발급

export default async function handler(req, res) {
  const { lat, lon } = req.query

  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat, lon query params are required' })
  }

  const apiKey = process.env.OPENWEATHER_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENWEATHER_API_KEY is not configured' })
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`

  try {
    const upstream = await fetch(url)
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'upstream weather api error' })
    }
    const data = await upstream.json()

    // 클라이언트 캐싱 (같은 위치는 10분간 재요청하지 않도록)
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=59')
    return res.status(200).json(data)
  } catch (e) {
    return res.status(502).json({ error: e.message })
  }
}
