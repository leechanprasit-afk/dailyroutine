import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  const imgData = readFileSync(join(process.cwd(), 'public/lee-icon.png'));
  const base64 = `data:image/png;base64,${imgData.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fce7f3',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={base64}
          alt="Lee"
          style={{ width: 180, height: 180, objectFit: 'cover', objectPosition: 'center top' }}
        />
      </div>
    ),
    { ...size }
  );
}
