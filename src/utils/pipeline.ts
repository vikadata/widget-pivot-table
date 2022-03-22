import { Field, t } from "@vikadata/widget-sdk";
import { TablePipeline } from "ali-react-table";
import { renderer } from "../components";
import { StatType } from "./helper";
import { Strings } from "./i18n";

// 处理列，适配透视表排序
export const columnHandler = (leftCodes: string[], columnField?: Field) => {
  return (pipeline: TablePipeline) => {
    return pipeline.mapColumns((cols) => cols.map((column, index) => {
      const { columnType, name } = column as any;
      // 左侧维度为空时，对列数据做处理
      if (columnType === 'left' && leftCodes.length) {
        return {
          ...column,
          getSpanRect: undefined,
          getCellProps: (value) => ({ style: { fontWeight: 'bold' } }),
        };
      }
  
      let children;
  
      if (column?.children) {
        // 构造不同的 code，供排序使用
        children = column.children.map((data, innerIndex) => {
          return { 
            ...data, 
            code: `${(data.code || '')}_${index}_${innerIndex}`
          };
        });
      }
      return {
        ...column,
        children,
        align: 'center',
        title: columnField ? renderer(name, columnField, StatType.None) : name,
        getCellProps: (value) => ({ rowSpan: 1 }),
      };
    }))
  }
};

// 添加序号
export const serialNumberHandler = () => {
  return (pipeline: TablePipeline) => {
    return pipeline.mapColumns((cols) => [
      {
        name: t(Strings.serial_number),
        lock: true,
        width: 60,
        align: 'center',
				getValue: (row, rowIndex) => rowIndex + 1,
      },
      ...cols
		])
  }
};