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

import { List, Set } from 'immutable';
import { createAction, handleActions } from 'redux-actions';
import { makeTypedFactory, TypedRecord} from 'typed-immutable-record';
import { IArticleModel, ICategoryModel, IUserModel } from '../../models';
import { IAppStateRecord, IThunkAction } from './index';

import { getLoadedArticleIds, getLoadedArticles } from '../scenes/Dashboard/components/DashboardArticles/store';
import { listRelationshipModels, updateCategoryAssignments, updateRelationshipModels } from '../util';

const STATE_ROOT = ['global', 'moderators'];
const MODERATORS_IS_READY = [...STATE_ROOT, 'isReady'];
const ARTICLE_MODERATOR_IDS_DATA = [...STATE_ROOT, 'articleModerators'];
const CATEGORY_MODERATOR_IDS_DATA = [...STATE_ROOT, 'categoryModerators'];
const ARTICLE_DATA = [...STATE_ROOT, 'article'];

type ILoadArticleStartPayload = IArticleModel;
export const loadArticleStart = createAction<ILoadArticleStartPayload>(
  'assign-moderators/LOAD_ARTICLE_START',
);

type ILoadCompletePayload = List<IUserModel>;
export const loadArticleComplete = createAction<ILoadCompletePayload>(
  'assign-moderators/LOAD_ARTICLE_COMPLETE',
);

type IAddRemoveModeratorPayload = {
  userId: string;
};
export const addModeratorToArticle = createAction<IAddRemoveModeratorPayload>(
  'assign-moderators/ADD_MODERATOR_TO_ARTICLE',
);
export const removeModeratorFromArticle = createAction<IAddRemoveModeratorPayload>(
  'assign-moderators/REMOVE_MODERATOR_FROM_ARTICLE',
);

type ILoadCategoryStartPayload = ICategoryModel;
export const loadCategoryStart = createAction<ILoadCategoryStartPayload>(
  'assign-moderators/LOAD_CATEGORY_START',
);

export const loadCategoryComplete = createAction<ILoadCompletePayload>(
  'assign-moderators/LOAD_CATEGORY_COMPLETE',
);

export const addModeratorToCategory = createAction<IAddRemoveModeratorPayload>(
  'assign-moderators/ADD_MODERATOR_TO_CATEGORY',
);

export const removeModeratorFromCategory = createAction<IAddRemoveModeratorPayload>(
  'assign-moderators/REMOVE_MODERATOR_FROM_CATEGORY',
);

export function loadArticleModerators(articleId: string): IThunkAction<void> {
  return async (dispatch) => {
    dispatch(loadArticleStart(articleId));

    const { models } = await listRelationshipModels<IUserModel>(
      'articles',
      articleId,
      'assignedModerators',
      {
        page: { limit: -1 },
      },
    );

    dispatch(loadArticleComplete(models));
  };
}

export function loadCategoryModerators(category: ICategoryModel): IThunkAction<Promise<void>> {
  return async (dispatch) => {
    await dispatch(loadCategoryStart(category));

    const { models } = await listRelationshipModels<IUserModel>(
      'categories',
      category.id,
      'assignedModerators',
      {
        page: { limit: -1 },
      },
    );

    await dispatch(loadCategoryComplete(models));
  };
}

export type ModelId = number | string;

export interface IModeratorsState {
  isReady: boolean;
  article: IArticleModel | null;
  category: ICategoryModel | null;
  articleModerators: Set<ModelId>;
  categoryModerators: Set<ModelId>;
}

export interface IModeratorsStateRecord extends TypedRecord<IModeratorsStateRecord>, IModeratorsState {}

const StateFactory = makeTypedFactory<IModeratorsState, IModeratorsStateRecord>({
  isReady: false,
  article: null,
  category: null,
  articleModerators: Set<ModelId>(),
  categoryModerators: Set<ModelId>(),
});

export const reducer = handleActions<
  IModeratorsStateRecord,
  ILoadArticleStartPayload   | // loadArticleStart
  ILoadCategoryStartPayload  | // loadCategoryStart
  ILoadCompletePayload       | // loadArticleComplete, loadCategoryComplete
  IAddRemoveModeratorPayload   // addModeratorToArticle, removeModeratorFromArticle, addModeratorToCategory, removeModeratorFromCategory
>({
  [loadArticleStart.toString()]: (state, { payload }: { payload: ILoadArticleStartPayload }) => (
    state
        .set('isReady', false)
        .set('article', payload)
  ),

  [loadArticleComplete.toString()]: (state, { payload }: { payload: ILoadCompletePayload }) => (
    state
        .set('isReady', true)
        .set('articleModerators', Set<ModelId>(payload.map((u) => u.id)))
  ),

  [addModeratorToArticle.toString()]: (state, { payload: { userId } }: { payload: IAddRemoveModeratorPayload }) => (
    state.update('articleModerators', (s: any) => s.add(userId))
  ),

  [removeModeratorFromArticle.toString()]: (state, { payload: { userId } }: { payload: IAddRemoveModeratorPayload }) => (
    state.update('articleModerators', (s: any) => s.delete(userId))
  ),

  [loadCategoryStart.toString()]: (state, { payload }: { payload: ILoadCategoryStartPayload }) => (
    state
        .set('isReady', false)
        .set('category', payload)
  ),

  [loadCategoryComplete.toString()]: (state, { payload }: { payload: ILoadCompletePayload}) => (
    state
        .set('isReady', true)
        .set('categoryModerators', Set<ModelId>(payload.map((u) => u.id)))
  ),

  [addModeratorToCategory.toString()]: (state, { payload: { userId } }: { payload: IAddRemoveModeratorPayload }) => (
    state.update('categoryModerators', (s: any) => s.add(userId))
  ),

  [removeModeratorFromCategory.toString()]: (state, { payload: { userId } }: { payload: IAddRemoveModeratorPayload }) => (
    state.update('categoryModerators', (s: any) => s.delete(userId))
  ),
}, StateFactory());

