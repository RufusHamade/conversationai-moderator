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

import * as WebSocket from 'ws';

import { clearInterested, makeServer } from '@conversationai/moderator-backend-core';

import {mountAPI} from '../../../index';
import {
  expect,
  makeUser,
  sleep,
} from '../../test_helper';


describe('websocket tests', () => {
  afterEach(clearInterested);

  it('Test what we get when connect without authentication', async () => {
    const serverStuff = makeServer(true);
    const app = serverStuff.app;
    app.use('/', mountAPI(true));
    const server = serverStuff.start(3000);

    try {
      let gotClose = false;
      let gotMessage = false;
      await sleep(500);

      const socket = new WebSocket('ws://localhost:3000/services/updates/summary');

      socket.onclose = () => {
        gotClose = true;
      };

      socket.onmessage = () => {
        gotMessage = true;
      };

      await sleep(500);

      expect(gotMessage).is.false;
      expect(gotClose).is.true;
    }
    finally {
      server.close();
    }
  });

  it('Test what we get when connect with authentication', async () => {
    const user = await makeUser();

    const serverStuff = makeServer(true);
    const app = serverStuff.app;
    app.use('/', (req, _, next) => {
      req.user = user;
      next();
    });
    app.use('/', mountAPI(true));
    const server = serverStuff.start(3000);

    try {
      let gotClose = false;
      let gotMessage = 0;
      await sleep(500);

      const socket = new WebSocket('ws://localhost:3000/services/updates/summary');

      socket.onclose = () => {
        gotClose = true;
      };

      socket.onmessage = () => {
        gotMessage += 1;
      };

      await sleep(500);
      socket.close();
      expect(gotMessage).is.equal(2);
      expect(gotClose).is.false;
    }
    finally {
      server.close();
    }
  });
});
