import { Component, computed, inject, input, output, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-payment-overlay',
  templateUrl: './payment-overlay.html',
  styleUrl: './payment-overlay.css',
})
export class PaymentOverlay {
  private sanitizer = inject(DomSanitizer);

  url = input.required<string>();
  close = output<void>();

  isIframeLoading = signal(true);

  safeUrl = computed(() => this.sanitizer.bypassSecurityTrustResourceUrl(this.url()));

  onIframeLoad(): void {
    this.isIframeLoading.set(false);
  }

  onClose(): void {
    this.close.emit();
  }
}
