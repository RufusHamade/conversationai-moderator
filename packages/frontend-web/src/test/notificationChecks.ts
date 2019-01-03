/*
Copyright 2019 Google Inc.

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
import check from 'check-types';

import { IGlobalSummary, ISystemSummary, IUserSummary } from '../app/platform/dataService';
import {
  checkArticle,
  checkCategory,
  checkPreselect,
  checkRule,
  checkTag,
  checkTaggingSensitivity,
  checkUser,
} from './objectChecks';

export const globalUpdate = {
  gotUpdate: false,
  gotCategories: false,
  gotArticles: false,
  gotUsers: false,
  gotDeferred: false,
  notificationHandler(data: IGlobalSummary) {
    console.log('Received global update message');
    globalUpdate.gotUpdate = true;
    globalUpdate.gotCategories = true;
    globalUpdate.gotArticles = true;
    globalUpdate.gotUsers = data.users.toArray().length > 0;
    globalUpdate.gotDeferred = check.number(data.deferred);
    for (const u of data.users.toArray()) {
      globalUpdate.gotUsers = globalUpdate.gotUsers && checkUser(u);
    }
    for (const c of data.categories.toArray()) {
      globalUpdate.gotCategories = globalUpdate.gotCategories && checkCategory(c);
    }
    for (const a of data.articles.toArray()) {
      globalUpdate.gotArticles = globalUpdate.gotArticles && checkArticle(a);
    }
  },
  stateCheck() {
    if (!globalUpdate.gotUpdate) {
      console.log('ERROR: Didn\'t get global update message');
      return;
    }
    if (!globalUpdate.gotCategories) {
      console.log('ERROR: Issue with categories');
    }
    if (!globalUpdate.gotArticles) {
      console.log('ERROR: Issue with articles');
    }
    if (!globalUpdate.gotUsers) {
      console.log('ERROR: Issue with users or no users fetched');
    }
    if (!globalUpdate.gotDeferred) {
      console.log('ERROR: Didn\'t get deferred count');
    }
  },
};

export const systemUpdate = {
  gotUpdate: false,
  gotTags: false,
  gotTaggingSensitivities: false,
  gotRules: false,
  gotPreselects: false,
  notificationHandler(data: ISystemSummary) {
    console.log('Received system update message');
    systemUpdate.gotUpdate = true;
    systemUpdate.gotTags = data.tags.toArray().length > 0;
    systemUpdate.gotTaggingSensitivities = true;
    systemUpdate.gotRules = true;
    systemUpdate.gotPreselects = true;
    for (const t of data.tags.toArray()) {
      systemUpdate.gotTags = systemUpdate.gotTags && checkTag(t);
    }
    for (const t of data.taggingSensitivities.toArray()) {
      systemUpdate.gotTaggingSensitivities = systemUpdate.gotTaggingSensitivities && checkTaggingSensitivity(t);
    }
    for (const r of data.rules.toArray()) {
      systemUpdate.gotRules = systemUpdate.gotRules && checkRule(r);
    }
    for (const s of data.preselects.toArray()) {
      systemUpdate.gotPreselects = systemUpdate.gotPreselects && checkPreselect(s);
    }
  },
  stateCheck() {
    if (!systemUpdate.gotUpdate) {
      console.log('ERROR: Didn\'t get system update message');
      return;
    }
    if (!systemUpdate.gotTags) {
      console.log('ERROR: Issue with tags or no tags fetched');
    }
    if (!systemUpdate.gotTaggingSensitivities) {
      console.log('ERROR: Issue with tagging sensitivities');
    }
    if (!systemUpdate.gotRules) {
      console.log('ERROR: Issue with rules');
    }
    if (!systemUpdate.gotPreselects) {
      console.log('ERROR: Issue with preselects');
    }
  },
};

export const userUpdate = {
  gotUpdate: false,
  gotAssigned: false,
  notificationHandler(data: IUserSummary) {
    console.log('Received user update message');
    userUpdate.gotUpdate = true;
    userUpdate.gotAssigned = check.number(data.assignments);
  },
  stateCheck() {
    if (!userUpdate.gotUpdate) {
      console.log('ERROR: Didn\'t get system update message');
      return;
    }
    if (!userUpdate.gotAssigned) {
      console.log('ERROR: Didn\'t get assigned count');
    }
  },
};
