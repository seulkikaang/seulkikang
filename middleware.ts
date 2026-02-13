import { NextRequest, NextResponse } from 'next/server';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '1590';

function unauthorized() {
  return new NextResponse('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Admin", charset="UTF-8"',
    },
  });
}

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return unauthorized();
  }

  try {
    const encoded = authHeader.split(' ')[1];
    const decoded = atob(encoded);
    const [username, password] = decoded.split(':');

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      return NextResponse.next();
    }
  } catch {
    return unauthorized();
  }

  return unauthorized();
}

export const config = {
  matcher: ['/admin/:path*'],
};
