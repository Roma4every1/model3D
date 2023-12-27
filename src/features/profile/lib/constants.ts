/** Размер шага вдоль трассы для построения профиля. */
export const PROFILE_X_STEP = 200;

/** Настройки отрисовки. */
export const drawerConfig: ProfileDrawerConfig = {
  stage: {
    padding: 4,
    font: {size: 14, style: 'normal', family: '"Segoe UI", Roboto, sans-serif'}
  },
  axis: {
    backgroundColor: '#EEEEEE',
    color: '#000000',
    font: {size: 24},
    markSize: 10
  },
};

const colColorSprChannel: Channel = {
  "name": "colColorSpr",
  "info": {
    "currentRowObjectName": null,
    "displayName": "Справочник цветов коллекторов",
    "properties": [
      {
        "name": "LOOKUPCODE",
        "fromColumn": "CODE",
        "displayName": "LookupCode",
        "treePath": [],
        "lookupChannels": [],
        "secondLevelChannelName": null,
        "file": null,
        "type": "System.Int64"
      },
      {
        "name": "COLOR",
        "fromColumn": "COLOR",
        "displayName": "Цвет",
        "treePath": [],
        "lookupChannels": [],
        "secondLevelChannelName": null,
        "file": null,
        "type": "System.String"
      },
      {
        "name": "BORDER COLOR",
        "fromColumn": "BORDER_COLOR",
        "displayName": "Цвет линии",
        "treePath": [],
        "lookupChannels": [],
        "secondLevelChannelName": null,
        "file": null,
        "type": "System.String"
      },
      {
        "name": "BACKGROUND COLOR",
        "fromColumn": "BACK_COLOR",
        "displayName": "Цвет фона",
        "treePath": [],
        "lookupChannels": [],
        "secondLevelChannelName": null,
        "file": null,
        "type": "System.String"
      },
      {
        "name": "FILL STYLE",
        "fromColumn": "FILL_STYLE",
        "displayName": "Заливка",
        "treePath": [],
        "lookupChannels": [],
        "secondLevelChannelName": null,
        "file": null,
        "type": "System.String"
      },
      {
        "name": "LINE STYLE",
        "fromColumn": "LINE_STYLE",
        "displayName": "Линия",
        "treePath": [],
        "lookupChannels": [],
        "secondLevelChannelName": null,
        "file": null,
        "type": "System.String"
      },
      {
        "name": "SHAPE",
        "fromColumn": "SHAPE",
        "displayName": "Фигура",
        "treePath": [],
        "lookupChannels": [],
        "secondLevelChannelName": null,
        "file": null,
        "type": "System.String"
      }
    ],
    "parameters": [],
    "lookupChannels": [],
    "lookupColumns": {
      "id": {
        "name": "CODE",
        "index": 0
      },
      "value": {
        "name": "LOOKUPVALUE",
        "index": -1
      },
      "parent": {
        "name": "LOOKUPPARENTCODE",
        "index": -1
      }
    },
    "columnApplied": true
  },
  "data": {
    "columns": [
      {
        "NetType": "System.Int64",
        "Name": "CODE",
        "AllowDBNull": false
      },
      {
        "NetType": "System.String",
        "Name": "COLOR",
        "AllowDBNull": true
      },
      {
        "NetType": "System.String",
        "Name": "FILL_STYLE",
        "AllowDBNull": true
      },
      {
        "NetType": "System.String",
        "Name": "LINE_STYLE",
        "AllowDBNull": true
      },
      {
        "NetType": "System.String",
        "Name": "BACK_COLOR",
        "AllowDBNull": true
      },
      {
        "NetType": "System.String",
        "Name": "BORDER_COLOR",
        "AllowDBNull": true
      },
      {
        "NetType": "System.String",
        "Name": "SHAPE",
        "AllowDBNull": true
      },
      {
        "NetType": "System.String",
        "Name": "REMARKS",
        "AllowDBNull": true
      }
    ],
    "rows": [
      {
        "ID": null,
        "Cells": [
          -1,
          "#00FFFFFF",
          null,
          null,
          "#00FFFFFF",
          "#00FFFFFF",
          "rect",
          "Нет данных"
        ]
      },
      {
        "ID": null,
        "Cells": [
          0,
          "#AF404040",
          "GRIDS-8",
          null,
          "#AF808080",
          "#FF404040",
          "rect",
          "Отс. коллектора"
        ]
      },
      {
        "ID": null,
        "Cells": [
          1,
          "#AF595959",
          "LIT-2",
          "{B6BFCAE3-B6E8-4E40-B079-8ACE23F4B938}",
          "#00FFFFFF",
          "#FF595959",
          "rect",
          "Песчаник"
        ]
      },
      {
        "ID": null,
        "Cells": [
          2,
          "#AF0D0D0D",
          "LIT-6",
          null,
          "#00FFFFFF",
          "#FF0D0D0D",
          "rect",
          "Алевролит"
        ]
      },
      {
        "ID": null,
        "Cells": [
          3,
          "#FFCDDC39",
          null,
          null,
          "#FFCDDC39",
          "#FFCDDC39",
          "rect",
          "Карбонат уплотненный"
        ]
      },
      {
        "ID": null,
        "Cells": [
          4,
          "#AF262626",
          "LIT-20",
          null,
          "#00FFFFFF",
          "#FF262626",
          "rect",
          "Глинистый песчаник"
        ]
      },
      {
        "ID": null,
        "Cells": [
          5,
          "#AF0D0D0D",
          "LIT-6",
          null,
          "#00FFFFFF",
          "#FF0D0D0D",
          "rect",
          "Алевролит глинистый "
        ]
      },
      {
        "ID": null,
        "Cells": [
          6,
          "#AF0D0D0D",
          "LIT-6",
          "",
          "#00FFFFFF",
          "#FF0D0D0D",
          "rect",
          "Глин.упл.коллектор"
        ]
      },
      {
        "ID": null,
        "Cells": [
          7,
          "#FFCDDC39",
          null,
          null,
          "#FFCDDC39",
          "#FFCDDC39",
          "rect",
          "Карбонат"
        ]
      },
      {
        "ID": null,
        "Cells": [
          8,
          null,
          null,
          null,
          null,
          null,
          "rect",
          "Известняк"
        ]
      },
      {
        "ID": null,
        "Cells": [
          9,
          "#AF404040",
          "GRIDS-8",
          null,
          "#AF808080",
          "#FF404040",
          "rect",
          "Неколллектор"
        ]
      },
      {
        "ID": null,
        "Cells": [
          10,
          "#FFCDDC39",
          null,
          null,
          "#FFCDDC39",
          "#FFCDDC39",
          "rect",
          "Карбонат высокопроницаемый"
        ]
      },
      {
        "ID": null,
        "Cells": [
          11,
          "#FFCDDC39",
          null,
          null,
          "#FFCDDC39",
          "#FFCDDC39",
          "rect",
          "Карбонат среднепроницаемый"
        ]
      },
      {
        "ID": null,
        "Cells": [
          12,
          "#FFCDDC39",
          null,
          null,
          "#FFCDDC39",
          "#FFCDDC39",
          "rect",
          "Карбонат низкопроницаемый"
        ]
      },
      {
        "ID": null,
        "Cells": [
          13,
          null,
          null,
          null,
          null,
          null,
          "rect",
          "Izvestnjak glinistyjj"
        ]
      },
      {
        "ID": null,
        "Cells": [
          14,
          "#00FFFFFF",
          null,
          null,
          "#00FFFFFF",
          "#00FFFFFF",
          "rect",
          "Не известно"
        ]
      },
      {
        "ID": null,
        "Cells": [
          15,
          null,
          null,
          null,
          null,
          null,
          "rect",
          "Izvestnjak"
        ]
      },
      {
        "ID": null,
        "Cells": [
          17,
          null,
          null,
          null,
          null,
          null,
          "rect",
          "Pereslaivanie alevrolita i argillita"
        ]
      },
      {
        "ID": null,
        "Cells": [
          18,
          null,
          null,
          null,
          null,
          null,
          "rect",
          "Pereslaivanie alevrolita, gliny i peschanika"
        ]
      },
      {
        "ID": null,
        "Cells": [
          19,
          null,
          null,
          null,
          null,
          null,
          "rect",
          "Pereslaivanie alevrolita, argillita, gliny i peschanika"
        ]
      },
      {
        "ID": null,
        "Cells": [
          20,
          null,
          null,
          null,
          null,
          null,
          "rect",
          "Pereslaivanie alevrolita, argillita i peschanika"
        ]
      },
      {
        "ID": null,
        "Cells": [
          21,
          null,
          null,
          null,
          null,
          null,
          "rect",
          "Pereslaivanie alevrolita i dolomita"
        ]
      },
      {
        "ID": null,
        "Cells": [
          22,
          null,
          null,
          null,
          null,
          null,
          "rect",
          "Pereslaivanie alevrolita i gliny"
        ]
      },
      {
        "ID": null,
        "Cells": [
          26,
          null,
          null,
          null,
          null,
          null,
          "rect",
          "Pereslaivanie peschanika i alevrolita"
        ]
      },
      {
        "ID": null,
        "Cells": [
          27,
          null,
          null,
          null,
          null,
          null,
          "rect",
          "Pereslaivanie peschanika i argillita"
        ]
      },
      {
        "ID": null,
        "Cells": [
          59,
          "#AF262626",
          "LIT-20",
          null,
          "#00FFFFFF",
          "#FF262626",
          "rect",
          "Pesok s glinistymi proslojami"
        ]
      },
      {
        "ID": null,
        "Cells": [
          60,
          "#AF262626",
          "LIT-20",
          null,
          "#00FFFFFF",
          "#FF262626",
          "rect",
          "Peschanik s glinistymi proslojami"
        ]
      },
      {
        "ID": null,
        "Cells": [
          67,
          null,
          null,
          null,
          null,
          null,
          "rect",
          "Peschanik i argillit"
        ]
      },
      {
        "ID": null,
        "Cells": [
          68,
          null,
          null,
          null,
          null,
          null,
          "rect",
          "Peschanik i alevrolit"
        ]
      },
      {
        "ID": null,
        "Cells": [
          70,
          "#AF595959",
          "LIT-2",
          "{B6BFCAE3-B6E8-4E40-B079-8ACE23F4B938}",
          "#00FFFFFF",
          "#FF595959",
          "rect",
          "Peschanik glaukonitovyjj (soderzhahhijj glaukonit)"
        ]
      },
      {
        "ID": null,
        "Cells": [
          71,
          "#AF595959",
          "LIT-2",
          "{B6BFCAE3-B6E8-4E40-B079-8ACE23F4B938}",
          "#00FFFFFF",
          "#FF595959",
          "rect",
          "Peschanik bituminoznyjj (razmer zeren 2-0.05 mm)"
        ]
      },
      {
        "ID": null,
        "Cells": [
          79,
          null,
          null,
          null,
          null,
          null,
          "rect",
          "Pereslaivanie alevrita i argillita"
        ]
      },
      {
        "ID": null,
        "Cells": [
          85,
          null,
          null,
          null,
          null,
          null,
          "rect",
          "Alevrit (razmer zeren 0.05-0.005 mm)"
        ]
      },
      {
        "ID": null,
        "Cells": [
          94,
          "#AF0D0D0D",
          "LIT-6",
          null,
          "#00FFFFFF",
          "#FF0D0D0D",
          "rect",
          "Alevrolit glinistyjj (preobladajuhhijj razmer zeren 0.05-0.005 mm)"
        ]
      },
      {
        "ID": null,
        "Cells": [
          105,
          null,
          null,
          null,
          null,
          null,
          "rect",
          "Izvestnjak dolomitizirovannyjj (dolomitistyjj).Coderzhit 5-25% dolomita."
        ]
      },
      {
        "ID": null,
        "Cells": [
          111,
          null,
          null,
          null,
          null,
          null,
          "rect",
          "Glina karbonatnaja"
        ]
      },
      {
        "ID": null,
        "Cells": [
          126,
          "#AF0D0D0D",
          "LIT-6",
          null,
          "#00FFFFFF",
          "#FF0D0D0D",
          "rect",
          "Alevrolit s glinistymi proslojami"
        ]
      },
      {
        "ID": null,
        "Cells": [
          270,
          null,
          null,
          null,
          null,
          null,
          "rect",
          "Per.pesch_alevrolt.g"
        ]
      },
      {
        "ID": null,
        "Cells": [
          271,
          "#AF0D0D0D",
          "LIT-6",
          null,
          "#00FFFFFF",
          "#FF0D0D0D",
          "rect",
          "Alevrolit?"
        ]
      },
      {
        "ID": null,
        "Cells": [
          272,
          "#00FFFFFF",
          null,
          null,
          "#00FFFFFF",
          "#00FFFFFF",
          "rect",
          "UNKNOWN"
        ]
      },
      {
        "ID": null,
        "Cells": [
          300,
          "#FFCDDC39",
          null,
          null,
          "#FFCDDC39",
          "#FFCDDC39",
          "rect",
          "Terrigenno-karbonatnye porody"
        ]
      },
      {
        "ID": null,
        "Cells": [
          327,
          null,
          null,
          null,
          null,
          null,
          "rect",
          "Magmaticheskaja (intruzivnye, ehffuzivnye)"
        ]
      },
      {
        "ID": null,
        "Cells": [
          329,
          null,
          null,
          null,
          null,
          null,
          "rect",
          "Intruzivnaja srednjaja magmaticheskaja"
        ]
      },
      {
        "ID": null,
        "Cells": [
          403,
          null,
          null,
          null,
          null,
          null,
          "rect",
          "Angidrit"
        ]
      },
      {
        "ID": null,
        "Cells": [
          408,
          null,
          null,
          null,
          null,
          null,
          "rect",
          "Soli (ehvapority)"
        ]
      },
      {
        "ID": null,
        "Cells": [
          412,
          null,
          null,
          null,
          null,
          null,
          "rect",
          "Pereslaivanie argillita izvestkovistogo(CaCO3 5-25%) i izvestnjaka"
        ]
      },
      {
        "ID": null,
        "Cells": [
          418,
          null,
          null,
          null,
          null,
          null,
          "rect",
          "Glina argillitopodobnaja"
        ]
      },
      {
        "ID": null,
        "Cells": [
          428,
          null,
          null,
          null,
          null,
          null,
          "rect",
          "Glina"
        ]
      },
      {
        "ID": null,
        "Cells": [
          434,
          "#AF595959",
          null,
          null,
          "#00FFFFFF",
          "#FF595959",
          "rect",
          "Argillit alevritistyjj"
        ]
      },
      {
        "ID": null,
        "Cells": [
          436,
          "#AF595959",
          null,
          null,
          "#00FFFFFF",
          "#FF595959",
          "rect",
          "Argillit"
        ]
      },
      {
        "ID": null,
        "Cells": [
          437,
          "#AF595959",
          null,
          null,
          "#00FFFFFF",
          "#FF595959",
          "rect",
          "Argillit s glinistymi proslojami"
        ]
      },
      {
        "ID": null,
        "Cells": [
          440,
          null,
          null,
          null,
          null,
          null,
          "rect",
          "Dolomitizirovannyjj(obogahhennyjj dolomitom)"
        ]
      },
      {
        "ID": null,
        "Cells": [
          445,
          null,
          null,
          null,
          null,
          null,
          "rect",
          "Pereslaivanie mergelja i izvestnjaka"
        ]
      },
      {
        "ID": null,
        "Cells": [
          448,
          null,
          null,
          null,
          null,
          null,
          "rect",
          "Mergel' (karbonatno-glinistaja litificirovannaja poroda)"
        ]
      },
      {
        "ID": null,
        "Cells": [
          453,
          null,
          null,
          null,
          null,
          null,
          "rect",
          "Pereslaivanie dolomita i argillita"
        ]
      },
      {
        "ID": null,
        "Cells": [
          455,
          null,
          null,
          null,
          null,
          null,
          "rect",
          "Dolomit glinistyjj"
        ]
      },
      {
        "ID": null,
        "Cells": [
          457,
          null,
          null,
          null,
          null,
          null,
          "rect",
          "Dolomit"
        ]
      },
      {
        "ID": null,
        "Cells": [
          459,
          null,
          null,
          null,
          null,
          null,
          "rect",
          "Pereslaivanie izvestnjaka i argillita"
        ]
      }
    ],
    "dataPart": false,
    "editable": true
  },
  "tableID": "108",
  "query": {
    "maxRowCount": 5000,
    "filters": null,
    "order": []
  }
}

