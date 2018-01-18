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

import React from 'react';
const FocusTrap = require('focus-trap-react');
import { autobind } from 'core-decorators';
import { List } from 'immutable';
import keyboardJS from 'keyboardjs';
import { IArticleModel, ICategoryModel, IUserModel } from '../../../models';
import {
  Header,
  HomeIcon,
  Link,
  NavigationTab,
  Scrim,
} from '../../components';
import { IAppDispatch } from '../../stores';
import { loadArticleModerators, updateArticleModerators } from '../../stores/moderators';
import {
  clearReturnSavedCommentRow,
} from '../../util';
import { css, identity, stylesheet } from '../../util';
import { AssignModerators } from '../Root/components/AssignModerators';
import { ArticlePreview } from './components/ArticlePreview';

import {
  ARTICLE_HEADER,
  GUTTER_DEFAULT_SPACING,
  HEADER_HEIGHT,
  MEDIUM_COLOR,
  SCRIM_STYLE,
  WHITE_COLOR,
} from '../../styles';

const ASSIGN_MODERATORS_POPUP_ID = 'assign-moderators';

const STYLES = stylesheet({
  main: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  homeButton: {
    marginLeft: `${GUTTER_DEFAULT_SPACING}px`,
    marginRight: `${GUTTER_DEFAULT_SPACING}px`,
    borderBottom: `2px solid transparent`,
    ':focus': {
      outline: 0,
    },
  },
  articleTitle: {
    borderBottom: `2px solid transparent`,
    ':focus': {
      outline: 0,
      borderBottom: `2px solid ${WHITE_COLOR}`,
    },
  },
  articleLinkActive: {
    borderBottom: `2px solid ${MEDIUM_COLOR}`,
    ':focus': {
      outline: 0,
      borderBottom: `2px solid ${WHITE_COLOR}`,
    },
  },
  articleLink: {
    borderBottom: `2px solid transparent`,
    ':focus': {
      outline: 0,
      borderBottom: `2px solid ${WHITE_COLOR}`,
    },
  },
});

const makeTab = (router: any, url: string, label: string, count: number) => (
  <Link
    to={url}
    {...css(
      ARTICLE_HEADER.link,
      router.isActive(url) ? STYLES.articleLinkActive : STYLES.articleLink,
    )}
    key={label}
  >
    <NavigationTab
      label={label}
      count={count}
      {...css(
        ARTICLE_HEADER.tab,
        (router.isActive(url) && { backgroundColor: MEDIUM_COLOR }),
      )}
    />
  </Link>
);

export interface ICommentsProps extends React.Props<any> {
  dispatch?: IAppDispatch;
  article?: IArticleModel;
  category?: ICategoryModel;
  router: any;
  moderators?: List<IUserModel>;
  isArticleDetail: boolean;
  isCommentDetail: boolean;
  hideCommentHeader: boolean;
  unmoderatedCount: number;
  moderatedCount: number;
}

export interface ICommentsState {
  isPreviewModalVisible?: boolean;
  isModeratorModalVisible?: boolean;
  homeIsFocused?: boolean;
}

export class Comments extends React.Component<ICommentsProps, ICommentsState> {
  state: ICommentsState = {
    isPreviewModalVisible: false,
    isModeratorModalVisible: false,
    homeIsFocused: false,
  };

  componentDidMount() {
    keyboardJS.bind('escape', this.onCloseClick);
  }

  componentWillUnmount() {
    keyboardJS.unbind('escape', this.onCloseClick);
  }

  @autobind
  onFocusHomeIcon() {
    this.setState({ homeIsFocused: true });
  }

  @autobind
  onBlurHomeIcon() {
    this.setState({ homeIsFocused: false });
  }

