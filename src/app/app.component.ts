import { Component, OnInit } from '@angular/core';
import { Moralis } from 'moralis';
import { User } from './user.component';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'ngDApp';
  user?: User;
  nftsList: any = [];

  constructor(private http: HttpClient) {}

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

  async listNFTs() {
    // @ts-ignore
    const userEthNFTs = await Moralis.Web3API.account.getNFTs();
    console.log(userEthNFTs);
    console.log(this.user?.attributes.userEthNFTs);
    const options = {
      chain: 'polygon',
      address: this.user?.attributes.ethAddress
      // address: "0x75e3e9c92162e62000425c98769965a76c2e387a"
    }
    console.log(options);
    // @ts-ignore
    const polygonNFTs = await Moralis.Web3API.account.getNFTs(options);
    console.log(polygonNFTs);
    this.nftsList = [];
    polygonNFTs.result?.forEach((nftResult) => {

      // moralis gateway (tiene que tener una mejor forma)
      if(nftResult.token_uri?.includes('https://gateway.moralisipfs.com/ipfs')) {
        // @ts-ignore
        const metadata = JSON.parse(nftResult.metadata);
        console.log(metadata);
        const imageData = metadata.image.replace('ipfs://', 'https://gateway.moralisipfs.com/ipfs/');
        this.nftsList.push({name: metadata.name, image: imageData});
      }

      // open sea api v2 (por ahora la mas facil de usarn)
      if(nftResult.token_uri?.includes('https://api.opensea.io/api/v2')) {
        this.http.get(nftResult.token_uri)
        .pipe(first())
        .subscribe(
          (result: any) => {
            console.log(result);
            this.nftsList.push({name: result.name, image: result.image})
          }
        )
      }
    })
  }


}
