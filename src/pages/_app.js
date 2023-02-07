import '@/styles/globals.css'

import { configureAbly } from "@ably-labs/react-hooks";

configureAbly({ key: process.env.NEXT_PUBLIC_ABLY_API_KEY });

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}
