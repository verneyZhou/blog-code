module.exports = {
    // lineNumbers: true, // 显示代码块行号
    extractHeaders: ["h2", "h3", "h4"], // VuePress默认只会提取h2和h3标题,你可以通过这个选项来修改提取出的标题级别,分别支持h1~h4
    // 为 Markdown 渲染出的图片默认加上懒加载与异步解码，减少首屏图片请求压力
    extendMarkdown: (md) => {
        const injectLazyAttrsIntoImgHtml = (html) => {
            if (!html || html.indexOf('<img') === -1) return html;

            return html.replace(/<img\b([^>]*?)(\/?)>/gi, (match, rawAttrs, selfClosingSlash) => {
                let attrs = rawAttrs || '';
                if (!/\bloading\s*=/.test(attrs)) attrs = ` loading="lazy"${attrs}`;
                if (!/\bdecoding\s*=/.test(attrs)) attrs = ` decoding="async"${attrs}`;
                const end = selfClosingSlash ? '/>' : '>';
                return `<img${attrs}${end}`;
            });
        };

        const defaultImageRender = md.renderer.rules.image || function (tokens, idx, options, env, self) {
            return self.renderToken(tokens, idx, options);
        };

        md.renderer.rules.image = function (tokens, idx, options, env, self) {
            const token = tokens[idx];
            token.attrSet('loading', 'lazy');
            token.attrSet('decoding', 'async');
            return defaultImageRender(tokens, idx, options, env, self);
        };

        // 兼容 Markdown 里直接写的原生 <img .../>（这种不会走 markdown-it 的 image token）
        ['html_block', 'html_inline'].forEach((ruleName) => {
            const defaultHtmlRender = md.renderer.rules[ruleName] || function (tokens, idx) {
                return tokens[idx].content;
            };

            md.renderer.rules[ruleName] = function (tokens, idx, options, env, self) {
                const token = tokens[idx];
                token.content = injectLazyAttrsIntoImgHtml(token.content);
                return defaultHtmlRender(tokens, idx, options, env, self);
            };
        });
    }
}
