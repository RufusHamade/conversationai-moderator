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

import { Record } from 'immutable';
import { TypedRecord } from 'typed-immutable-record';

export interface IUserAttributes {
  id: string;
  name: string;
  key?: string;
  email?: string;
  avatarURL?: string;
  group: string;
  isActive: boolean;
  extra?: any;
}

export interface IUserModel extends TypedRecord<IUserModel>, IUserAttributes {}

const UserModelRecord = Record({
  id: null,
  name: null,
  key: null,
  email: null,
  avatarURL: null,
  group: null,
  isActive: null,
  extra: null,
});

export function UserModel(keyValuePairs?: IUserAttributes): IUserModel {
  return new UserModelRecord(keyValuePairs) as IUserModel;
}
