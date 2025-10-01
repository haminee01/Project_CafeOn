import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // 화면 구현만을 위한 모의 응답
  console.log('Naver OAuth 콜백 (모의)');
  
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  
  // 실제 구현에서는 여기서 OAuth 토큰 교환 및 사용자 정보 처리
  // 현재는 콜백 페이지로 리다이렉트
  const callbackUrl = new URL('/callback', request.url);
  
  if (error) {
    callbackUrl.searchParams.set('error', error);
  } else if (code) {
    callbackUrl.searchParams.set('code', code);
    callbackUrl.searchParams.set('provider', 'naver');
  } else {
    callbackUrl.searchParams.set('error', 'no_code');
  }
  
  return NextResponse.redirect(callbackUrl);
}
