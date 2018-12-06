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

import {
  GUTTER_DEFAULT_SPACING,
  HEADER_HEIGHT,
  INPUT_DROP_SHADOW,
  NICE_BLUE_GREY,
  NICE_LIGHT_BLUE,
  NICE_MIDDLE_BLUE,
  PALE_COLOR,
} from '../../styles';
import { stylesheet } from '../../util';

export const IMAGE_BASE = 40;

export const big = {
  width: `${IMAGE_BASE}px`,
  height: `${IMAGE_BASE}px`,
};

export const medium = {
  width: `${IMAGE_BASE * 3 / 4}px`,
  height: `${IMAGE_BASE * 3 / 4}px`,
};

export const small = {
  width: `${IMAGE_BASE / 2}px`,
  height: `${IMAGE_BASE / 2}px`,
};

export const flexCenter = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const ARTICLE_TABLE_STYLES = stylesheet({
  dataTable: {
    borderSpacing: 0,
    width: '100%',
  },
  dataHeader: {
    color: NICE_LIGHT_BLUE,
    backgroundColor: NICE_MIDDLE_BLUE,
    fontSize: 'smaller',
  },
  dataBody: {
    background: 'white',
  },
  headerCell: {
    height: `${HEADER_HEIGHT}px`,
  },
  dataCell: {
    borderBottom: `1px solid ${NICE_BLUE_GREY}`,
    height: `${HEADER_HEIGHT}px`,
    fontSize: '18px',
  },
  iconCell: {
    width: `${HEADER_HEIGHT}px`,
    minHeight: `${HEADER_HEIGHT}px`,
    textAlign: 'center',
  },
  textCell: {
    textAlign: 'left',
    paddingLeft: '10px',
  },
  numberCell: {
    textAlign: 'right',
    width: '80px',
    paddingRight: '10px',
  },
  timeCell: {
    textAlign: 'right',
    width: '100px',
    paddingRight: '20px',
  },
  categoryLabel: {
    textTransform: 'uppercase',
    fontSize: '12px',
    marginRight: '8px',
  },
  dateLabel: {
    opacity: '0.5',
    fontSize: '12px',
  },

  select: {
    width: 'auto',
    height: '36px',
    paddingLeft: `${GUTTER_DEFAULT_SPACING / 2}px`,
    paddingRight: `${GUTTER_DEFAULT_SPACING}px`,
    border: 'none',
    borderRadius: 2,
    boxShadow: INPUT_DROP_SHADOW,
    backgroundColor: PALE_COLOR,
    fontSize: '16px',
  },

});

export const COMMON_STYLES = stylesheet({
  cellLink: {
    color: 'inherit',
    ':hover': {
      textDecoration: 'underline',
    },
  },
  smallIcon: {
    width: `${IMAGE_BASE + 6}px`,
    height: `${IMAGE_BASE + 6}px`,
  },
  xsmallIcon: {
    width: `${IMAGE_BASE / 2 + 3}px`,
    height: `${IMAGE_BASE / 2 + 3}px`,
  },
  smallImage: {
    width: `${IMAGE_BASE}px`,
    height: `${IMAGE_BASE}px`,
    borderRadius: `${(IMAGE_BASE / 2)}px`,
  },
  xsmallImage: {
    width: `${IMAGE_BASE / 2}px`,
    height: `${IMAGE_BASE / 2}px`,
    borderRadius: `${IMAGE_BASE / 4}px`,
  },
  textCenterSmall: {
    ...small,
    fontSize: '12px',
    ...flexCenter,
  },
});

export const ICON_STYLES = stylesheet({
  big: big,
  small: small,

  iconCenter: {
    width: `100%`,
    height: `100%`,
    ...flexCenter,
  },

  iconBackgroundCircle: {
    ...big,
    borderRadius: `${IMAGE_BASE}px`,
    backgroundColor: '#eee',
    display: 'inline-block',
  },

  iconBackgroundCircleSmall: {
    ...small,
    borderRadius: `${IMAGE_BASE / 2}px`,
    backgroundColor: '#eee',
    display: 'inline-block',
  },
});
