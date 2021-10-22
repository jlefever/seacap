import Document, { DocumentContext, Head, Html, Main, NextScript } from "next/document";
import { ServerStyleSheet } from "styled-components";

export default class MyDocument extends Document
{
    // Adapted from https://github.com/vercel/next.js/blob/86160a5190c50ea315c7ba91d77dfb51c42bc65f/examples/with-styled-components/pages/_document.js
    // See also:
    // - https://styled-components.com/docs/advanced#server-side-rendering
    // - https://nextjs.org/docs/advanced-features/custom-document#customizing-renderpage
    static async getInitialProps(ctx: DocumentContext)
    {
        const sheet = new ServerStyleSheet();
        const originalRenderPage = ctx.renderPage;

        try
        {
            ctx.renderPage = () => originalRenderPage({
                enhanceApp: (App) => (props) => sheet.collectStyles(<App {...props} />)
            });

            const initialProps = await Document.getInitialProps(ctx);

            const styles = <>{initialProps.styles}{sheet.getStyleElement()}</>;

            return { ...initialProps, styles };
        }
        finally
        {
            sheet.seal();
        }
    }

    render()
    {
        return <Html>
            <Head>
                {/* Generated with https://realfavicongenerator.net/ */}
                {/* The logo is "code" from https://feathericons.com/ */}
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="manifest" href="/site.webmanifest" />
                <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
                <meta name="msapplication-TileColor" content="#da532c" />
                <meta name="theme-color" content="#ffffff" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>;
    }
}