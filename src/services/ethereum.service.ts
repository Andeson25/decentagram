import Web3 from 'web3';
import {BehaviorSubject, Observable} from 'rxjs';

import {isMetaMaskInstalled} from '../helpers/meta-mask.helper';
import {Constructor} from '../models/helper-types/constructor.type';

export class EthereumService {
    public static instance;

    private readonly ETHEREUM: any;
    private readonly WEB3: Web3;
    private readonly TEST_VERSION = '0x3';

    private _account: BehaviorSubject<string> = new BehaviorSubject(undefined);

    public get account(): Observable<string> {
        return this._account.asObservable();
    }

    private _chain: BehaviorSubject<string> = new BehaviorSubject(undefined);

    public get chain(): Observable<string> {
        return this._chain.asObservable();
    }

    public get isTestNetwork(): boolean {
        return this.ETHEREUM.chainId === this.TEST_VERSION;
    }

    constructor(ethereum) {
        if (isMetaMaskInstalled()) {
            this.ETHEREUM = ethereum;
            this.WEB3 = new Web3(this.ETHEREUM);
            this.ETHEREUM.request({method: 'eth_chainId'})
                .then((chain: string) => {
                    this._chain.next(chain);
                    return this.ETHEREUM.request({method: 'eth_requestAccounts'});
                })
                .then(([account]: Array<string>) => {
                    this._account.next(account);
                    this.ETHEREUM.on('accountsChanged', ([account]) => this._account.next(account));
                    this.ETHEREUM.on('chainChanged', chainId => this._chain.next(chainId));
                });
        }
    }

    public static getInstance(): EthereumService {
        if (isMetaMaskInstalled()) {
            if (!EthereumService.instance) {
                EthereumService.instance = new EthereumService(window['ethereum']);
            }
            return EthereumService.instance;
        } else {
            throw new Error('Meta Mask is not installed');
        }
    }

    public contractFactory<T>(contractConstructor: Constructor<T>): T {
        return new contractConstructor(this.WEB3);
    };

    private _onChainChange(): void {
        this.ETHEREUM.enable()
            .then(() => this.ETHEREUM.request({method: 'eth_chainId'}))
            .then((chain: string) => {
                this._chain.next(chain);
                return this.WEB3.eth.getAccounts();
            })
            .then(([account]: Array<string>) => this._account.next(account));
    }
}
