import React, { memo } from 'react';
import { t } from '@vikadata/widget-sdk';
import { black } from '@vikadata/components';
import { Strings } from '../../../utils';
import { BaseTableProps } from 'ali-react-table';

export function defaultEmptyContent(baseTableProps: BaseTableProps) {
  return memo(() => {
    return (
      <>
        <img 
          alt="empty-image" 
          src="//s1.vika.cn/space/2022/02/16/7f9dca59465c4ac8be91dbbf1ab4abad?attname=default_pivot.png" 
          style={{
            width: 160,
            height: 120
          }}
        />
        <div 
          style={{
            minWidth: 210,
            marginTop: 8,
            lineHeight: 1.5,
            color: black[1000]
          }}
        >
          {(baseTableProps?.columns.length === 1 && baseTableProps?.dataSource.length === 0) ? t(Strings.pivot_table_no_data) : t(Strings.pivot_table_filter_result_is_empty)}
        </div>
      </>
    );
  });
}