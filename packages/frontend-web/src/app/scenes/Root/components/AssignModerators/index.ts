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

import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { IUserModel } from '../../../../../models';
import { getMyUserId } from '../../../../auth';
import { IAppDispatch, IAppStateRecord } from '../../../../stores';
import {
  addModeratorToArticle,
  addModeratorToCategory,
  getArticleModeratorIds,
  getCategoryModeratorIds,
  getIsReady,
  removeModeratorFromArticle,
  removeModeratorFromCategory,
} from '../../../../stores/moderators';
import { getUsers } from '../../../../stores/users';
import {
  AssignModerators as PureAssignModerators,
  IAssignModeratorsProps,
} from './AssignModerators';

function getIsModeratedUser(state: IAppStateRecord, userId: string): boolean {
  if (getArticleModeratorIds(state)) {
    return getArticleModeratorIds(state).includes(userId);
  }
  if (getArticleModeratorIds(state)) {
    return getCategoryModeratorIds(state).includes(userId);
  }
}

type IAssignModeratorsOwnProps = Pick<
  IAssignModeratorsProps,
  'article' |
  'category' |
  'label' |
  'onClickDone' |
  'onClickClose'
>;

type IAssignModeratorsStateProps = Pick<
  IAssignModeratorsProps,
  'users' |
  'moderatorIds' |
  'isReady'
>;

type IAssignModeratorsDispatchProps = Pick<
  IAssignModeratorsProps,
  'onAddModerator' |
  'onRemoveModerator'
>;

function getSortedUsers (state: IAppStateRecord): Array<IUserModel> {
  const userId = getMyUserId(state);
  const allUsers = getUsers(state);
  const currentUser = [];
  const assignedUsers = [];
  const unassignedUsers = [];

  for (const u of allUsers.toArray()) {
    if (u.id === userId) {
      currentUser.push(u);
    }
    else if (getIsModeratedUser(state, u.id)) {
      assignedUsers.push(u);
    }
    else {
      unassignedUsers.push(u);
    }
  }

  const assignedUsersSorted = assignedUsers.sort((a, b) => a.name.localeCompare(b.name));
  const unassignedUsersSorted = unassignedUsers.sort((a, b) => a.name.localeCompare(b.name));

  return [...currentUser, ...assignedUsersSorted, ...unassignedUsersSorted];
}

const mapStateToProps = createStructuredSelector({
  users: getSortedUsers,

  moderatorIds: (state: IAppStateRecord, { article }: any) => (
    article
      ? getArticleModeratorIds(state)
      : getCategoryModeratorIds(state)
  ),

  isReady: getIsReady,
}) as (state: IAppStateRecord, ownProps: IAssignModeratorsOwnProps) => IAssignModeratorsStateProps;

function mapDispatchToProps(dispatch: IAppDispatch, { article, category }: IAssignModeratorsOwnProps): IAssignModeratorsDispatchProps {
  return {
    onAddModerator: (userId: string) => {
      if (article) {
        dispatch(addModeratorToArticle({ userId }));
      }
      if (category) {
        dispatch(addModeratorToCategory({ userId }));
      }
    },

    onRemoveModerator: (userId: string) => {
      if (article) {
        dispatch(removeModeratorFromArticle({ userId }));
      }
      if (category) {
        dispatch(removeModeratorFromCategory({ userId }));
      }
    },
  };
}

export const AssignModerators: React.ComponentClass<IAssignModeratorsProps> = connect<IAssignModeratorsStateProps, IAssignModeratorsDispatchProps, IAssignModeratorsOwnProps>(
  mapStateToProps,
  mapDispatchToProps,
)(PureAssignModerators);

const mapStateToPropsSimple = createStructuredSelector({
  users: getSortedUsers,
  isReady: () => true,
}) as (state: IAppStateRecord, ownProps: IAssignModeratorsOwnProps) => IAssignModeratorsStateProps;

export const AssignModeratorsSimple: React.ComponentClass<IAssignModeratorsProps> = connect<IAssignModeratorsStateProps, IAssignModeratorsDispatchProps, IAssignModeratorsOwnProps>(
  mapStateToPropsSimple,
)(PureAssignModerators);