const perfColorSprChannel: Channel = {
  "name": "perfColorSpr",
  "info": {
    "currentRowObjectName": null,
    "displayName": "Справочник цветов перфораций",
    "properties": [
      {
        "name": "LOOKUPCODE",
        "fromColumn": "CODE",
        "displayName": "LookupCode",
        "treePath": [],
        "lookupChannels": [],
        "secondLevelChannelName": null,
        "file": null,
        "type": "System.Int64"
      },
      {
        "name": "COLOR",
        "fromColumn": "COLOR",
        "displayName": "Цвет",
        "treePath": [],
        "lookupChannels": [],
        "secondLevelChannelName": null,
        "file": null,
        "type": "System.String"
      },
      {
        "name": "BORDER COLOR",
        "fromColumn": "BORDER_COLOR",
        "displayName": "Цвет линии",
        "treePath": [],
        "lookupChannels": [],
        "secondLevelChannelName": null,
        "file": null,
        "type": "System.String"
      },
      {
        "name": "BACKGROUND COLOR",
        "fromColumn": "BACK_COLOR",
        "displayName": "Цвет фона",
        "treePath": [],
        "lookupChannels": [],
        "secondLevelChannelName": null,
        "file": null,
        "type": "System.String"
      },
      {
        "name": "FILL STYLE",
        "fromColumn": "FILL_STYLE",
        "displayName": "Заливка",
        "treePath": [],
        "lookupChannels": [],
        "secondLevelChannelName": null,
        "file": null,
        "type": "System.String"
      },
      {
        "name": "LINE STYLE",
        "fromColumn": "LINE_STYLE",
        "displayName": "Линия",
        "treePath": [],
        "lookupChannels": [],
        "secondLevelChannelName": null,
        "file": null,
        "type": "System.String"
      },
      {
        "name": "SHAPE",
        "fromColumn": "SHAPE",
        "displayName": "Фигура",
        "treePath": [],
        "lookupChannels": [],
        "secondLevelChannelName": null,
        "file": null,
        "type": "System.String"
      }
    ],
    "parameters": [],
    "lookupChannels": [],
    "lookupColumns": {
      "id": {
        "name": "CODE",
        "index": 0
      },
      "value": {
        "name": "LOOKUPVALUE",
        "index": -1
      },
      "parent": {
        "name": "LOOKUPPARENTCODE",
        "index": -1
      }
    },
    "columnApplied": true
  },
  "data": {
    "columns": [
      {
        "NetType": "System.Int64",
        "Name": "CODE",
        "AllowDBNull": false
      },
      {
        "NetType": "System.String",
        "Name": "COLOR",
        "AllowDBNull": true
      },
      {
        "NetType": "System.String",
        "Name": "FILL_STYLE",
        "AllowDBNull": true
      },
      {
        "NetType": "System.String",
        "Name": "LINE_STYLE",
        "AllowDBNull": true
      },
      {
        "NetType": "System.String",
        "Name": "BACK_COLOR",
        "AllowDBNull": true
      },
      {
        "NetType": "System.String",
        "Name": "BORDER_COLOR",
        "AllowDBNull": true
      },
      {
        "NetType": "System.String",
        "Name": "SHAPE",
        "AllowDBNull": true
      }
    ],
    "rows": [
      {
        "ID": null,
        "Cells": [
          1,
          "#AF000000",
          "GRIDS-30",
          "{CFA92E40-4C94-11D3-A90B-A8163E53382F}",
          "#00000000",
          "#FF000000",
          "rect"
        ]
      },
      {
        "ID": null,
        "Cells": [
          2,
          "#AF17ffff",
          "GRIDS-16",
          "{17E4AC50-9F89-11D4-AD26-0080ADB5E66B}",
          "#00000000",
          "#FF17ffff",
          "rect"
        ]
      },
      {
        "ID": null,
        "Cells": [
          11,
          "#AFF273AF",
          "GRIDS-19",
          "{CFA92E40-4C94-11D3-A90B-A8163E53382F}",
          "#AFFBD0E4",
          "#FFF273AF",
          "rect"
        ]
      },
      {
        "ID": null,
        "Cells": [
          12,
          "#AFF273AF",
          "GRIDS-19",
          "{CFA92E40-4C94-11D3-A90B-A8163E53382F}",
          "#AFFBD0E4",
          "#FFF273AF",
          "rect"
        ]
      },
      {
        "ID": null,
        "Cells": [
          13,
          "#AFCCEDB1",
          "GRIDS-19",
          "{17E4AC50-9F89-11D4-AD28-0080ADB5E66B}",
          "#AFFFF1CE",
          "#FFCCEDB1",
          "rect"
        ]
      },
      {
        "ID": null,
        "Cells": [
          20,
          "#AFF273AF",
          "GRIDS-19",
          "{CFA92E40-4C94-11D3-A90B-A8163E53382F}",
          "#AFFBD0E4",
          "#FFF273AF",
          "rect"
        ]
      },
      {
        "ID": null,
        "Cells": [
          31,
          "#AF808080",
          "GRIDS-20",
          "{17E4AC50-9F89-11D4-AD26-0080ADB5E66B}",
          "#AFFFF1CE",
          "#FF808080",
          "rect"
        ]
      },
      {
        "ID": null,
        "Cells": [
          43,
          "#AFCCEDB1",
          "GRIDS-19",
          "{17E4AC50-9F89-11D4-AD28-0080ADB5E66B}",
          "#AFFFF1CE",
          "#FFCCEDB1",
          "rect"
        ]
      }
    ],
    "dataPart": false,
    "editable": true
  },
  "tableID": "200",
  "query": {
    "maxRowCount": 5000,
    "filters": null,
    "order": []
  }
}

