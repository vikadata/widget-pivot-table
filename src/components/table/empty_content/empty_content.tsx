import React, { memo } from 'react';
import { black } from '@vikadata/components';

interface EmptyContentProps {
  content: string;
}

export function defaultEmptyContent(props: EmptyContentProps) {
  const { content } = props;
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
          {content}
        </div>
      </>
    );
  });
}