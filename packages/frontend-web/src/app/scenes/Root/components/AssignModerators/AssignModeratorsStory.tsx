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

import { storiesOf } from '@storybook/react';
import { List, Set } from 'immutable';
import { fakeArticleModel, fakeUserModel } from '../../../../../models/fake';
import { AssignModerators } from './AssignModerators';

const article = fakeArticleModel();

const users = List([
  fakeUserModel({
    name: 'Person One',
    avatarURL: 'https://s3.amazonaws.com/uifaces/faces/twitter/curiousoffice/128.jpg',
  }),
  fakeUserModel({
    name: 'Person Two',
    avatarURL: 'https://s3.amazonaws.com/uifaces/faces/twitter/curiousoffice/128.jpg',
  }),
  fakeUserModel({
    name: 'Person Three',
    avatarURL: 'https://s3.amazonaws.com/uifaces/faces/twitter/curiousoffice/128.jpg',
  }),
]);

const moderatorIds = Set<number|string>([users.get(0).id]);

storiesOf('AssignModerators', module)
    .add('Default', () => (
      <AssignModerators
        users={users}
        article={article}
        moderatorIds={moderatorIds}
        isReady
        label="Add a moderator"
      />
    ));
