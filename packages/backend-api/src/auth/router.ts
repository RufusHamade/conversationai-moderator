/*
Copyright 2017 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import * as express from 'express';
import * as passport from 'passport';
import * as qs from 'qs';

import { createToken, isFirstUserInitialised, IUserInstance } from '@conversationai/moderator-backend-core';
import { config } from '@conversationai/moderator-config';

import { generateServerCSRF, getClientCSRF } from './utils';

export function createAuthRouter(): express.Router {
  const router = express.Router({
    caseSensitive: true,
    mergeParams: true,
  });

  // Test endpoint, you should not be able to see the result of this without
  // a vaid JWT Authorization header:
  //
  // Authorization: JWT (token string)

  router.get(
    '/auth/healthcheck',
    async (_1, res, _2) => {
      if (await isFirstUserInitialised()) {
        res.send('ok');
        return;
      }
      res.status(218).send('Still initialising');
    },
  );

  router.get(
    '/auth/test',
    passport.authenticate('jwt', { session: false }),
    (_, res) => {
      res.send('You should not be able to see this unless you have a valid JWT token');
    },
  );

  // Configure Google OAuth2 login

  router.get(
    '/auth/login/google',
    async (req, res, next) => {
      const serverCSRF = await generateServerCSRF(req, res, next);

      if (res.headersSent) {
        return;
      }

      passport.authenticate('google', {
        session: false,

        // Get profile information and email address
        // https://developers.google.com/+/web/api/rest/oauth#authorization-scopes
        scope: ['profile', 'email'],

        state: serverCSRF,

        // Force approval UI and account switcher in OAuth login
        accessType: 'online',
        prompt: 'consent',
      } as any)(req, res, next);
    },
  );

  // Google OAuth Callback URL

  router.get(
    '/auth/callback/google',
    (req, res, next) => {
      passport.authenticate('google', {
        session: false,
      }, async (err: any, user: IUserInstance | false, info: any) => {

        const {clientCSRF, referrer, errorMessage} = await getClientCSRF(req);

        if (err) {
          return redirectToFrontend(
            res,
            false,
            {
              errorMessage: `Authentication error: ${err.toString()}`,
            },
          );
        }

        if (!user) {
          return redirectToFrontend(
            res,
            false,
            {
              errorMessage: info.reason,
            },
          );
        }

        if (errorMessage) {
          return redirectToFrontend(
            res,
            false,
            {
              errorMessage: errorMessage,
            },
            referrer,
          );
        }

        const token = await createToken(user.id, user.get('email'));
        return redirectToFrontend(
          res,
          true,
          {
            token,
            csrf: clientCSRF,
          },
          referrer,
        );
      })(req, res, next);
    },
  );

  function redirectToFrontend(
    res: express.Response,
    success: boolean,
    params: object = {},
    referrer?: string,
  ): void {
    let redirectHost;

    if (
      (config.get('redirect_oauth_to') === 'frontend_url') ||
      !referrer
    ) {
      redirectHost = config.get('frontend_url');
    } else {
      redirectHost = referrer;
    }

    if (redirectHost === '') {
      redirectHost = '/';
    }

    const queryString = qs.stringify(Object.assign({
      error: !success,
    }, params));

    res.redirect(`${redirectHost}?${queryString}`);
  }

  return router;
}
