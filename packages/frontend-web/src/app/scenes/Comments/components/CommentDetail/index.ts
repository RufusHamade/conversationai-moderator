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

import { Set } from 'immutable';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { provideHooks } from 'redial';
import { createStructuredSelector } from 'reselect';
import {
  ICommentModel,
  ICommentScoreModel,
} from '../../../../../models';
import { IConfirmationAction, IRedialLocals } from '../../../../../types';
import { getCurrentUser } from '../../../../auth';
import { IAppDispatch, IAppState, IAppStateRecord } from '../../../../stores';
import {
  approveComments,
  confirmCommentScore,
  confirmCommentSummaryScore,
  deferComments,
  deleteCommentTag,
  highlightComments,
  rejectComments,
  rejectCommentScore,
  rejectCommentSummaryScore,
  resetComments,
  resetCommentScore,
  tagComments,
  tagCommentsAnnotation,
  tagCommentSummaryScores,
} from '../../../../stores/commentActions';
import { updateComment as updateCommentState } from '../../../../stores/comments';
import {
  getSummaryScoresById,
  loadCommentSummaryScores,
} from '../../../../stores/commentSummaryScores';
import { loadTaggingSensitivities } from '../../../../stores/taggingSensitivities';
import { getTaggableTags, getTags, loadTags } from '../../../../stores/tags';
import { getUserById } from '../../../../stores/users';
import {
  adjustTabCount,
  getArticle,
  getSummaryScoresAboveThreshold,
  getSummaryScoresBelowThreshold,
  loadArticle,
} from '../../store';
import { updateCommentStateAction } from '../ModeratedComments/store';
import { CommentDetail as PureCommentDetail, ICommentDetailProps } from './CommentDetail';
import {
  addCommentScore,
  getAuthorCountsById,
  getComment,
  getCurrentCommentIndex,
  getFlags,
  getIsLoading,
  getNextCommentId,
  getPagingIsFromBatch,
  getPagingLink,
  getPagingSource,
  getPreviousCommentId,
  getReducedScoresAboveThreshold,
  getReducedScoresBelowThreshold,
  getScores,
  getScoresAboveThreshold,
  getTaggingSensitivitiesInCategory,
  getTaggingSensitivityForTag,
  loadComment,
  loadFlags,
  loadScores,
  removeCommentScore,
  updateComment,
  updateCommentScore,
} from './store';

export { reducer, storeCommentPagingOptions } from './store';

// In case we move the router-related actions into here.
// type ICommentDetailRouterProps = Pick<
//   ICommentDetailProps,
//   'router' | 'params' | 'location'
// >;

type ICommentDetailOwnProps = {
  categoryId: string;
  params: {
    commentId: string;
  };
};

type ICommentDetailStateProps = Pick<
  ICommentDetailProps,
  'comment' |
  'isLoading' |
  'availableTags' |
  'allScores' |
  'allScoresAboveThreshold' |
  'reducedScoresAboveThreshold' |
  'reducedScoresBelowThreshold' |
  'summaryScores' |
  'summaryScoresAboveThreshold' |
  'summaryScoresBelowThreshold' |
  'getTagIdsAboveThresholdByCommentId' |
  'getThresholdForTag' |
  'currentCommentIndex' |
  'nextCommentId' |
  'previousCommentId' |
  'detailSource' |
  'isFromBatch' |
  'authorCountById' |
  'getUserById' |
  'currentUser' |
  'flags'
>;

type ICommentDetailDispatchProps = Pick<
  ICommentDetailProps,
  'loadFlags' |
  'loadScores' |
  'onUpdateComment' |
  'onUpdateCommentScore' |
  'onConfirmCommentScore' |
  'onRejectCommentScore' |
  'onResetCommentScore' |
  'onAddCommentScore' |
  'onRemoveCommentScore' |
  'onTagComment' |
  'tagCommentSummaryScore' |
  'confirmCommentSummaryScore' |
  'rejectCommentSummaryScore' |
  'onCommentAction' |
  'onAnnotateComment' |
  'onDeleteCommentTag' |
  'onModerateStatusChange'
>;

const AVAILABLE_ACTIONS: {
  [key: string]: (ids: Array<string>, userId: string) => any;
} = {
  highlight: highlightComments,
  approve: approveComments,
  defer: deferComments,
  reject: rejectComments,
  reset: resetComments,
};

