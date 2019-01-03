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
import PropTypes from 'prop-types';
import { css } from '../../utilx';

const defaultSize = '24';

export interface IIconBaseProps extends React.Props<any> {
  size: string | number;
  style: any;
}

const IconBase: React.StatelessComponent<any> = (
  props: IIconBaseProps,
  { reactIconBase },
) => {
  const { children, size, style, ...remainingProps } = props;

  const computedSize = size ? size :
                       (reactIconBase && reactIconBase.size || defaultSize);
  const computedStyle = {
    ...style,
    verticalAlign: 'middle',
    ...(reactIconBase ? (reactIconBase.style || {}) : {}),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      preserveAspectRatio="xMidYMid meet"
      height={computedSize}
      width={computedSize}
      {...reactIconBase}
      {...remainingProps}
      {...css(computedStyle)}
    >
      {children}
    </svg>
  );
};

IconBase.contextTypes = {
  reactIconBase: PropTypes.object,
};

export { IconBase };
