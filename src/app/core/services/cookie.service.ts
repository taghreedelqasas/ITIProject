import { Injectable, PLATFORM_ID, inject, REQUEST } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class CookieService {
  private platformId = inject(PLATFORM_ID);
  private request = inject(REQUEST, { optional: true });

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  get(name: string): string | null {
    if (this.isBrowser) {
      const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
      return match ? decodeURIComponent(match[1]) : null;
    }

    // SSR: الكوكي بتوصل جوه الـ request اللي المتصفح باعته للسيرفر
    const cookieHeader = this.request?.headers.get('cookie');
    if (!cookieHeader) return null;
    const match = cookieHeader.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  set(name: string, value: string, days = 7): void {
    if (!this.isBrowser) return; // الكتابة بتحصل بس في المتصفح، وقت الـ login
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  }

  delete(name: string): void {
    if (!this.isBrowser) return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}