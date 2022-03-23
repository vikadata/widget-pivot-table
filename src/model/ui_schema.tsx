import React, { useCallback } from 'react';
import { useFields, useViewsMeta, t } from '@vikadata/widget-sdk';
import { COUNT_ALL_VALUE, DATE_TIME_FORMATTER_TYPES, isNumberType, SortType } from './schema';
import { FieldSelect } from "../components";
import { StatType, Strings } from '../utils';

export const useGetDefaultFormData = () => {
  const views = useViewsMeta();
  const viewId = views[0].id;
  const fields = useFields(viewId);
  const rowFieldId = fields[0].id || '';
  const columnFieldId = fields[1]?.id || '';
  const valueFieldId = fields.filter(field => {
    const { id } = field;
    return (
      isNumberType(field) &&
      !new Set([rowFieldId, columnFieldId]).has(id)
    );
  })[0]?.id || COUNT_ALL_VALUE;

  // 默认表单配置
  return useCallback(() => {
    return {
      configuration: {
        viewId: views[0].id,
        rowDimensions: [{ fieldId: rowFieldId, dateTimeFormatter: DATE_TIME_FORMATTER_TYPES[0] }],
        columnDimensions: [{ fieldId: columnFieldId, dateTimeFormatter: DATE_TIME_FORMATTER_TYPES[0] }],
        valueDimensions: [{ fieldId: valueFieldId, statType: StatType.Sum }],
      },
      more: {
        isSummary: true,
        filterInfo: [],
        rowSortType: SortType.None,
        columnSortType: SortType.None,
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

const AXIS_DIMENSIONS_UI_SCHEMA = {
  "ui:options": {
    removable: false
  },
  items: {
    "ui:options":  {
      showTitle: false,
      inline: true,
      layout: [['fieldId', 'dateTimeFormatter'], ['isSplitMultipleValue']],
    },
    fieldId: {
      'ui:options': {
        showTitle: false,
      },
      'ui:widget': props => <FieldSelect {...props} />,
    },
    dateTimeFormatter: {
      'ui:options': {
        showTitle: false,
      },
    },
    isSplitMultipleValue: {
      'ui:options': {
        showTitle: false,
      },
    },
  },
};

export const UI_SCHEMA = {
  'ui:options': {
    help: {
      text: t(Strings.pivot_setting_help_tips),
      url: t(Strings.pivot_setting_help_url),
    },
  },
  configuration: {
    rowDimensions: AXIS_DIMENSIONS_UI_SCHEMA,
    columnDimensions: AXIS_DIMENSIONS_UI_SCHEMA,
    valueDimensions: {
      "ui:options": {
        removable: true
      },
      items: {
        "ui:options":  {
          inline: true,
          showTitle: false,
        },
        fieldId: {
          'ui:options': {
            showTitle: false,
          },
          'ui:widget': props => <FieldSelect {...props} />,
        },
        statType: {
          'ui:options': {
            showTitle: false,
          },
        },
      }
    },
  },
  more: {
    "ui:options": {
      collapse: true,
    },
    isSummary: {
      "ui:options":  {
        showTitle: false,
      },
    },
    filterInfo: {
      "ui:options": {
        removable: false
      },
      items: {
        "ui:options":  {
          inline: true,
          showTitle: false,
        },
        fieldId: {
          'ui:options': {
            showTitle: false,
          },
          'ui:widget': props => <FieldSelect {...props} />,
        },
        operatorSymbol: {
          "ui:rootFieldId": "myForm",
          'ui:options': {
            showTitle: false,
          }
        },
        filterValue: {
          'ui:options': {
            showTitle: false,
          }
        },
        statType: {
          'ui:options': {
            showTitle: false,
          },
        },
      }
    },
    rowSortType: {
      'ui:widget': 'toggleButtonWidget',
    },
    columnSortType: {
      'ui:widget': 'toggleButtonWidget',
    }
  }
};