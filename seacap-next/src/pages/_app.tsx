import type { AppProps } from "next/app";
import Head from "next/head";
import "../../.semantic/dist/semantic.min.css";
import Layout from "../components/layout";

function App({ Component, pageProps }: AppProps)
{
    return <Layout>
        <Head>
            <title>SEA Captain</title>
        </Head>
        <Component {...pageProps} />
    </Layout>;
}

export default App;
