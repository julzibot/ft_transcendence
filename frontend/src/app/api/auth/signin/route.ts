import { FORTY_TWO_CLIENT_UID, FRONTEND_PORT, DOMAIN_NAME } from '@/config';

function generateRandomState() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let state = '';
  const length = 32;
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    state += characters[randomIndex];
  }
  return state;
}

export async function GET() {
  const state = generateRandomState()
  const url = new URL('https://api.intra.42.fr/oauth/authorize')
  url.searchParams.append('client_id', FORTY_TWO_CLIENT_UID);
  url.searchParams.append('redirect_uri', `https://${DOMAIN_NAME}:${FRONTEND_PORT}/api/auth/callback/42-school`);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('scope', 'public');
  url.searchParams.append('state', state);

  return Response.redirect(url)
}