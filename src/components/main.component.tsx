import {FormEvent, FormEventHandler, FunctionComponentElement, useEffect, useMemo, useState} from 'react';

import {UseState} from '../models/helper-types/use-state.type';
import {EthereumService} from '../services/ethereum.service';
import {DecentagramContract} from '../models/decentagram.contract';

type FormType = { image: string; description: string };

export function MainComponent(): FunctionComponentElement<any> {
    const [loading, setLoading]: UseState<boolean> = useState(false);
    const [contractName, setContractName]: UseState<string> = useState('');
    const [image, setImage]: UseState<string> = useState('');

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
        if (decentagramContract) {
            setLoading(true);
            decentagramContract.methods.name().call()
                .then((name: string) => setContractName(name))
                .then(() => setLoading(false));
        }
    }, [ethereumService, decentagramContract]);

    if (loading) {
        return (
            <div className="container bg-light py-5 text-center">
                <div className="spinner-border"/>
            </div>
        );
    }

    if (!decentagramContract) {
        return (
            <div className="container bg-light py-5 text-center">
                Decentagram contract not deployed to detected network.
            </div>
        );
    }

    const onImageChange = ({target}: { target: HTMLInputElement }) => {
        setImage(URL.createObjectURL(target.files[0]));
    };

    const onSubmit: FormEventHandler<HTMLFormElement> = async (event: FormEvent) => {
        event.preventDefault();
        setLoading(true);

        const formData: FormData = new FormData(event.target as HTMLFormElement);
        const form: FormType = {
            image: await _toBase64(formData.get('image') as File),
            description: formData.get('description') as string
        };

        console.log(form);
        setTimeout(() => setLoading(false), 2000);

        (event.target as HTMLFormElement).reset();
        setImage(null);
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const _toFile = (buffer: string): Promise<File> => {
    //     const type: string = buffer.split('data:')[1].split(';')[0].trim()
    //
    //     return fetch(buffer)
    //         .then((res: Body) => res.blob())
    //         .then((blob: Blob) => {
    //             return new File([blob], "File name", {type})
    //         })
    // }

    const _toBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    return (
        <form onSubmit={onSubmit} className="container bg-light py-5">
            <div className="form-group text-center">
                {contractName}
            </div>
            <div className="form-group text-center">
                <label htmlFor="image" className="m-0  btn btn-lg btn-secondary">Upload photo</label>
                <input onChange={onImageChange} className="d-none" type="file" name="image" id="image"/>
            </div>
            {
                image
                    ?
                    <div className="form-group text-center">
                        <img src={image} alt="none" style={{maxHeight: '300px'}}/>
                    </div>
                    :
                    null
            }
            <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea name="description" id="description" className="form-control"/>
            </div>
            <div className="form-group text-center mb-0">
                <button className="btn btn-success" type="submit">Upload</button>
            </div>
        </form>
    );
}