  render() {
    const {
      article,
      category,
      children,
      router,
      moderators,
      isArticleDetail,
      isCommentDetail,
      hideCommentHeader,
      unmoderatedCount,
      moderatedCount,
    } = this.props;

    const { isPreviewModalVisible, isModeratorModalVisible, homeIsFocused } = this.state;

    const links = isArticleDetail
        ? [
            makeTab(router, `/articles/${article.id}/new`, 'New', unmoderatedCount),
            makeTab(router, `/articles/${article.id}/moderated`, 'Moderated', moderatedCount),
          ]
        : [
            makeTab(
              router,
              `/categories/${category ? category.id : 'all'}/new`,
              'New',
              unmoderatedCount,
            ),
          ];

    return (
      <div {...css({height: '100%'})}>
        { isArticleDetail && (
          <Scrim
            key="articlePreviewScrim"
            scrimStyles={ARTICLE_HEADER.articlePreviewScrim}
            wrapperStyles={ARTICLE_HEADER.articlePreviewWrapper}
            isVisible={isPreviewModalVisible}
            onBackgroundClick={this.onCloseClick}
          >
            <FocusTrap
              focusTrapOptions={{
                clickOutsideDeactivates: true,
              }}
            >
              <ArticlePreview
                isCommentDetail={isCommentDetail}
                article={article}
                moderators={moderators}
                onAddModeratorClick={this.onAddModeratorClick}
                onClose={this.onCloseClick}
              />
            </FocusTrap>
            <Scrim
              key="moderatorAssignmentScrim"
              scrimStyles={SCRIM_STYLE.scrim}
              isVisible={isModeratorModalVisible}
              onBackgroundClick={this.closeModeratorAssignmentModal}
            >
              <FocusTrap
                focusTrapOptions={{
                  clickOutsideDeactivates: true,
                }}
              >
                <div
                  key="AssignModeratorsContainer"
                  id={ASSIGN_MODERATORS_POPUP_ID}
                  {...css(
                    SCRIM_STYLE.popup, {position: 'relative', paddingRight: 0},
                  )}
                >

                  {/* moderatorAssignmentArticle */}
                  <AssignModerators
                    label="Assign a moderator"
                    article={article}
                    onClickDone={this.saveModeratorAssignmentModal}
                    onClickClose={this.closeModeratorAssignmentModal}
                  />
                </div>
              </FocusTrap>
            </Scrim>
          </Scrim>
        )}

        <div {...css(STYLES.main)}>
          { !hideCommentHeader && (
            <Header onSearchClick={this.onSearchClick} onAuthorSearchClick={this.onAuthorSearchClick}>
              <div {...css(ARTICLE_HEADER.header)}>
                <div {...css(ARTICLE_HEADER.meta)}>
                  <Link
                    {...css(ARTICLE_HEADER.link, STYLES.homeButton)}
                    key="Home"
                    onFocus={this.onFocusHomeIcon}
                    onBlur={this.onBlurHomeIcon}
                    to="/"
                    onClick={isCommentDetail ? identity : this.handleBackButtonClick}
                    aria-label="Home"
                  >
                    <HomeIcon
                      {...css({
                        fill: WHITE_COLOR, borderBottom: '2px solid transparent' },
                        homeIsFocused && { borderBottom: '2px solid white' })
                      }
                      size={24}
                    />
                  </Link>
                  { isArticleDetail ? (
                    <h1
                      {...css(ARTICLE_HEADER.title, ARTICLE_HEADER.titleLink, STYLES.articleTitle)}
                      tabIndex={0}
                      onClick={this.onOpenClick}
                    >
                      {article.title}
                    </h1>
                  ) : (
                    <h1 {...css(ARTICLE_HEADER.title)}>{category ? category.label : 'All Comments'}</h1>
                  )}
                </div>
                <div {...css(ARTICLE_HEADER.tabs)}>
                  {links}
                </div>
              </div>
            </Header>
          )}

          <div
            {...css({
              background: WHITE_COLOR,
              height: hideCommentHeader ? '100%' : `calc(100% - ${HEADER_HEIGHT}px)`,
              position: 'relative',
              overflow: 'hidden',
              WebkitOverflowScrolling: 'touch',
            })}
          >
            {children}
          </div>
        </div>
      </div>
    );
  }

  @autobind
  handleBackButtonClick() {
    clearReturnSavedCommentRow();
  }

  @autobind
  onSearchClick() {
    const searchPath = this.props.article ?
        `/search?articleId=${this.props.article.id}` :
        `/search`;
    this.props.router.push(searchPath);
  }

  @autobind
  onAuthorSearchClick() {
    this.props.router.push('/search?searchByAuthor=true');
  }

  @autobind
  onOpenClick() {
    this.setState({ isPreviewModalVisible: true });
  }

  @autobind
  onCloseClick() {
    this.setState({ isPreviewModalVisible: false });
  }

  @autobind
  async onAddModeratorClick() {
    await this.props.dispatch(loadArticleModerators(this.props.article.id));

    this.setState({ isModeratorModalVisible: true });
  }

  @autobind
  closeModeratorAssignmentModal() {
    this.setState({ isModeratorModalVisible: false });
  }

  @autobind
  saveModeratorAssignmentModal(article: IArticleModel, moderators: Array<IUserModel>) {
    this.props.dispatch(updateArticleModerators(article, moderators));

    this.closeModeratorAssignmentModal();
  }

}
