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

  constructor(public router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        
        // هنا نحدد كل البادئات (Prefixes) التي لا نريد ظهور الـ Navbar والـ Footer فيها
        const hiddenPrefixes = [
          '/auth', 
          '/doctor-dashboard', 
          '/ai-pulse',            // صفحة الـ AI Chat
          '/confirm-email', 
          '/api/auth/confirm-email',
          '/api/auth/reset-password'
        ];
        
        // إذا كان العنوان الحالي يبدأ بأي واحدة منها، سنجعل showChrome = false
        this.showChrome = !hiddenPrefixes.some(prefix => url.startsWith(prefix));
      });
  }
}