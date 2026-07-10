import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-email-notice',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './confirm-email-notice.component.html',
  styleUrls: ['./confirm-email-notice.component.css']
})
export class ConfirmEmailNoticeComponent implements OnInit {

  email = '';

  constructor(private route: ActivatedRoute, public router: Router) {}

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
    if (!this.email) this.router.navigate(['/auth/register']);
  }
}