const mapStateToProps = createStructuredSelector({
  comment: getComment,

  isLoading: getIsLoading,

  allTags: getTags,

  availableTags: getTaggableTags,

  flags: (state: IAppState) => getFlags(state),

  allScores: (state: IAppState) => getScores(state),

  allScoresAboveThreshold: (state: IAppState, ownProps: ICommentDetailOwnProps) => (
      getScoresAboveThreshold(getTaggingSensitivitiesInCategory(state, ownProps.categoryId), getScores(state))),

  reducedScoresAboveThreshold: (state: IAppStateRecord, ownProps: ICommentDetailOwnProps) =>
      getReducedScoresAboveThreshold(getTaggingSensitivitiesInCategory(state, ownProps.categoryId), getScores(state)),

  reducedScoresBelowThreshold: (state: IAppStateRecord, ownProps: ICommentDetailOwnProps) =>
      getReducedScoresBelowThreshold(getTaggingSensitivitiesInCategory(state, ownProps.categoryId), getScores(state)),

  getThresholdForTag: (state: IAppStateRecord, ownProps: ICommentDetailOwnProps) => (score: ICommentScoreModel) =>
      getTaggingSensitivityForTag(getTaggingSensitivitiesInCategory(state, ownProps.categoryId), score),

  summaryScoresAboveThreshold: (state: IAppStateRecord, ownProps: ICommentDetailOwnProps) => {
    const article = getArticle(state);

    return getSummaryScoresAboveThreshold(
      getTaggingSensitivitiesInCategory(state, article.getIn(['category', 'id'])),
      getSummaryScoresById(state, ownProps.params.commentId),
    );
  },

  summaryScoresBelowThreshold: (state: IAppStateRecord, ownProps: ICommentDetailOwnProps) => {
    const article = getArticle(state);

    return getSummaryScoresBelowThreshold(
      getTaggingSensitivitiesInCategory(state, article.getIn(['category', 'id'])),
      getSummaryScoresById(state, ownProps.params.commentId),
    );
  },

  summaryScores: (state: IAppStateRecord, ownProps: ICommentDetailOwnProps) => {
    if (!ownProps.params.commentId) {
      return;
    }

    return getSummaryScoresById(state, ownProps.params.commentId);
  },

  getTagIdsAboveThresholdByCommentId: (state: IAppStateRecord, ownProps: ICommentDetailOwnProps) => (id: string): Set<string> => {
    if (!id || !getSummaryScoresById(state, id)) {
      return;
    }

    return getSummaryScoresAboveThreshold(
      getTaggingSensitivitiesInCategory(state, ownProps.categoryId),
      getSummaryScoresById(state, id),
    ).map((score) => score.tagId).toSet();
  },

  currentCommentIndex: (state: IAppStateRecord, { params: { commentId }, location: { query: { pagingIdentifier } } }: any) => {
    // const parsedCommentId = parseInt(commentId, 10);

    return getCurrentCommentIndex(state, pagingIdentifier, commentId);
  },

  nextCommentId: (state: IAppStateRecord, { params: { commentId }, location: { query: { pagingIdentifier } } }: any) => {
    // const parsedCommentId = parseInt(commentId, 10);

    return getNextCommentId(state, pagingIdentifier, commentId);
  },

  previousCommentId: (state: IAppStateRecord, { params: { commentId }, location: { query: { pagingIdentifier } } }: any) => {
    // const parsedCommentId = parseInt(commentId, 10);

    return getPreviousCommentId(state, pagingIdentifier, commentId);
  },

  detailSource: (state: IAppStateRecord, { location: { query: { pagingIdentifier } } }: any) => {
    return getPagingSource(state, pagingIdentifier);
  },

  linkBackToList: (state: IAppStateRecord, { location: { query: { pagingIdentifier } } }: any) => {
    return getPagingLink(state, pagingIdentifier);
  },

  isFromBatch: getPagingIsFromBatch,

  authorCountById: (state: IAppStateRecord) => (id: string) => getAuthorCountsById(state, id),

  getUserById: (state: IAppStateRecord) => (userId: string) => getUserById(state, userId),

  currentUser: getCurrentUser,
}) as (state: IAppState, ownProps: ICommentDetailOwnProps) => ICommentDetailStateProps;

