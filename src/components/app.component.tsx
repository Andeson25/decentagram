import {Fragment, FunctionComponentElement, useEffect, useMemo, useState} from 'react';
import {Subscription} from 'rxjs';
import {withLatestFrom} from 'rxjs/operators';
import Onboarding from '@metamask/onboarding';

import {EthereumService} from '../services/ethereum.service';
import {isMetaMaskInstalled} from '../helpers/meta-mask.helper';
import {UseState} from '../models/helper-types/use-state.type';
import {MainComponent} from './main.component';
import {HeaderComponent} from './header.component';

export function AppComponent(): FunctionComponentElement<any> {
    const [loading, setLoading]: UseState<boolean> = useState(true);
    const [account, setAccount]: UseState<string> = useState();
    const [network, setNetwork]: UseState<string> = useState();
    const [balance, setBalance]: UseState<number> = useState();

    const ethereumService: EthereumService = useMemo(() => {
        try {
            return EthereumService.getInstance();
        } catch (e) {
            return null;
        }
    }, []);

    useEffect(() => {
        if (ethereumService) {
            const subscription: Subscription = ethereumService.isReady
                .pipe(
                    withLatestFrom(
                        ethereumService.account,
                        ethereumService.network,
                        ethereumService.balance
                    )
                )
                .subscribe(([isReady, account, network, balance]: [boolean, string, string, number]) => {
                    setAccount(account);
                    setNetwork(network);
                    setBalance(balance);
                    setLoading(!isReady);
                });
            return () => {
                subscription.unsubscribe();
            };
        }
    }, [ethereumService]);

    const installMetaMask = () => {
        new Onboarding({
            forwarderMode: 'INJECT',
            forwarderOrigin: window.location.origin
        })
            .startOnboarding();
    };

    if (!isMetaMaskInstalled() || !ethereumService) {
        return (
            <div className="container bg-light my-5 px-5 py-3 text-center">
                <button className="btn btn-success" onClick={installMetaMask}>Install MetaMask</button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container bg-light my-5 px-5 py-3 text-center">
                <div className="spinner-border"/>
            </div>
        );
    }

    return (
        <Fragment>
            <HeaderComponent account={account} network={network} balance={balance}/>
            <div className="py-5">
                <MainComponent/>
            </div>
        </Fragment>
    );
}
