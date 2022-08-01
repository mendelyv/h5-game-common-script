
/**
 * @class name : Http
 * @description : 网络请求类
 * @author : Ran
 * @time : 2022.07.14
 */
export default class Http {
    public static request({ url, method = "post", query = null, data = null, headers = {}, stringify = true }) {
        return new Promise<any>((resolve, reject) => {
            if (query) {
                let dataStr = '';
                Object.keys(query).forEach(key => {
                    dataStr += key + '=' + encodeURIComponent(query[key]) + '&';
                })
                if (dataStr !== '') {
                    dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'));
                    url = url + '?' + dataStr;
                }

            }

            const xhr = new XMLHttpRequest();
            xhr.open(method, url);
            Object.keys(headers).forEach(key => {
                xhr.setRequestHeader(key, headers[key]);
            });

            data ? stringify ? xhr.send(JSON.stringify(data)) : xhr.send(data) : xhr.send();
            // console.log(` ===== ${method} ${url} ${JSON.stringify(data)} ===== `);
            // if(CC_DEBUG) 
                console.log(` ===== request ${method} ${url} ${query ? JSON.stringify(query) : ''} ${data ? JSON.stringify(data) : ''} ===== `);

            xhr.onload = (e) => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response);
                    // if(CC_DEBUG)
                        console.log(` ===== response ${xhr.response} ===== `);
                } else {
                    reject(xhr.statusText);
                }
            }
        });
    }
}
window["Http"] = Http;
