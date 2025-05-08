import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, Router, Route, UrlSegment } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanLoad {
  constructor(private router: Router) {}

  canActivate(): boolean {
    return this.checkLogin();
  }

  canLoad(route: Route, segments: UrlSegment[]): boolean {
    return this.checkLogin();
  }

  private checkLogin(): boolean {
    const username = localStorage.getItem('username');
    if (username) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
