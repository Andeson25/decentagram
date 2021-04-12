import {Fragment, FunctionComponentElement, useEffect, useMemo, useState} from 'react';
import {Subscription} from 'rxjs';
import {withLatestFrom} from 'rxjs/operators';

import {UseState} from '../models/helper-types/use-state.type';
import {EthereumService} from '../services/ethereum.service';
import {DecentagramContract} from '../models/decentagram.contract';

export function MainComponent(): FunctionComponentElement<any> {
    const ethereumService: EthereumService = useMemo(() => EthereumService.getInstance(), []);
    const [account, setAccount]: UseState<string> = useState('');
    const [error, setError]: UseState<Error> = useState(null);
    const [chain, setChain]: UseState<string> = useState('');
    const decentagramContract: DecentagramContract = useMemo(
        () => {
            try {
                return ethereumService.contractFactory(DecentagramContract);
            } catch (e) {
                setError(e);
            }
        }, [ethereumService]);

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

    if (error && !decentagramContract) {
        return (
            <div className="row  justify-content-center">
                {error.message}
            </div>
        );
    }

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