const perfTypeSprChannel: Channel = {
  "name": "perfTypeSpr",
  "info": {
    "currentRowObjectName": null,
    "displayName": "Справочник типов перфораций",
    "properties": [
      {
        "name": "LOOKUPCODE",
        "fromColumn": "CODE",
        "displayName": "Код",
        "treePath": [],
        "lookupChannels": [],
        "secondLevelChannelName": null,
        "file": null,
        "type": "System.Decimal"
      },
      {
        "name": "LOOKUPVALUE",
        "fromColumn": "NAME",
        "displayName": "Наименование",
        "treePath": [],
        "lookupChannels": [],
        "secondLevelChannelName": null,
        "file": null,
        "type": "System.String"
      }
    ],
    "parameters": [],
    "lookupChannels": [],
    "lookupColumns": {
      "id": {
        "name": "CODE",
        "index": 0
      },
      "value": {
        "name": "NAME",
        "index": 1
      },
      "parent": {
        "name": "LOOKUPPARENTCODE",
        "index": -1
      }
    },
    "columnApplied": true
  },
  "data": {
    "columns": [
      {
        "NetType": "System.Decimal",
        "Name": "CODE",
        "AllowDBNull": false
      },
      {
        "NetType": "System.String",
        "Name": "NAME",
        "AllowDBNull": true
      },
      {
        "NetType": "System.Decimal",
        "Name": "SPRCODE",
        "AllowDBNull": false
      },
      {
        "NetType": "System.String",
        "Name": "SHORT_NAME",
        "AllowDBNull": true
      },
      {
        "NetType": "System.String",
        "Name": "PATTERN",
        "AllowDBNull": true
      },
      {
        "NetType": "System.Decimal",
        "Name": "PARENT_CODE",
        "AllowDBNull": true
      },
      {
        "NetType": "System.Decimal",
        "Name": "SORTORDER",
        "AllowDBNull": true
      }
    ],
    "rows": [
      {
        "ID": null,
        "Cells": [
          1,
          "Первичная (вскр. пласта)",
          183,
          null,
          null,
          null,
          null
        ]
      },
      {
        "ID": null,
        "Cells": [
          2,
          "Повторная (перест. пласта)",
          183,
          null,
          null,
          null,
          null
        ]
      },
      {
        "ID": null,
        "Cells": [
          11,
          "Переход на др. горизонты",
          183,
          null,
          null,
          null,
          null
        ]
      },
      {
        "ID": null,
        "Cells": [
          12,
          "Приобщение пласта",
          183,
          null,
          null,
          null,
          null
        ]
      },
      {
        "ID": null,
        "Cells": [
          13,
          "Дострел пласта",
          183,
          null,
          null,
          null,
          null
        ]
      },
      {
        "ID": null,
        "Cells": [
          14,
          "ГРП (Гидроразрыв пласта)",
          183,
          null,
          null,
          null,
          null
        ]
      },
      {
        "ID": null,
        "Cells": [
          15,
          "ГПП (Г/Пескостр. перфор.)",
          183,
          null,
          null,
          null,
          null
        ]
      },
      {
        "ID": null,
        "Cells": [
          16,
          "OПЗ (Oбработ. призаб. зоны)",
          183,
          null,
          null,
          null,
          null
        ]
      },
      {
        "ID": null,
        "Cells": [
          17,
          "Cоздание каверн",
          183,
          null,
          null,
          null,
          null
        ]
      },
      {
        "ID": null,
        "Cells": [
          19,
          "Cпецперфорация",
          183,
          null,
          null,
          null,
          null
        ]
      },
      {
        "ID": null,
        "Cells": [
          20,
          "Возврат",
          183,
          null,
          null,
          null,
          null
        ]
      },
      {
        "ID": null,
        "Cells": [
          21,
          "Открытый забой",
          183,
          null,
          null,
          null,
          null
        ]
      },
      {
        "ID": null,
        "Cells": [
          22,
          "Создание цементного моста",
          183,
          null,
          null,
          null,
          null
        ]
      },
      {
        "ID": null,
        "Cells": [
          31,
          "Изоляционные работы",
          183,
          null,
          null,
          null,
          null
        ]
      },
      {
        "ID": null,
        "Cells": [
          32,
          "Oтключение гориз., пласта",
          183,
          null,
          null,
          null,
          null
        ]
      },
      {
        "ID": null,
        "Cells": [
          33,
          "Крепление призаб. зоны",
          183,
          null,
          null,
          null,
          null
        ]
      },
      {
        "ID": null,
        "Cells": [
          34,
          "Ликвидация скважины",
          183,
          null,
          null,
          null,
          null
        ]
      },
      {
        "ID": null,
        "Cells": [
          35,
          "Опр. искусственного забоя",
          183,
          null,
          null,
          null,
          null
        ]
      },
      {
        "ID": null,
        "Cells": [
          36,
          "Опробование пласта",
          183,
          null,
          null,
          null,
          null
        ]
      },
      {
        "ID": null,
        "Cells": [
          41,
          "Обеспечение притока",
          183,
          null,
          null,
          null,
          null
        ]
      },
      {
        "ID": null,
        "Cells": [
          42,
          "Раcширение интервала перфораци",
          183,
          null,
          null,
          null,
          null
        ]
      },
      {
        "ID": null,
        "Cells": [
          43,
          "Перестрел пласта с ОПЗ",
          183,
          null,
          null,
          null,
          null
        ]
      },
      {
        "ID": null,
        "Cells": [
          99,
          "Неопределён",
          183,
          null,
          null,
          null,
          null
        ]
      }
    ],
    "dataPart": false,
    "editable": true
  },
  "tableID": "199",
  "query": {
    "maxRowCount": 5000,
    "filters": null,
    "order": []
  }
}
