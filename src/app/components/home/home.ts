import { Component } from '@angular/core';
import { Hero } from "../hero/hero";
import { SearchSection } from '../search-section/search-section';
import { FaqSection } from '../landing/faq-section/faq-section';
import { CtaBanner } from '../landing/cta-banner/cta-banner';
import { LandingPageSec3 } from "../landing-page-sec3/landing-page-sec3";
import { LandingPageSec4 } from "../landing-page-sec4/landing-page-sec4";
import { ForDoctorsComponent } from "../for-doctors-landing-page/for-doctors.component";
import { TestimonialsComponent } from "../testimonials-landing-page/testimonials.component";

@Component({
  selector: 'app-home',
  imports: [Hero, SearchSection, FaqSection, CtaBanner, LandingPageSec3, LandingPageSec4, ForDoctorsComponent, TestimonialsComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
