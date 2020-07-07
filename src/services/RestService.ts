import {ClientEndpointsApiInterface, ClientEndpointsApiFactory} from "iaphub_api";
import Axios, {AxiosRequestConfig, AxiosResponse} from "axios";

import {AxiosCancelException} from "../exceptions/AxiosCancelException";
import {InternalClientErrorException} from "../exceptions/InternalClientErrorException";

const pkg = require('../../package.json');

class RestServiceClass {
    Get(ApiBase: string, ApiKey: string): ClientEndpointsApiInterface {
        const AxiosInstance = Axios.create({
            timeout: 10000
        });

        AxiosInstance.interceptors.request.use(this.RequestResolveMiddleware.bind(this, ApiKey));
        AxiosInstance.interceptors.response.use(this.ResponseResolveMiddleware, this.ResponseErrorMiddleware);

        return ClientEndpointsApiFactory({}, ApiBase, AxiosInstance);
    }

    RequestResolveMiddleware(ApiKey: string, Config: AxiosRequestConfig) {
        Config.headers.authorization = `ApiKey ${ApiKey}`;

        const AdditionalData = {
            libraryName: 'react_native',
            libraryVersion: pkg.version
        };

        if( Config.method === "GET" ) {
            Config.params = {
                ...Config.params,
                ...AdditionalData
            }
        } else {
            Config.data = {
                ...Config.data,
                ...AdditionalData
            }
        }

        return Config;
    }

    async ResponseResolveMiddleware(response: AxiosResponse): Promise<AxiosResponse> {
        return response;
    }

    async ResponseErrorMiddleware(error: any) {
        if (Axios.isCancel(error)) {
            throw new AxiosCancelException();
        } else if (!error.isAxiosError) {
            throw new InternalClientErrorException();
        }
    }
}

export const RestService = new RestServiceClass();
