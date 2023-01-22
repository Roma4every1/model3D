import { Toolbar } from "@progress/kendo-react-buttons";

// используется только в dataset-view.js

export const DataSetEditToolbar = ({buttons}) => {
  return (
    <div className={'blockheader'}>
      <Toolbar className={'blockheadertoolbar'}>{buttons}</Toolbar>
    </div>
  );
};
