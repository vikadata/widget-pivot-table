import React from 'react';
import { 
  CellAttachment, CellCheckbox, CellEnhanceText, 
  CellLink, CellMember, CellMultiText, CellText, Field, FieldType, t
} from '@vikadata/widget-sdk';
import { StatType, Strings } from "../../utils";
import { COUNT_ALL_VALUES, SPLIT_TYPE_MAP } from '../../model';
import { CellOptions } from './cell_options';
import { NOT_EXIST } from '../table'

export const ORIGINAL_STAT_TYPE_MAP = new Set([
  StatType.CountAll, 
  StatType.Filled, 
  StatType.Empty, 
  StatType.Unique,
  StatType.PercentFilled,
  StatType.PercentEmpty,
  StatType.PercentUnique
]);

export const renderer = (
  value, 
  field: Field, 
  statType: StatType = StatType.None, 
  parseFn: Function = (value) => JSON.parse(value)
) => {
  if ([t(Strings.pivot_totals), t(Strings.pivot_subtotals)].includes(value)) return value;
  if (value === NOT_EXIST) return '-'; // 记录不存在
  if (COUNT_ALL_VALUES.includes(field.id)) return value;

  const { entityType, fieldData } = field;
  const property = fieldData.property;
  let cellValue;

  try {
    cellValue = parseFn(value);
  } catch (e) {
    console.log(e);
  }

  // 记录为空
  if (cellValue == null || (SPLIT_TYPE_MAP.has(entityType) && !cellValue?.length)) {
    return '-';
  }

  if (ORIGINAL_STAT_TYPE_MAP.has(statType)) {
    return cellValue;
  }

  switch (entityType) {
    case FieldType.URL:
    case FieldType.Phone:
    case FieldType.Email:
    case FieldType.SingleText:
      return (
        <CellEnhanceText 
          text={cellValue} 
          cellStyle={{
            wordBreak: 'break-word'
          }}
        />
      );
    case FieldType.Text:
      return <CellMultiText text={cellValue} />;
    case FieldType.DateTime:
    case FieldType.CreatedTime:
    case FieldType.LastModifiedTime:
      return <CellText text={cellValue} />;
    case FieldType.Currency:
    case FieldType.Percent:
    case FieldType.AutoNumber:
    case FieldType.Number:
    case FieldType.Formula:
    case FieldType.Rating:
      return <CellText text={field.convertCellValueToString(cellValue)} />;	
    case FieldType.SingleSelect:
    case FieldType.MultiSelect:
      return (
        <CellOptions 
          options={property.options} 
          selectOptions={cellValue} 
          style={{ justifyContent: 'center' }}
          cellStyle={{ 
            marginRight: entityType === FieldType.SingleSelect ? 0 : 8, 
            fontWeight: 'normal' 
          }} 
        />
      );
    // case FieldType.Rating:
    //   return <CellRating field={property} count={cellValue} />;
    case FieldType.Attachment:
      return <CellAttachment files={cellValue} style={{ justifyContent: 'center' }} />;
    case FieldType.Member:
    case FieldType.LastModifiedBy:
    case FieldType.CreatedBy:
      return (
        <CellMember 
          members={cellValue} 
          style={{ 
            justifyContent: 'center', 
            flexWrap: 'wrap', 
            fontWeight: 'normal',
          }} 
          cellStyle={{
            maxWidth: '100%'
          }}
        />
      );
    case FieldType.Checkbox:
      return <CellCheckbox field={property} checked={cellValue} />;
    // case FieldType.Phone:
    //   return <CellPhone value={cellValue} />;
    // case FieldType.Email:
    //   return <CellEmail value={cellValue} />;
    // case FieldType.URL:
    //   return <CellUrl value={cellValue} />;
    case FieldType.MagicLink:
      return (
        <CellLink 
          options={cellValue} 
          style={{ 
            width: '100%',
            fontWeight: 'normal',
            justifyContent: 'center'
          }} 
          cellStyle={{
            display: 'block',
          }}
        />
      );
    default:
      return null;
  }
}