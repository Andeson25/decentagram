import {Subscription} from 'rxjs';
import {FunctionComponentElement, useEffect, useMemo, useState} from 'react';
import Onboarding from '@metamask/onboarding';

import {EthereumService} from '../services/ethereum.service';
import {isMetaMaskInstalled} from '../helpers/meta-mask.helper';
import {UseState} from '../models/helper-types/use-state.type';
import {MainComponent} from './main.component';

export function AppComponent(): FunctionComponentElement<any> {
    const [loading, setLoading]: UseState<boolean> = useState(true);

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
                .subscribe((isReady: boolean) => {
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
                <div className="spinner-border"></div>
            </div>
        );
    }

    return (
        <div className="py-5">
            <div className="container bg-light py-5 text-center">
                <MainComponent/>
            </div>
        </div>
    );
}
