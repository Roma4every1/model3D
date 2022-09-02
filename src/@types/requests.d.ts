/*
/iAmAlive?sessionId=...

/systemList

/startSession?systemName=...&defaultConfiguration=...

/getRootForm?sessionId=...

/presentationList?sessionId=...

/getChannelsForForm?sessionId=...&formID=...
string[]

/getFormSettings?sessionId=...&formID=...
{id: any, attachedProperties: any, columns: any}

/pluginData?sessionId=...&formID=...&pluginName=...

/getChildrenForms?sessionId=...&formID=...

/getFormLayout?sessionId=...&formID=...

/getFormParameters?sessionId=...&formID=...
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
