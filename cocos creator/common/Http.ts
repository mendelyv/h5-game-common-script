
/**
 * @class name : Http
 * @description : 网络请求类
 * @author : Ran
 * @time : 2022.07.14
 */
 export default class Http {
    public static request({ url, method = "post", data, headers = {} }) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(method, url);
            Object.keys(headers).forEach(key => {
                xhr.setRequestHeader(key, headers[key]);
            });
            xhr.send(data);
            console.log(` ===== ${method} ${url} ${JSON.stringify(data)} ===== `);
            xhr.onload = (e) => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject(xhr.statusText);
                }
            }
        });
    }
}
