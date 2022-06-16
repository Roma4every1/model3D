/*
/iAmAlive?sessionId=...

/systemList

/startSession?systemName=...&defaultConfiguration=...

/getRootForm?sessionId=...

/presentationList?sessionId=...

/getChannelsForForm?sessionId=...&formId=...
string[]

/getFormSettings?sessionId=...&formId=...
{id: any, attachedProperties: any, columns: any}

/pluginData?sessionId=...&formId=...&pluginName=...

/getChildrenForms?sessionId=...&formId=...

/getFormLayout?sessionId=...&formId=...

/getFormParameters?sessionId=...&formId=...
FormParameter[]

/getNeededParamForChannel?sessionId=...&channelName=...

/getChannelDataByName
body: {sessionId, channelName, paramValues}
{
  id: string,
  tableId: string,
  displayName: string,
  idIndex: number,
  nameIndex: number,
  parentIndex: number,
  properties: object[],
  currentRowObjectName: any,
}
*/
