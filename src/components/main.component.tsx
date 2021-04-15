import {Fragment, FunctionComponentElement, useEffect, useMemo, useState} from 'react';
import {Subscription} from 'rxjs';
import {withLatestFrom} from 'rxjs/operators';

import {UseState} from '../models/helper-types/use-state.type';
import {EthereumService} from '../services/ethereum.service';
import {DecentagramContract} from '../models/decentagram.contract';

export function MainComponent(): FunctionComponentElement<any> {
    const [loading, setLoading]: UseState<boolean> = useState(false);
    const [account, setAccount]: UseState<string> = useState('');
    const [network, setNetwork]: UseState<string> = useState('');
    const [balance, setBalance]: UseState<number> = useState(0);
    const [contractName, setContractName]: UseState<string> = useState('');

    const ethereumService: EthereumService = useMemo(() => EthereumService.getInstance(), []);
    const decentagramContract: DecentagramContract = useMemo(() => {
            try {
                return ethereumService.contractFactory(DecentagramContract);
            } catch (e) {
                return null;
            }
        },
        [ethereumService]
    );

    useEffect(() => {
        const subscription: Subscription = ethereumService.account
            .pipe(withLatestFrom(ethereumService.network, ethereumService.balance))
            .subscribe(([account, network, balance]: [string, string, number]) => {
                setAccount(account);
                setNetwork(network);
                setBalance(balance);
            });

        if (decentagramContract) {
            setLoading(true);
            decentagramContract.methods.name().call()
                .then((name: string) => setContractName(name))
                .then(() => setLoading(false));
        }
        return () => {
            subscription.unsubscribe();
        };
    }, [ethereumService, decentagramContract]);

    if (loading) {
        return (
            <div className="spinner-border"></div>
        );
    }

    const renderContract = () => {
        if (decentagramContract) {
            return (
                <Fragment>
                    Contract name: {contractName}
                </Fragment>
            );
        }

        return (
            <Fragment>
                Decentagram contract not deployed to detected network.
            </Fragment>
        );
    };

    return (
        <Fragment>
            <div className="row  justify-content-center">
                Network: {network}
            </div>
            <div className="row  justify-content-center">
                Account: {account}
            </div>
            <div className="row  justify-content-center">
                Balance: {balance} ETH
            </div>
            <div className="row justify-content-center">
                {renderContract()}
            </div>
        </Fragment>
    );
}
