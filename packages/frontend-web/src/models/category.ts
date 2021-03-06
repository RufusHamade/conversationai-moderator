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
import { IUserModel, UserModel } from './user';

export interface ICategoryAttributes {
  id: string | 'all' | 'deferred' | 'assignments';
  label: string;
  updatedAt: string;
  allCount: number;
  unprocessedCount: number;
  unmoderatedCount: number;
  moderatedCount: number;
  deferredCount: number;
  approvedCount: number;
  highlightedCount: number;
  rejectedCount: number;
  flaggedCount: number;
  recommendedCount: number;
  batchedCount: number;
  assignedModerators: Array<IUserModel>;
}

export interface ICategoryModel extends TypedRecord<ICategoryModel>, ICategoryAttributes {}

const CategoryModelRecord = Record({
  id: null,
  label: null,
  updatedAt: null,
  allCount: null,
  unprocessedCount: null,
  unmoderatedCount: null,
  moderatedCount: null,
  deferredCount: null,
  approvedCount: null,
  highlightedCount: null,
  rejectedCount: null,
  flaggedCount: null,
  recommendedCount: null,
  batchedCount: null,
  assignedModerators: null,
});

export function CategoryModel(keyValuePairs?: Partial<ICategoryAttributes>): ICategoryModel {
  let category = new CategoryModelRecord(keyValuePairs) as ICategoryModel;

  if (category.assignedModerators) {
    category = category.update('assignedModerators', (m) => m.map(UserModel));
  }

  return category;
}
