import { useState, useEffect } from 'react';
import axios from 'axios';
import { ThemeProvider, StylesProvider, jssPreset } from '@material-ui/core/styles';
import { Alert, AlertTitle} from '@material-ui/lab';
import Container from '@material-ui/core/Container';
import { create } from 'jss';
import rtl from 'jss-rtl';
import auth0 from '../lib/auth0'
import theme from '../styles/theme';
import { useStyles } from  '../styles/global';
import { drawerWidth, sidebarTopPadding } from '../helpers/constants';
import { businessFetcher } from '../helpers/fetchers';
import Sidebar from '../components/Sidebar';
import GuestWelcome from '../components/GuestWelcome';

axios.defaults.baseURL = 'http://localhost:3000';


// Configure JSS
const jss = create({ plugins: [...jssPreset().plugins, rtl()] });

function MyApp({ Component, pageProps, userInfo }) {
  const [entry, setEntry] = useState(null);
  const [guestWelcome, setGuestWelcome] = useState(!Boolean(userInfo));
  const [showAlert, setShowAlert] = useState(true);
  const [contentWidth, setContentWidth] = useState(0);
  useStyles();  

  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  });
  useEffect(() => {
    if (localStorage.getItem("welcomeGuest")) {
      setGuestWelcome(false);
    }
  }, []);


  const renderAlert = () => {
    return showAlert && (
      <Container maxWidth="md" style={{ marginBottom: '24px' }}>
        <Alert severity="warning" onClose={() => setShowAlert(false)} style={{ overflow: "auto" }}>
          <AlertTitle>שים לב</AlertTitle>
          לא התחברת ולכן אתה מחובר כעת כאורח
        </Alert>
      </Container>
    )
  }

  return (
    <StylesProvider jss={jss}>
      <ThemeProvider theme={theme}>
        <Sidebar
          user={userInfo}
          setChildWidth={setContentWidth}
          popup={[entry, setEntry]}
          drawerWidth={drawerWidth}
          padding={sidebarTopPadding}
        >
          {guestWelcome ?
          <GuestWelcome
            next={() => setGuestWelcome(false)}
          /> :
          <div>
            { !userInfo && renderAlert() }
            <Component width={contentWidth} popup={[entry, setEntry]} {...pageProps} /> 
          </div> }
        </Sidebar>
      </ThemeProvider>
    </StylesProvider>
  )
}

MyApp.getInitialProps = async (appCtx) => {
  const welcome = "/welcome";
  const { req, res } = appCtx.ctx;
  const session = await auth0.getSession(req);
  const businessInfo = await businessFetcher(session);
  if (!businessInfo?.name && req.url != welcome) {
    res.writeHead(302, {
      Location: welcome,
    });
    res.end();
  }
  if (businessInfo?.name && req.url == welcome) {
    res.writeHead(302, {
      Location: "/",
    });
    res.end();
  }
  return { userInfo: session?.user };
}

export default MyApp;
