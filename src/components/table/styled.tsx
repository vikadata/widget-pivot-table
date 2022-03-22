import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { black, blackBlue } from '@vikadata/components';
import { BaseTable, BaseTableProps } from 'ali-react-table';

const ThemeBaseTable: any = styled(BaseTable)`
  &.vikaTable {
    --header-color: ${black[1000]};
    --header-bgcolor: ${black[100]};
    --header-hover-bgcolor: ${blackBlue[100]};
    --hover-bgcolor: ${blackBlue[100]};
    --border-color: ${black[200]};
    --font-size: 13px;
    user-select: none;
  }
  .art-table-header-cell {
    font-weight: bold;
  }
`;

export const CustomBaseTable = React.forwardRef<BaseTable, BaseTableProps>((props, ref) => {
  return <ThemeBaseTable ref={ref} className={cx({ vikaTable: true })} {...props} />;
});