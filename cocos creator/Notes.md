### cocos使用input标签上传图片
```typescript
	let imgInput = document.createElement("input");
        document.body.appendChild(imgInput);
        imgInput.type = "file";
        imgInput.accept = "image/*";
        imgInput.click();
        imgInput.onchange = (e) => {
            let file = imgInput.files[0];
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                let base = reader.result as string;
                let img = new Image();
                img.src = base;
                img.onload = () => {
                    let tex = new cc.Texture2D();
                    tex.initWithElement(img);
                    tex.handleLoadedTexture();
		    // ...操作纹理
                }
            };
            reader.onerror = function(e) {
                alert("error " + e.target.error.code + " \n\niPhone iOS8 Permissions Error.");
            }
        }
```
主要思路为在cocos中触发点击事件后，手动创建一个input标签并调用标签的click事件，这里注意要将标签加入到dom树中，否则safari不会读取文件数据。
上传则将input标签中的file使用FormData写入请求。
