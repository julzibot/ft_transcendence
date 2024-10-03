import { FORTY_TWO_CLIENT_SECRET, FORTY_TWO_CLIENT_UID } from "@/config"
import { NextRequest, NextResponse } from "next/server"
import { cookies } from 'next/headers'
import { NEXT_PUBLIC_URL } from "@/config"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code || !state) {
    return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
  }

  try {
    const response = await fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: FORTY_TWO_CLIENT_UID as string,
        client_secret: FORTY_TWO_CLIENT_SECRET as string,
        code,
        redirect_uri: 'https://localhost:3000/api/auth/callback/42-school',
        state,
      })
    })
    const tokenData = await response.json();
    if (!response.ok) {
      console.error('Error exchanging code for token:', tokenData);
      return NextResponse.json(tokenData, { status: response.status });
    }

    await fetch('http://django:8000/api/csrf-cookie/', {
      method: 'GET',
      credentials: 'include',
    });

    const csrfToken = cookies().get('csrftoken')?.value;

    const backendResponse = await fetch('http://django:8000/api/auth/signin-with-42/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken as string,
        'Referer': NEXT_PUBLIC_URL,
      },
      body: JSON.stringify({
        'access_token': tokenData.access_token,
      })
    })
    if (backendResponse.ok) {
      const data = await backendResponse.json();
      cookies().set('sessionid', data.session_id);
      return NextResponse.redirect(new URL('/', request.url))
    }
    else {
      console.error('Error signing in with 42:', backendResponse);
      return NextResponse.json({ error: 'Failed to sign in with 42' }, { status: 500 });
    }
  }
  catch (error) {
    console.error('Error exchanging code for token:', error);
    return NextResponse.json({ error: 'Failed to exchange code for token' }, { status: 500 });
  }
}