export function getArticleModeratorIds(state: IAppStateRecord): Set<string> {
  return state.getIn(ARTICLE_MODERATOR_IDS_DATA);
}

export function getCategoryModeratorIds(state: IAppStateRecord): Set<string> {
  return state.getIn(CATEGORY_MODERATOR_IDS_DATA);
}

export function getIsReady(state: IAppStateRecord): boolean {
  return state.getIn(MODERATORS_IS_READY);
}

export function getArticle(state: IAppStateRecord): IArticleModel {
  return state.getIn(ARTICLE_DATA);
}

type IUpdateArticleModeratorsStartPayload = {
  article: IArticleModel;
};
export const updateArticleModeratorsStart = createAction<IUpdateArticleModeratorsStartPayload>('dashboard/UPDATE_ARTICLE_MODERATORS_START');

type IUpdateArticleModeratorsCompletePayload = {
  article: IArticleModel;
  moderators: List<IUserModel>;
};
export const updateArticleModeratorsComplete = createAction<IUpdateArticleModeratorsCompletePayload>('dashboard/UPDATE_ARTICLE_MODERATORS_COMPLETE');

type IUpdateArticleModeratorsByIdCompletePayload = {
  moderators: List<IUserModel>;
};
export const updateArticleModeratorsById = createAction<IUpdateArticleModeratorsByIdCompletePayload>('dashboard/UPDATE_ARTICLE_MODERATORS_BY_ID_COMPLETE');

export function updateArticleModerators(article: IArticleModel, moderators: Array<IUserModel>): IThunkAction<Promise<void>> {
  return async (dispatch) => {
    await dispatch(updateArticleModeratorsStart({ article }));

    await updateRelationshipModels(
      'articles',
      article.id,
      'assignedModerators',
      moderators.map((u) => u.id),
    );

    await dispatch(updateArticleModeratorsComplete({ article, moderators }));
  };
}

export function updateArticleModeratorsByIds(moderatorIds: Array<string>, removedModeratorIds?: Array<string>): IThunkAction<Promise<void>> {
  return async (dispatch, getState) => {
    const state = getState();
    const users = state.getIn(['global', 'users', 'items']);
    const articleModerators = users.filter((u: IUserModel) => moderatorIds.some((id) => id === u.id));
    const articles = getLoadedArticles(state);
    articles.forEach((article) => {
      const existingModerators = (removedModeratorIds && article.assignedModerators) ?
          article.assignedModerators.filter((user) => !removedModeratorIds.some((id) => id === user.id)) :
          article.assignedModerators;
      dispatch(updateArticleModeratorsComplete({ article, moderators: [...existingModerators, ...articleModerators] }));
    });
    articles.forEach((article) => dispatch(loadArticleModerators(article.id)));
  };
}

type IUpdateCategoryModeratorsStartPayload = {
  category: ICategoryModel;
};
export const updateCategoryModeratorsStart = createAction<IUpdateCategoryModeratorsStartPayload>('dashboard/UPDATE_CATEGORY_MODERATORS_START');

type IUpdateCategoryModeratorsCompletePayload = {
  category: ICategoryModel;
  moderators: List<IUserModel>;
};
export const updateCategoryModeratorsComplete = createAction<IUpdateCategoryModeratorsCompletePayload>('dashboard/UPDATE_CATEGORY_MODERATORS_COMPLETE');

export function updateCategoryModerators(category: ICategoryModel, moderators: Array<IUserModel>): IThunkAction<Promise<void>> {
  return async (dispatch, getState) => {
    await dispatch(updateCategoryModeratorsStart({ category }));
    const moderatorIds = moderators.length > 0 ? moderators.map((u) => u.id) : [];
    const removedModeratorIds = getCategoryModeratorIds(getState())
        .toArray().filter((id) => !moderatorIds.some((modId) => modId === id));

    // tslint:disable-next-line:radix
    if (typeof(parseInt(category.id)) === 'number') {
      // post to service that adds/removes moderators to all articles for the category
      await updateCategoryAssignments(category.id, moderatorIds);
      // Go update state for the articles.
      await dispatch(updateArticleModeratorsByIds(moderatorIds, removedModeratorIds));
      const articles = getLoadedArticleIds(getState());
      articles.forEach((article) => dispatch(loadArticleModerators(article)));
    }
    await dispatch(updateCategoryModeratorsComplete({ category, moderators }));
  };
}
