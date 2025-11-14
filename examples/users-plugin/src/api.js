import {notification} from 'antd';

const mg = window.MUSE_GLOBAL;

export const apiHost = mg.isLocal ? window.MUSE_GLOBAL.appVariables?.museRunnerApiHost || 'localhost:6066' : document.location.host;

const baseURL = `http://${apiHost}/api`;

async function request(path, options={})
{
    const url = /^https?:\/\//.test(path) ? path : baseURL + path;

    let response;

    try{
        response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {}),
            },
            ...options,
            body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body,
        });
    } catch (err) {
        throw err;
    }

    const data = await response.json().catch(() => ({}));

    if (response.status === 500) {
        notification.error ({
            message : 'Server Error',
            description : data
        });
        throw new Error (data);
    }
    return {...response, data};
}


const apiClient = {
    get:
        (path,options)=>request(path,{...options,method:'GET'}),
    post:
        (path,body,options)=>request(path,{...options,method:'POST',body}),
    put:
        (path,body,options)=>request(path,{...options,method:'PUT',body}),
    delete:
        (path,options)=>request(path,{...options,method:'DELETE'}),
    baseURL,
};

export default apiClient;
