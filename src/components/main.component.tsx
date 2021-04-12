import {Fragment, FunctionComponentElement, useEffect, useMemo, useState} from 'react';
import {Subscription} from 'rxjs';
import {withLatestFrom} from 'rxjs/operators';

import {UseState} from '../models/helper-types/use-state.type';
import {EthereumService} from '../services/ethereum.service';

export function MainComponent(): FunctionComponentElement<any> {
    const ethereumService: EthereumService = useMemo(() => EthereumService.getInstance(), []);
    const [account, setAccount]: UseState<string> = useState('');
    const [chain, setChain]: UseState<string> = useState('');

    useEffect(() => {
        const subscription: Subscription = ethereumService.chain
            .pipe(withLatestFrom(ethereumService.account))
            .subscribe(([chain, account]: [string, string]) => {
                setChain(chain);
                setAccount(account);
            });
        return () => {
            subscription.unsubscribe();
        };
    });

    return (
        <Fragment>
            <div className="row  justify-content-center">
                Chain:{chain}
            </div>
            <div className="row  justify-content-center">
                Account: {account}
            </div>
        </Fragment>
    );
}
