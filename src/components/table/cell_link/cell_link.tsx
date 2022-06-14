import React from 'react';
import { useThemeColors } from '@vikadata/components';
import { CellLink as CellLinkComponent } from '@vikadata/widget-sdk';

export const CellLink = (props) => {
  const { cellValue } = props;
  const colors = useThemeColors();

  return (
    <CellLinkComponent 
      options={cellValue} 
      style={{ 
        width: '100%',
        fontWeight: 'normal',
        justifyContent: 'center'
      }} 
      cellStyle={{
        display: 'block',
        background: colors.defaultTag
      }}
    />
  );
}