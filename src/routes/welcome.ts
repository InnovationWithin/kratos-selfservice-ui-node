import {
  defaultConfig,
  getUrlForFlow,
  isQuerySet,
  logger,
  redirectOnSoftError,
  removeTrailingSlash,
  RouteCreator,
  setSession,
  RouteRegistrator
} from '../pkg'

export const createLoginRoute: RouteCreator =
  (createHelpers) => async (req, res, next) => {
    res.locals.projectName = 'Sign in'

    const { flow, aal = '', refresh = '', return_to = '' } = req.query
    const helpers = createHelpers(req)
    const { sdk, kratosBrowserUrl } = helpers
    const initFlowUrl = getUrlForFlow(
      kratosBrowserUrl,
      'welcome',
      new URLSearchParams({
        aal: aal.toString(),
        refresh: refresh.toString(),
        return_to: return_to.toString()
      })
    )

    const initRegistrationUrl = getUrlForFlow(
      kratosBrowserUrl,
      'registration',
      new URLSearchParams({
        return_to: return_to.toString()
      })
    )

    // The flow is used to identify the settings and registration flow and
    // return data like the csrf_token and so on.
    if (!isQuerySet(flow)) {
      logger.debug('No flow ID found in URL query initializing login flow', {
        query: req.query
      })
      res.redirect(303, initFlowUrl)
      return
    }

    // It is probably a bit strange to have a logout URL here, however this screen
    // is also used for 2FA flows. If something goes wrong there, we probably want
    // to give the user the option to sign out!
    const logoutUrl =
      (
        await sdk
          .createSelfServiceLogoutFlowUrlForBrowsers(req.header('cookie'))
          .catch(() => ({ data: { logout_url: '' } }))
      ).data.logout_url || ''

    return sdk
      .getSelfServiceLoginFlow(flow, req.header('cookie'))
      .then(({ data: flow }) => {
        // Render the data using a view (e.g. Jade Template):
        res.render('login', {
          ...flow,
          isAuthenticated: flow.refresh || flow.requested_aal === 'aal2',
          signUpUrl: initRegistrationUrl,
          logoutUrl: logoutUrl
        })
      })
      .catch(redirectOnSoftError(res, next, initFlowUrl))
  }

export const registerWelcomeRoute: RouteRegistrator = (
  app,
  createHelpers = defaultConfig,
) => {
  app.get('/welcome', setSession(createHelpers), createLoginRoute(createHelpers))
}



// import { Request, Response } from 'express'

// import {
//   defaultConfig,
//   RouteCreator,
//   RouteRegistrator,
//   setSession,
//   requireAuth
// } from '../pkg'

// export const createWelcomeRoute: RouteCreator =
//   (createHelpers) => async (req, res) => {
//     res.locals.projectName = 'Welcome to Ory'

//     const { sdk } = createHelpers(req)

//     // Create a logout URL
//     const logoutUrl =
//       (
//         await sdk
//           .createSelfServiceLogoutFlowUrlForBrowsers(req.header('cookie'))
//           .catch(() => ({ data: { logout_url: '' } }))
//       ).data.logout_url || '';

//       console.log(logoutUrl);
//   }

// export const registerWelcomeRoute: RouteRegistrator = (
//   app,
//   createHelpers = defaultConfig,
//   route = '/welcome'
// ) => {
//   app.get(route, setSession(createHelpers), requireAuth(createHelpers), createWelcomeRoute(createHelpers))
// }
