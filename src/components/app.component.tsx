import {Subscription} from 'rxjs';
import {FunctionComponentElement, useEffect, useMemo, useState} from 'react';

import {EthereumService} from '../services/ethereum.service';
import {isMetaMaskInstalled} from '../helpers/meta-mask.helper';
import {UseState} from '../models/helper-types/use-state.type';
import {MainComponent} from './main.component';

export function AppComponent(): FunctionComponentElement<any> {
    const [loading, setLoading]: UseState<boolean> = useState(true);

    const ethereumService: EthereumService = useMemo(() => EthereumService.getInstance(), []);

    useEffect(() => {
        const subscription: Subscription = ethereumService.isReady
            .subscribe((isReady: boolean) => {
                setLoading(!isReady);
            });
        return () => {
            subscription.unsubscribe();
        };
    });

    if (!isMetaMaskInstalled()) {
        return (
            <div className="container bg-light my-5 px-5 py-3 text-center">
                Please Install MetaMask
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container bg-light my-5 px-5 py-3 text-center">
                Loading...
            </div>
        );
    }

    return (
        <div className="py-5">
            <div className="container bg-light py-5">
                <MainComponent/>
            </div>
        </div>
    );
}
