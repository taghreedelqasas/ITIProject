import { Component, OnInit, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../services/appointment';
import { AuthService } from '../../core/services/auth.service';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-doc-analytics',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './doc-analytics.html',
  styleUrl: './doc-analytics.css'
})
export class DocAnalytics implements OnInit {
  protected appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
  
  public chartOptions: any;        // تشارت الحضور والغياب (Donut)
  public revenueChartOptions: any; // تشارت الإيرادات الجديد (Bar Chart)

  doctorId = this.authService.getDoctorId()!;

  ratingBars = computed(() => {
    const reviewsList = this.appointmentService.reviews();
    const total = reviewsList.length;
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    if (total === 0) {
      return [5, 4, 3, 2, 1].map(stars => ({ stars, percent: 0 }));
    }

    reviewsList.forEach(rev => {
      const rating = Math.round(rev.rating) as 1 | 2 | 3 | 4 | 5;
      if (counts[rating] !== undefined) {
        counts[rating]++;
      }
    });

    return [5, 4, 3, 2, 1].map(stars => ({
      stars,
      percent: Math.round((counts[stars as 1 | 2 | 3 | 4 | 5] / total) * 100)
    }));
  });

  ngOnInit(): void {
    this.appointmentService.loadDashboardData();
    this.appointmentService.getMyReviews();
    this.appointmentService.getDoctorConversations();
    this.appointmentService.getWallet();
    this.appointmentService.getDoctorById(this.doctorId);
  }

  constructor() {
    effect(() => {
      // 1. إعدادات تشارت معدل الحضور والغياب
      this.chartOptions = {
        series: [
          this.appointmentService.attendanceRateReal() || 0,
          this.appointmentService.noShowRateReal() || 0
        ],
        chart: {
          type: "donut",
          height: 150, // تقليل الارتفاع ليناسب التصميم المنخفض الجديد
          animations: {
            enabled: true,
            easing: 'easeout',
            speed: 800
          }
        },
        labels: ["حضر", "غياب"],
        colors: ["#23E0E0", "#A992BC"],
        stroke: {
          show: true,
          width: 2, 
          colors: ["#ffffff"] 
        },
        plotOptions: {
          pie: {
            expandOnClick: true,
            donut: {
              size: "75%",
              labels: {
                show: false 
              }
            }
          }
        },
        dataLabels: {
          enabled: false
        },
        legend: {
          show: false
        },
        states: {
          hover: {
            filter: { type: 'brightness', value: 0.95 }
          },
          active: {
            allowMultipleDataPointsSelection: false,
            filter: { type: 'none' }
          }
        },
        tooltip: {
          enabled: true,
          theme: 'dark',
          style: {
            fontSize: '11px',
            fontFamily: 'inherit'
          },
          y: {
            formatter: function (val: number) {
              return val + "%";
            },
            title: {
              formatter: (seriesName: string) => seriesName + ": "
            }
          }
        }
      };

      // 2. إعدادات تشارت الإيرادات والأرباح (Bar Chart) مع معالجة الأشهر ديناميكياً
      // نتحقق أولاً من وجود داتا الـ computed داخل السيرفيس
      const analyticsData = this.appointmentService.analyticsDataComputed();
      const monthlyEarnings = analyticsData?.monthlyEarnings || [];

      if (monthlyEarnings.length > 0) {
        // قص آخر 6 أشهر فقط لضمان الوصول وعرض شهر 7 (Jul) الحالي وضبط الترتيب
        const lastSixMonths = monthlyEarnings.slice(-6);
        const categories = lastSixMonths.map(e => e.month);
        const dataValues = lastSixMonths.map(e => e.amount);

        this.revenueChartOptions = {
          series: [
            {
              name: "الإيرادات",
              data: dataValues
            }
          ],
          chart: {
            type: "bar",
            height: 180,
            toolbar: { show: false },
            fontFamily: 'inherit'
          },
          colors: ["#23E0E0"],
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: "55%", // زيادة سُمك الأعمدة لتصبح واضحة وممتلئة ومطابقة للـ Figma
              borderRadius: 6,
              borderRadiusApplication: 'end'
            }
          },
          dataLabels: {
            enabled: false
          },
          stroke: {
            show: true,
            width: 2,
            colors: ["transparent"]
          },
          xaxis: {
            categories: categories,
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
              style: {
                colors: "#9ca3af",
                fontSize: "10px"
              }
            }
          },
          yaxis: {
            labels: {
              style: {
                colors: "#9ca3af",
                fontSize: "10px"
              }
            }
          },
          fill: {
            opacity: 1
          },
          grid: {
            borderColor: "#f3f4f6",
            strokeDashArray: 4,
            yaxis: {
              lines: { show: true }
            }
          },
          tooltip: {
            theme: "dark",
            style: {
              fontSize: '11px',
              fontFamily: 'inherit'
            },
            y: {
              formatter: function (val: number) {
                return val + " ج.م";
              }
            }
          }
        };
      }
    });
  }
}