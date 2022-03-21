import { Component, OnInit } from '@angular/core';
import { Moralis } from 'moralis';
import { User } from './user.component';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ngDApp';
  user?: User;

  ngOnInit() {
    Moralis.start({
      appId: environment.moralis.appId,
      serverUrl: environment.moralis.serverUrl
    })
    .then(() => console.log('DApps inicializada'))
    .finally(() => this.setLoggedInUser(Moralis.User.current()))
  }

  private setLoggedInUser(loggedInUser?: User) {
    console.log(`user`, loggedInUser);
    this.user = loggedInUser;
  }

  async login(provider: 'metamask' | 'walletconnect' = 'metamask') {
    const user = await Moralis.authenticate({provider});
    this.setLoggedInUser(user);
  }

  logout() {
    Moralis.User.logOut()
    .then((loggedOutUser) => console.log(`Usuario deslogueado`, loggedOutUser))
    .then(() => this.setLoggedInUser(undefined))
    .then(() => Moralis.cleanup())
    .catch((e) => console.error('Moralis logout error:', e));
  }



}
