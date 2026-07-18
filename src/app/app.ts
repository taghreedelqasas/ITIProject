import { Component, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { Navbar } from './components/navbar/navbar';
import { Footer } from './shared/footer/footer';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule, 
    RouterOutlet,
    Navbar,
    Footer
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Maw3ed');
  showChrome = true;
  showFooter = true; // متغير جديد للتحكم في الفوتر بشكل مستقل

  constructor(public router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        const cleanUrl = url.split('?')[0]; // تجاهل الـ Query Parameters لضمان دقة الشرط
        
        const hiddenPrefixes = [
          '/auth', 
          '/doctor-dashboard', 
          '/ai-pulse', 
          '/confirm-email', 
          '/api/auth/confirm-email',
          '/api/auth/reset-password', 
          '/admin',
        ];
        
        // الـ Navbar والـ Footer يختفيان تماماً في الصفحات المحددة مسبقاً
        this.showChrome = !hiddenPrefixes.some(prefix => url.startsWith(prefix));

        // هنا نحدد شروط إخفاء الفوتر فقط:
        // يختفي لو كانت الصفحة الأساسية مش ظاهرة (showChrome = false) أو لو كان المستخدم في صفحة الشات
        if (!this.showChrome || cleanUrl === '/chat') {
          this.showFooter = false;
        } else {
          this.showFooter = true;
        }
      });
  }
}