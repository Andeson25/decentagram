import * as React from 'react';
import {Subscription} from 'rxjs';
import {withLatestFrom} from 'rxjs/operators';
import {useEffect, useMemo, useState} from 'react';

import {EthereumService} from '../services/ethereum.service';
import {isMetaMaskInstalled} from '../helpers/meta-mask.helper';
import {UseState} from '../models/helper-types/use-state.type';

export function AppComponent(): React.FunctionComponentElement<any> {
    const ethereumService: EthereumService = useMemo(() => EthereumService.getInstance(), []);
    const [account, setAccount]: UseState<string> = useState('');
    const [chain, setChain]: UseState<string> = useState('');
    const [loading, setLoading]: UseState<boolean> = useState(true);

    useEffect(() => {
        const subscription: Subscription = ethereumService.chain
            .pipe(withLatestFrom(ethereumService.account))
            .subscribe(([chain, account]: [string, string]) => {
                setChain(chain);
                setAccount(account);
                setLoading(false);
            });
        return () => {
            subscription.unsubscribe();
        };
    }, [ethereumService]);


    if (!isMetaMaskInstalled()) {
        return (
            <div className="container bg-light my-5 px-5 py-3 text-center">
                Please Install MetaMask
            </div>
        );
    }


    if (!ethereumService.isTestNetwork) {
        return (
            <div className="container bg-light my-5 px-5 py-3 text-center">
                Please Select Ropsten Test Network
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
            <div className="container bg-light">
                <p>Chain: {chain}</p>
                <p>Account: {account}</p>
            </div>
        </div>
    );
}
