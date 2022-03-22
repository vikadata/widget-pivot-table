import React, { useMemo, FC } from 'react';
import { 
  useCloudStorage, useFields, useSettingsButton, useViewsMeta, initializeWidget, t
} from '@vikadata/widget-sdk';
import { PivotTable } from './components';
import { FormWrapper } from './components/setting/styled';
import { UI_SCHEMA, FormSchema, useGetDefaultFormData, IFormDataProps } from './model';
import { Strings } from './utils';
import { Form } from '@vikadata/components';

const Main: FC = () => {
  const views = useViewsMeta();
  const [isSettingOpened] = useSettingsButton();
  const defaultFormData = useGetDefaultFormData();
  const [formData, setFormData, editable] = useCloudStorage('FormData', defaultFormData);
  const { configuration } = formData;
  const { viewId } = configuration;
  const fields = useFields(viewId);
  const filteredViews = views.map(({ id, name }) => ({ id, name }));

  const schema: any = useMemo(() => {
    return new FormSchema(formData, filteredViews, fields).getSchema();
  }, [formData, filteredViews, fields]);

  const onFormChange = (data: any) => {
    setFormData(data.formData);
  };

  const validate = (formData: IFormDataProps, errors) => {
    if (filteredViews.findIndex(view => view.id === formData.configuration.viewId) === -1) {
      errors.configuration.viewId.addError(t(Strings.pivot_option_view_had_been_deleted));
    }
    return errors;
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden', padding: 16 }}>
        <div style={{ flexGrow: 1, overflow: 'auto' }}>
          <PivotTable formData={formData} />
        </div>
      </div>
      <FormWrapper openSetting={isSettingOpened} readOnly={!editable}>
        <Form
          formData={formData}
          uiSchema={UI_SCHEMA}
          schema={schema}
          onChange={onFormChange}
          validate={validate}
          liveValidate
        >
          <div/>
        </Form>
      </FormWrapper>
    </div>
  );
};

initializeWidget(Main, process.env.WIDGET_PACKAGE_ID);