import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-confirm-email-notice',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './confirm-email-notice.component.html',
  styleUrls: ['./confirm-email-notice.component.css']
})
export class ConfirmEmailNoticeComponent implements OnInit {

  email: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';

    // لو دخل الصفحة من غير email (يعني refresh أو دخول مباشر)
    if (!this.email) {
      this.router.navigate(['/auth/register']);
    }
  }

  goBack(): void {
    this.router.navigate(['/auth/register']);
  }
}