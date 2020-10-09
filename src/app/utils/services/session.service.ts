import { Injectable } from '@angular/core';
import { UserDetails } from '../interfaces/userDetails';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  tokenStoredInSession: boolean;
  constructor() {
    const self = this;
    if (sessionStorage.getItem('ba-token')) {
      self.tokenStoredInSession = true;
    }
  }
  saveSessionData(userData: UserDetails) {
    const self = this;
    if (userData.rbacUserCloseWindowToLogout) {
      self.tokenStoredInSession = true;
      sessionStorage.setItem('ba-token', userData.token);
      sessionStorage.setItem('ba-rToken', userData.rToken);
      sessionStorage.setItem('ba-user', JSON.stringify(userData));
    } else {
      self.tokenStoredInSession = false;
      localStorage.setItem('ba-token', userData.token);
      localStorage.setItem('ba-rToken', userData.rToken);
      localStorage.setItem('ba-user', JSON.stringify(userData));
    }
    if (userData.rbacUserToSingleSession || userData.rbacUserCloseWindowToLogout) {
      sessionStorage.setItem('ba-uuid', userData.uuid);
    }
  }

  getToken() {
    const self = this;
    if (self.tokenStoredInSession) {
      return sessionStorage.getItem('ba-token');
    } else {
      return localStorage.getItem('ba-token');
    }
  }

  getRefreshToken() {
    const self = this;
    if (self.tokenStoredInSession) {
      return sessionStorage.getItem('ba-rToken');
    } else {
      return localStorage.getItem('ba-rToken');
    }
  }

  getUser(parsed?: boolean) {
    const self = this;
    if (self.tokenStoredInSession) {
      return parsed ? JSON.parse(sessionStorage.getItem('ba-user')) : sessionStorage.getItem('ba-user');
    } else {
      return parsed ? JSON.parse(localStorage.getItem('ba-user')) : localStorage.getItem('ba-user');
    }
  }

  clearSession() {
    const self = this;
    if (self.tokenStoredInSession) {
      sessionStorage.removeItem('ba-user');
      sessionStorage.removeItem('ba-token');
      sessionStorage.removeItem('ba-rToken');
      sessionStorage.removeItem('ba-apps');
      sessionStorage.removeItem('ba-app');
      sessionStorage.removeItem('ba-uuid');
    } else {
      localStorage.removeItem('ba-user');
      localStorage.removeItem('ba-token');
      localStorage.removeItem('ba-rToken');
      localStorage.removeItem('ba-apps');
      localStorage.removeItem('ba-app');
    }
  }
}
