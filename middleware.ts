import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // আপাতত সব রিকোয়েস্ট পাস হতে দিচ্ছি। 
  // পরবর্তীতে এখানে JWT টোকেন চেক করে Admin বা User রাউট প্রটেক্ট করা হবে।
  return NextResponse.next();
}

// কোন কোন লিংকের জন্য এই মিডলওয়্যার কাজ করবে তা এখানে বলা আছে
export const config = {
  matcher: [
    /*
     * নিচের ফাইলগুলো বাদে বাকি সব রাউটে মিডলওয়্যার কাজ করবে:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};