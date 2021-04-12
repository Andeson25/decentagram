import {Subscription} from 'rxjs';
import {FunctionComponentElement, useEffect, useMemo, useState} from 'react';

import {EthereumService} from '../services/ethereum.service';
import {isMetaMaskInstalled} from '../helpers/meta-mask.helper';
import {UseState} from '../models/helper-types/use-state.type';
import {MainComponent} from './main.component';
import {NetworkNameType, NetworkType} from '../enums/network-type.enum';

export function AppComponent(): FunctionComponentElement<any> {
    const ethereumService: EthereumService = useMemo(() => EthereumService.getInstance(), []);
    const [loading, setLoading]: UseState<boolean> = useState(true);

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


    if (!ethereumService.isTestNetwork) {
        return (
            <div className="container bg-light my-5 px-5 py-3 text-center">
                Please Select {NetworkNameType[NetworkType.Ropsten]} Network
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
