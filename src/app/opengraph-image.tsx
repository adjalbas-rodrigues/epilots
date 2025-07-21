import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(135deg, #2C5F8D 0%, #1E4A6F 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <div
          style={{
            fontSize: 180,
            fontWeight: 'bold',
            marginBottom: 20,
            textShadow: '0 4px 8px rgba(0,0,0,0.3)',
          }}
        >
          EP
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 'bold',
            marginBottom: 10,
          }}
        >
          ELITE PILOTS
        </div>
        <div
          style={{
            fontSize: 24,
            opacity: 0.9,
          }}
        >
          Sistema de Questões para Práticos
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}