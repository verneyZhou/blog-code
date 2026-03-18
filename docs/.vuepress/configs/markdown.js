module.exports = {
    // lineNumbers: true, // 显示代码块行号
    extractHeaders: ["h2", "h3", "h4"], // VuePress默认只会提取h2和h3标题,你可以通过这个选项来修改提取出的标题级别,分别支持h1~h4
    // 为 Markdown 渲染出的图片默认加上懒加载与异步解码，减少首屏图片请求压力
    extendMarkdown: (md) => {
        md.use((mdInstance) => {
            const defaultRender = mdInstance.renderer.rules.image || function (tokens, idx, options, env, self) {
                return self.renderToken(tokens, idx, options);
            };

            mdInstance.renderer.rules.image = function (tokens, idx, options, env, self) {
                const token = tokens[idx];
                token.attrSet('loading', 'lazy');
                token.attrSet('decoding', 'async');
                return defaultRender(tokens, idx, options, env, self);
            };
        });
    }
}
