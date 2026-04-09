import {notification} from 'antd';

const mg = window.MUSE_GLOBAL;

// 根据环境是否本地判断API服务器地址
export const apiHost = mg.isLocal ? window.MUSE_GLOBAL.appVariables?.museRunnerApiHost || 'localhost:6066' : document.location.host;

// 构建api基准地址，后续请求都从这里发起
const baseURL = `http://${apiHost}/api`;

// 定义通用异步请求函数request
async function request(path, options={})
{
    const url = /^https?:\/\//.test(path) ? path : baseURL + path;

    let response;

		// 发起fetch网络请求
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

		// 解析响应体为json数据
    const data = await response.json().catch(() => ({}));

		// 若后端返回server错误
    if (response.status === 500) {
        notification.error ({
            message : 'Server Error',
            description : data
        });
        throw new Error (data);
    }
    return {...response, data};
}


// 对外暴露常用的http请求方式
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
