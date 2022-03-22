import { Field, FieldType, Record } from "@vikadata/widget-sdk";
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { isArray, sortBy } from "lodash";
import { compare, StatType } from "../utils";
import { COUNT_ALL_VALUES, STAT_TYPE_MAP } from "./schema";

dayjs.extend(advancedFormat);
dayjs.extend(weekOfYear);

export interface ThinField {
	fieldId: string;
	name: string;
	type: FieldType; 
	entityType: FieldType;
	statType?: StatType;
	isSplitMultipleValue?: boolean;
	dateTimeFormatter?: string;
	field: Field;
};

export interface ITableBaseProps {
	rowConfigs: ThinField[];
	columnConfigs: ThinField[];
	valueConfigs: ThinField[];
}

export const NEED_FORMAT_TEXT_TYPES = new Set([
	FieldType.SingleText, 
	FieldType.Text, 
]);

export const NEED_FORMAT_DATE_TIME_TYPES = new Set([
	FieldType.DateTime, 
	FieldType.CreatedTime, 
	FieldType.LastModifiedTime,
]);

// 统一格式化函数
export const defaultFormatFn = (cv) => JSON.stringify(cv);

export const checkNull = (cv) => {
	if (cv == null) return null;
	if (isArray(cv)) cv = cv.flat().filter(v => v);
	if (isArray(cv) && !cv.length) return null;
	return cv;
}

export const formatDateTime = (cv: number | number[], format: string) => {
  return [cv].flat().map(value => {
    const dateTime = dayjs(value);
    if (dateTime.isValid()) {
      return dateTime.format(format);
    }
    return null;
  }).join(',');
};

/**
 * 根据不同 FieldType 进行值的格式化，
 * 这里直接使用真实的 FieldType 进行判断，以保证格式化的正确性
 */
export const formatByFieldType = (cellValue, field: ThinField) => { 
	cellValue = checkNull(cellValue);
	if (cellValue == null) return null;

	const { type, entityType, dateTimeFormatter } = field;
	if (type === FieldType.MagicLookUp && NEED_FORMAT_TEXT_TYPES.has(entityType)) {
		cellValue = cellValue.join(', ');
	}
	if (NEED_FORMAT_DATE_TIME_TYPES.has(entityType)) {
		cellValue = formatDateTime(cellValue, dateTimeFormatter!);
	}

	switch (entityType) {
		case FieldType.MagicLink:
			return defaultFormatFn(sortBy(cellValue, 'title'));
		case FieldType.Member:
		case FieldType.MultiSelect:
			return defaultFormatFn(sortBy(cellValue, 'name'));
		default:
			return defaultFormatFn(cellValue);
	}
}

export const getCellValue = (record: Record, field: ThinField) => {
	const { entityType, fieldId } = field;

	if (NEED_FORMAT_DATE_TIME_TYPES.has(entityType)) {
		return record._getCellValue(fieldId);
	}
	return record.getCellValue(fieldId);
}

export const SPLIT_TYPE_MAP = new Set([
	FieldType.Member, 
	FieldType.MultiSelect, 
	FieldType.MagicLink,
	FieldType.MagicLookUp,
]);

export class TableBase {
	private rowConfigs: ThinField[];
	private columnConfigs: ThinField[];;
	private valueConfigs: ThinField[];

  constructor (props: ITableBaseProps) {
		this.rowConfigs = props.rowConfigs;
		this.columnConfigs = props.columnConfigs;
		this.valueConfigs = props.valueConfigs;
	}

	// 检查值是否有效
	private checkValid () {
		return (
			this.rowConfigs.filter(v => v.field).length || 
			this.columnConfigs.filter(v => v.field).length
		 ) && this.valueConfigs.filter(v => v.fieldId).length;
	}

