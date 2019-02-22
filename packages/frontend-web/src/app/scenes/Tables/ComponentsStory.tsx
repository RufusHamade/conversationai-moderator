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

import { storiesOf } from '@storybook/react';
import faker from 'faker';
import React from 'react';

import { fakeArticleModel, fakeCategoryModel } from '../../../models/fake';
import { css } from '../../utilx';
import {SimpleTitleCell, TitleCell} from './components';
import { ARTICLE_TABLE_STYLES } from './styles';

faker.seed(456);

const category = fakeCategoryModel({label: 'ChuChu TV Nursery Rhymes & Kids Songs', unmoderatedCount: 2});
const category2 = fakeCategoryModel({label: 'World', unmoderatedCount: 2});

const article1 = fakeArticleModel({
  title: 'IMF chief Christine Lagarde warns Britain on Brexit: ‘It will never be as good as it is now’',
  category: category,
});
const article2 = fakeArticleModel({
  category: null,
  url: null,
});
const article3 = fakeArticleModel({
  category: category2,
  sourceCreatedAt: null,
  url: null,
});
const article4 = fakeArticleModel({
  category: null,
  sourceCreatedAt: null,
});

storiesOf('TableComponents', module)
  .add('Title cell', () => {
    return (
      <table {...css(ARTICLE_TABLE_STYLES.dataTable)} style={{maxWidth: '500px'}}>
        <tr {...css(ARTICLE_TABLE_STYLES.dataBody)}>
          <td {...css(ARTICLE_TABLE_STYLES.summaryCell, ARTICLE_TABLE_STYLES.textCell)}>
            <SimpleTitleCell article={article2} link={'#'}/>
          </td>
        </tr>
        <tr {...css(ARTICLE_TABLE_STYLES.dataBody)}>
          <td {...css(ARTICLE_TABLE_STYLES.dataCell, ARTICLE_TABLE_STYLES.textCell)}>
            <TitleCell article={article1} link={'#'}/>
          </td>
        </tr>
        <tr {...css(ARTICLE_TABLE_STYLES.dataBody)}>
          <td {...css(ARTICLE_TABLE_STYLES.dataCell, ARTICLE_TABLE_STYLES.textCell)}>
            <TitleCell article={article2} link={'#'}/>
          </td>
        </tr>
        <tr {...css(ARTICLE_TABLE_STYLES.dataBody)}>
          <td {...css(ARTICLE_TABLE_STYLES.dataCell, ARTICLE_TABLE_STYLES.textCell)}>
            <TitleCell article={article3} link={'#'}/>
          </td>
        </tr>
        <tr {...css(ARTICLE_TABLE_STYLES.dataBody)}>
          <td {...css(ARTICLE_TABLE_STYLES.dataCell, ARTICLE_TABLE_STYLES.textCell)}>
            <TitleCell article={article4} link={'#'}/>
          </td>
        </tr>
      </table>
    );
  });