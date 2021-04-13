import Web3 from 'web3';
import {provider} from 'web3-core';
import {Contract} from 'web3-eth-contract';
import {BehaviorSubject, Observable, ReplaySubject} from 'rxjs';

import {isMetaMaskInstalled} from '../helpers/meta-mask.helper';
import {Constructor} from '../models/helper-types/constructor.type';
import {BaseContract} from '../models/base.contract';

export class EthereumService {
    public static instance: EthereumService;
    private readonly ETHEREUM: any;
    private readonly WEB3: Web3;

    private _account: BehaviorSubject<string> = new BehaviorSubject(undefined);

    public get account(): Observable<string> {
        return this._account.asObservable();
    }

    private _balance: BehaviorSubject<number> = new BehaviorSubject(undefined);

    public get balance(): Observable<number> {
        return this._balance.asObservable();
    }

    private _network: BehaviorSubject<string> = new BehaviorSubject(undefined);

    public get network(): Observable<string> {
        return this._network.asObservable();
    }

    private _isReady: ReplaySubject<boolean> = new ReplaySubject();

    public get isReady(): Observable<boolean> {
        return this._isReady.asObservable();
    }

    constructor(ethereum: provider) {
        if (isMetaMaskInstalled()) {
            this.ETHEREUM = ethereum;
            this.WEB3 = new Web3(this.ETHEREUM);
            this._init()
                .then(() => {
                    this.ETHEREUM.on('accountsChanged', () => this._init());
                    this.ETHEREUM.on('networkChanged', () => this._init());
                });
        }
    }

    public static getContractConstructor(): Constructor<Contract> {
        return EthereumService.getInstance().WEB3.eth.Contract;
    };

    public static getInstance(): EthereumService {
        if (isMetaMaskInstalled()) {
            if (!EthereumService.instance) {
                EthereumService.instance = new EthereumService(window['ethereum'] as provider);
            }
            return EthereumService.instance;
        } else {
            throw new Error('Meta Mask is not installed');
        }
    }

    public contractFactory<T extends BaseContract>(contractConstructor: Constructor<T & BaseContract>): T & BaseContract {
        return new contractConstructor(this._network.getValue());
    }

    private _init(): Promise<void> {
        this._isReady.next(false);
        return this.ETHEREUM.enable()
            .then(() => this.WEB3.eth.getBalance(this.ETHEREUM.selectedAddress))
            .then((balance: string) => {
                this._account.next(this.ETHEREUM.selectedAddress);
                this._balance.next(Number(this.WEB3.utils.fromWei(balance, 'ether')));
                this._network.next(this.ETHEREUM.networkVersion);
                this._isReady.next(true);
            });
    }
}