function mapDispatchToProps(dispatch: IAppDispatch): ICommentDetailDispatchProps {
  return {
    loadFlags: (commentId: string) => (
      dispatch(loadFlags(commentId))
    ),

    loadScores: (commentId: string) => (
      dispatch(loadScores(commentId))
    ),

    onUpdateCommentScore: (commentScore: ICommentScoreModel) => (
      dispatch(updateCommentScore(commentScore))
    ),

    onConfirmCommentScore: (commentid: string, commentScoreId: string) => (
      dispatch(confirmCommentScore(commentid, commentScoreId))
    ),

    onRejectCommentScore: (commentid: string, commentScoreId: string) => (
      dispatch(rejectCommentScore(commentid, commentScoreId))
    ),

    onResetCommentScore: (commentid: string, commentScoreId: string) => (
      dispatch(resetCommentScore(commentid, commentScoreId))
    ),

    onUpdateComment: (comment: ICommentModel) => {
      return Promise.all([
        dispatch(updateComment(comment)),
        dispatch(updateCommentState(comment)),
      ]); },

    onAddCommentScore: (commentScore: ICommentScoreModel) => (
      dispatch(addCommentScore(commentScore))
    ),

    onRemoveCommentScore: (commentScore: ICommentScoreModel) => (
      dispatch(removeCommentScore(commentScore))
    ),

    onTagComment: (ids: Array<string>, tagId: string, userId: string) => (
        dispatch(tagComments(ids, tagId, userId))
    ),

    tagCommentSummaryScore: (ids: Array<string>, tagId: string, userId: string) =>
        dispatch(tagCommentSummaryScores(ids, tagId, userId)),

    confirmCommentSummaryScore: (id: string, tagId: string, userId: string) =>
        dispatch(confirmCommentSummaryScore(id, tagId, userId)),

    rejectCommentSummaryScore: (id: string, tagId: string, userId: string) =>
        dispatch(rejectCommentSummaryScore(id, tagId, userId)),

    onCommentAction: (action: IConfirmationAction, idsToDispatch: Array<string>, userId: string) => {
        dispatch(AVAILABLE_ACTIONS[action](idsToDispatch, userId));
        // Also update moderated state
        dispatch(updateCommentStateAction[action](idsToDispatch));
    },

    onAnnotateComment: (id: string, tagId: string, start: number, end: number) => (
      dispatch(tagCommentsAnnotation(id, tagId, start, end))
    ),

    onDeleteCommentTag: (id: string, commentScoreId: string) => (
      dispatch(deleteCommentTag(id, commentScoreId))
    ),

    onModerateStatusChange: (shouldResetStatus: boolean) => (
      Promise.all([
        dispatch(adjustTabCount({
          field: 'unmoderated',
          amount: shouldResetStatus ? 1 : -1,
        })),
        dispatch(adjustTabCount({
          field: 'moderated',
          amount: shouldResetStatus ? -1 : 1,
        })),
      ])
    ),
  };
}

// TODO (Issue#27): Fix type
function mergeProps(
  stateProps: ICommentDetailStateProps,
  dispatchProps: ICommentDetailDispatchProps,
  ownProps: ICommentDetailOwnProps,
): any {
  return {
      ...ownProps,
      ...stateProps,
      ...dispatchProps,
      onCommentAction: (action: IConfirmationAction, idsToDispatch: Array<string>) =>
          dispatchProps.onCommentAction(action, idsToDispatch, stateProps.currentUser.id),
      onTagComment: (ids: Array<string>, tagId: string) =>
          dispatchProps.onTagComment(ids, tagId, stateProps.currentUser.id),
      tagCommentSummaryScore: (ids: Array<string>, tagId: string) =>
          dispatchProps.tagCommentSummaryScore(ids, tagId, stateProps.currentUser.id),
      confirmCommentSummaryScore: (id: string, tagId: string) =>
          dispatchProps.confirmCommentSummaryScore(id, tagId, stateProps.currentUser.id),
      rejectCommentSummaryScore: (id: string, tagId: string) =>
          dispatchProps.rejectCommentSummaryScore(id, tagId, stateProps.currentUser.id),
  };
}

// Manually wrapping without `compose` so types stay correct.

// Add Route Change hook.
const HookedCommentDetail = provideHooks<IRedialLocals>({
  fetch: ({ dispatch, params: { articleId, commentId } }) => {
    if (articleId) {
      dispatch(loadArticle(articleId));
    }

    return Promise.all([
      dispatch(loadComment(commentId)),
      dispatch(loadFlags(commentId)),
      dispatch(loadScores(commentId)),
      dispatch(loadTags()),
      dispatch(loadTaggingSensitivities()),
      dispatch(loadCommentSummaryScores(commentId)),
    ]);
  },
})(PureCommentDetail);

// Add Redux data.
const ConnectedCommentDetail = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(HookedCommentDetail);

// Add `router` prop.
export const CommentDetail: React.ComponentClass = withRouter(ConnectedCommentDetail);
