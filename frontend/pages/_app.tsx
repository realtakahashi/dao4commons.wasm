import '../styles/globals.scss'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;

// const Noop: FC = ({ children }) => <>{children}</>
// // https://zenn.dev/sora_kumo/articles/e86bbf0291d4a7
// DaoMaker.getInitialProps = async () => ({ pageProps: {} })

// function DaoMaker({ Component, pageProps }: AppProps & { Component: { Layout: FC } }) {
//   const Layout = Component.Layout ?? Noop
//   return (
//     <WalletProvider>
//       <Layout>
//         <Component {...pageProps} />
//       </Layout>
//     </WalletProvider>
//   )
// }


// export default DaoMaker