	// 获取数据源
	getData (records: Record[]) {
		if (!this.checkValid()) return [];

		const rowField = this.rowConfigs[0] || {};
		const columnField = this.columnConfigs[0] || {};
		const { fieldId: rowFieldId, type: rowFieldType, isSplitMultipleValue: _isRowSplitMultipleValue } = rowField;
		const { fieldId: columnFieldId, type: columnFieldType, isSplitMultipleValue: _isColumnSplitMultipleValue } = columnField;
		const isRowSplitMultipleValue = _isRowSplitMultipleValue && SPLIT_TYPE_MAP.has(rowFieldType);
		const isColumnSplitMultipleValue = _isColumnSplitMultipleValue && SPLIT_TYPE_MAP.has(columnFieldType);
		const resultData: any[] = [];

		records.forEach(record => {
			const valueFieldData = {};
			this.valueConfigs.forEach((thinField) => {
				const { fieldId } = thinField;
				valueFieldData[fieldId] = COUNT_ALL_VALUES.includes(fieldId) ? 1 : getCellValue(record, thinField);
			});

			// 行、列维度都进行多选值分离
			if (isRowSplitMultipleValue && isColumnSplitMultipleValue) {
				const rowCellValue = getCellValue(record, rowField);
				const columnCellValue = getCellValue(record, columnField);

				return [rowCellValue].flat().forEach((cv1) => {
					return [columnCellValue].flat().forEach((cv2) => {
						resultData.push({
							[rowFieldId]: formatByFieldType([cv1], this.rowConfigs[0]),
							[columnFieldId]: formatByFieldType([cv2], this.columnConfigs[0]),
							...valueFieldData
						});
					});
				})
			}

			// 行维度进行多选值分离
			if (isRowSplitMultipleValue) {
				const rowCellValue = getCellValue(record, rowField);

				return [rowCellValue].flat().forEach((cv) => {
					resultData.push({
						[rowFieldId]: formatByFieldType([cv], this.rowConfigs[0]),
						[columnFieldId]: formatByFieldType(getCellValue(record, columnField), this.columnConfigs[0]),
						...valueFieldData
					});
				});
			}

			// 列维度进行多选值分离
			if (isColumnSplitMultipleValue) {
				const columnCellValue = getCellValue(record, columnField);

				return [columnCellValue].flat().forEach((cv) => {
					resultData.push({
						[rowFieldId]: formatByFieldType(getCellValue(record, rowField), this.rowConfigs[0]),
						[columnFieldId]: formatByFieldType([cv], this.columnConfigs[0]),
						...valueFieldData
					});
				});
			}

			// 无多选值分离情况
			return resultData.push({
				[rowFieldId]: formatByFieldType(getCellValue(record, rowField), this.rowConfigs[0]),
				[columnFieldId]: formatByFieldType(getCellValue(record, columnField), this.columnConfigs[0]),
				...valueFieldData
			});
		});
		return resultData;
	}

	// 获取指标数值
	getIndicators (renderer: Function) {
		if (!this.checkValid()) return [];
		return this.valueConfigs.map(({ fieldId, name, field, statType = StatType.None }) => {
			if (!field) return null;
			return {
				code: fieldId,
				name: COUNT_ALL_VALUES.includes(fieldId) ? name : `${name}-${STAT_TYPE_MAP[statType]}`,
				hidden: false,
				align: 'center' as const,
				render: (value) => renderer(value, field, statType, (v) => v),
				features: {
					sortable: compare
				}
			};
		}).filter(Boolean) as any[];
	};

	// 获取各维度信息
	getDimensions (renderer: Function) {
		if (!this.checkValid()) return [];
		const rowDimensions = this.rowConfigs.map(({ fieldId, name, field }) => {
			if (!field) return null;
			return {
				code: fieldId,
				name,
				render: (node) => renderer(node.value, field, StatType.None),
				width: 150,
				align: 'center',
			};
		}).filter(Boolean);

		const columnDimensions = this.columnConfigs.map(({ fieldId, name, field }) => {
			if (!field) return null;
			return {
				code: fieldId,
				name,
				render: (node) => renderer(node.value, field, StatType.None),
			};
		}).filter(Boolean);

		const valueDimensions = this.valueConfigs.map(({ fieldId, name }) => {
			return {
				code: fieldId,
				name,
			};
		});
		const result = [
			...rowDimensions,
			...columnDimensions,
			...valueDimensions
		];
		return result as any[];
	}
}