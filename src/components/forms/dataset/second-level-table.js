import React, { useMemo } from "react";
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Window } from "@progress/kendo-react-dialogs";
import Form from "../form/form";


export const SecondLevelTable = ({formID, parentFormID, channelName, onClose}) => {
  const { t } = useTranslation();

  const stateFormData = useSelector((state) => {
    return state.childForms[parentFormID]?.children.find(p => p.id === formID);
  });

  const staticFormData = useMemo(() => {
    return {id: formID, type: 'dataSet', displayName: t('table.linkedTable')};
  }, [formID, t]);

  const formData = stateFormData || staticFormData;

  return (
    <Window key={formID} title={formData.displayName} onClose={onClose} style={{zIndex: 99}}>
      <Form formData={formData} channel={channelName}/>
    </Window>
  );
};
