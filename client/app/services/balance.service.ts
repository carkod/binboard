import { Injectable } from '@angular/core';
import { DbService } from './db.service';
import { Observable } from 'rxjs';
import { IBalances, ITotalBalance } from '../models/services';
import { mergeMap, concatMap, map, switchMap, mergeAll } from 'rxjs/operators';
import { debug } from 'util';

@Injectable({
  providedIn: 'root'
})
export class BalanceService {

  accountData: any;
  timestamp: Number;
  recvWindow;
  serverTime: number;
  balances: Array<IBalances>;
  baseCoin: String;
  tickerPrices: Array<any>;
  totalBalance: Array<any>;
  quoteAssets: Array<any>;

  getServerTimeSubs$: Observable<any>;
  getAccountSubs$: Observable<any>;

  constructor(private db: DbService) {
    this.timestamp = +new Date;
    this.recvWindow = 20000;
    this.baseCoin = 'BTC';
    this.tickerPrices = [];
    this.totalBalance = [];
    this.quoteAssets = [];
  }

  async getBtcAmout() {
    await this.getTotalBalance();
    const total = this.totalBalance.reduce((a, c) => a + c);
    return total;
  }

  async getTotalBalance(): Promise<any> {
    await this.getAccount();
    // await this.getAllQuoteAssets();
    const getTickerPrices = await this.db.getTicker().toPromise();
    const allTickers = JSON.parse(getTickerPrices);
    this.balances.forEach(element => {
      const matchBaseCoin = allTickers.find(x => {
        return x.symbol === (element.asset + this.baseCoin);
      });
      if (matchBaseCoin !== undefined) {
        this.tickerPrices.push(matchBaseCoin);
      }

    });
    
    this.balances.forEach((element, i) => {
      let count = i;
      this.tickerPrices.forEach(x => {
        const check = x.symbol.indexOf(element.asset)
        if (check !== undefined && check > -1 && count < (this.balances.length-1)) {
          count = i++
          const newObj = {
            symbol: x.symbol,
            price: x.price,
            asset: element.asset,
            free: element.free,
            total: (+x.price) * (+element.free),
          }
          if (newObj !== undefined) {
            this.totalBalance.push(newObj)
          }
        }
      })
    });
    return this.totalBalance;
  }

  async getAccount(): Promise<any> {
    await this.retrieveServerTime();
    const getAccountData = await this.db.getAccount(this.timestamp, this.recvWindow).toPromise();
    const accountData = JSON.parse(getAccountData);
    this.balances = accountData.balances.filter(x => parseFloat(x.free) > 0.0000000);
    return this.balances;
  }

  async retrieveServerTime(): Promise<any> {
    const serverTime: string = await this.db.getServerTime().toPromise();
    this.serverTime = +JSON.parse(serverTime).serverTime;
    if (this.timestamp < (this.serverTime + 1000) && (this.serverTime - +this.timestamp) <= this.recvWindow) {
      return this.serverTime;
    }
    console.warn('recv window failed, increase order trade window?');
    return false;
  }

  async getAllQuoteAssets(): Promise<any> {
    const callExchangeInfo = await this.db.getExchange().toPromise();
    let symbols = JSON.parse(callExchangeInfo).symbols;
    symbols.forEach((element) => {
      if (this.quoteAssets.indexOf(element.quoteAsset) === -1) {
        this.quoteAssets.push(element.quoteAsset);
      }
    });
    return this.quoteAssets;
  }

}
