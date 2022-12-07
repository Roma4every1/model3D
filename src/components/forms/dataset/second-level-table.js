import React, { useState } from "react";
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Window } from "@progress/kendo-react-dialogs";
import Form from "../form";
import { getParentFormId } from "../../../utils/utils";


export const SecondLevelTable = ({secondLevelFormId, setOpened, channelName, keyProp}) => {
  const { t } = useTranslation();

  const [staticFormData] = useState({
    id: secondLevelFormId,
    type: 'dataSet',
    displayName: t('table.linkedTable')
  });

  const formData = useSelector((state) => (state
    .childForms[getParentFormId(secondLevelFormId)]?.children
    .find(p => p.id === secondLevelFormId)) ?? staticFormData);

  return (
    <Window key={keyProp} title={formData.displayName} onClose={() => { setOpened(false); }}>
      <Form formData={formData} data={{activeChannels: [channelName]}} />
    </Window>
  );
};
