import React, { memo } from 'react';
import { t } from '@vikadata/widget-sdk';
import { black } from '@vikadata/components';
import { Strings } from '../../../utils';

export const DefaultEmptyContent = memo(() => {
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
        {t(Strings.pivot_table_no_data)}
      </div>
    </>
  );
});