import { Request, Response } from 'express'

import {
  defaultConfig,
  RouteCreator,
  RouteRegistrator,
  setSession,
  requireAuth
} from '../pkg'

export const createWelcomeRoute: RouteCreator =
  (createHelpers) => async (req, res) => {
    res.locals.projectName = 'Welcome to Ory'

    const { sdk } = createHelpers(req)

    // Create a logout URL
    const logoutUrl =
      (
        await sdk
          .createSelfServiceLogoutFlowUrlForBrowsers(req.header('cookie'))
          .catch(() => ({ data: { logout_url: '' } }))
      ).data.logout_url || '';

      console.log(logoutUrl);
  }

export const registerWelcomeRoute: RouteRegistrator = (
  app,
  createHelpers = defaultConfig,
  route = '/welcome'
) => {
  app.get(route, setSession(createHelpers), requireAuth(createHelpers), createWelcomeRoute(createHelpers))
}
