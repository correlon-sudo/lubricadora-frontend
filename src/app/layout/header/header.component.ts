import { MatToolbarModule } from '@angular/material/toolbar';
import { NgClass, CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, Renderer2, DOCUMENT, inject, HostListener, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ConfigService } from '@config';
import {
  AuthService,
  InConfiguration,
  RightSidebarService,
  Role,
} from '@core';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { LocalStorageService } from '@shared/services';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NotificationListComponent } from '../components/notification-list/notification-list.component';
import { MatMenuModule } from '@angular/material/menu';
import { UserProfileMenuComponent } from '../components/user-profile-menu/user-profile-menu.component';
import { SearchBarComponent } from '../components/search-bar/search-bar.component';

interface Notifications {
  message: string;
  time: string;
  userImg?: string;
  actionLabel?: string;
  actionType?: string;
  icon?: string;
  color: string;
  status: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [
    RouterLink,
    NgClass,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    NotificationListComponent,
    MatMenuModule,
    UserProfileMenuComponent,
    SearchBarComponent,
  ],
})
export class HeaderComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit
{
    private cdr = inject(ChangeDetectorRef);
  private document = inject<Document>(DOCUMENT);
  private renderer = inject(Renderer2);
  elementRef = inject(ElementRef);
  private rightSidebarService = inject(RightSidebarService);
  private configService = inject(ConfigService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private localStorageService = inject(LocalStorageService);

  public config!: InConfiguration;
  userName?: string;
  userImg?: string;
  homePage?: string;
  isNavbarCollapsed = true;
  isOpenSidebar?: boolean;
  docElement?: HTMLElement;
  isFullScreen = false;

  notifications: Notifications[] = [
    {
      message: 'Please check your mail',
      time: '14 mins ago',
      icon: 'mail',
      color: 'notification-green',
      status: 'msg-unread',
      actionLabel: 'View',
      actionType: 'view',
    },
    {
      message: 'New Student Enrolled',
      time: '22 mins ago',
      userImg: 'assets/images/user/user1.jpg',
      color: 'notification-blue',
      status: 'msg-unread',
    },
    {
      message: 'Your leave is approved!! ',
      time: '3 hours ago',
      icon: 'event_available',
      color: 'notification-orange',
      status: 'msg-read',
    },
    {
      message: 'Staff meeting at 3 PM today',
      time: '5 hours ago',
      userImg: 'assets/images/user/user2.jpg',
      color: 'notification-blue',
      status: 'msg-unread',
      actionLabel: 'Reply',
      actionType: 'reply',
    },
    {
      message: 'Attendance report generated',
      time: '14 mins ago',
      icon: 'description',
      color: 'notification-green',
      status: 'msg-read',
      actionLabel: 'Download',
      actionType: 'download',
    },
    {
      message: 'Exam schedule updated',
      time: '22 mins ago',
      icon: 'event_note',
      color: 'notification-red',
      status: 'msg-read',
    },
    {
      message: 'Salary credited...',
      time: '3 hours ago',
      userImg: 'assets/images/user/user3.jpg',
      color: 'notification-purple',
      status: 'msg-read',
      actionLabel: 'Important',
      actionType: 'mark-important',
    },
  ];

  ngOnInit() {
    this.config = this.configService.configData;
    const userRole = this.authService.currentUser().roles?.[0]?.name as Role;
    this.userName = this.authService.currentUser().name;
    this.userImg =
      './assets/images/user/' + this.authService.currentUser().avatar;
    this.docElement = document.documentElement;

    if (userRole === Role.Encargado) {
      this.homePage = 'admin/reportes';
    } else if (userRole === Role.Vendedor) {
      this.homePage = 'admin/ventas';
    } else {
      this.homePage = 'admin/dashboard/main';
    }
  }

  onMarkAllNotificationsRead() {
    this.notifications = this.notifications.map((n) => ({
      ...n,
      status: 'msg-read',
    }));
  }

  onReadAllNotifications() {
    this.router.navigate(['/apps/support']);
  }

  onRemoveNotification(notification: Notifications) {
    this.notifications = this.notifications.filter((n) => n !== notification);
  }

  onNotificationActionClick(event: {
    notification: Notifications;
    actionType: string;
  }) {
    const { notification, actionType } = event;

    switch (actionType) {
      case 'view':
        this.router.navigate(['/email/inbox']);
        break;
      case 'profile':
        this.router.navigate(['/extra-pages/profile']);
        break;
      case 'reply':
        this.router.navigate(['/email/inbox']);
        break;
      case 'download':
        notification.status = 'msg-read';
        break;
      case 'mark-important':
        notification.status = 'msg-read';
        break;
      default:
        break;
    }
  }

  callFullscreen() {
    if (!this.isFullScreen) {
      if (this.docElement?.requestFullscreen != null) {
        this.docElement?.requestFullscreen();
      }
    } else {
      document.exitFullscreen();
    }
    this.isFullScreen = !this.isFullScreen;
  }

  mobileMenuSidebarOpen(event: Event, className: string) {
    const hasClass = (event.target as HTMLInputElement).classList.contains(
      className
    );
    if (hasClass) {
      this.renderer.removeClass(this.document.body, className);
    } else {
      this.renderer.addClass(this.document.body, className);
    }
  }

  callSidemenuCollapse() {
    const hasClass = this.document.body.classList.contains('side-closed');
    if (hasClass) {
      this.renderer.removeClass(this.document.body, 'side-closed');
      this.renderer.removeClass(this.document.body, 'submenu-closed');
      this.localStorageService.set('collapsed_menu', 'false');
    } else {
      this.renderer.addClass(this.document.body, 'side-closed');
      this.renderer.addClass(this.document.body, 'submenu-closed');
      this.localStorageService.set('collapsed_menu', 'true');
    }
  }

  logout() {
    this.subs.sink = this.authService.logout().subscribe((res) => {
      if (!res.success) {
        this.router.navigate(['/authentication/signin']);
      }
        this.cdr.markForCheck();
    });
  }

  onAccountClicked() {
    this.router.navigate(['/extra-pages/profile']);
  }
}
