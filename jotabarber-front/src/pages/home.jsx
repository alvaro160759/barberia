import { Helmet } from 'react-helmet-async';

import {CenteredSignInView} from 'src/sections/auth-demo/centered/centered-sign-in-view'

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Login</title>
      </Helmet>

      <CenteredSignInView />
    </>
  );
}
