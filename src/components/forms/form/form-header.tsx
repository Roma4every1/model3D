import { Toolbar, ToolbarItem } from "@progress/kendo-react-buttons";

// используется только в dataset-view.js

export default function FormHeader({formData, additionalButtons}) {
  return (
    <div className="blockheader">
      <Toolbar className="blockheadertoolbar">
        <ToolbarItem>{additionalButtons}</ToolbarItem>
        <ToolbarItem>
          <h5>{formData.displayName}</h5>
        </ToolbarItem>
      </Toolbar>
    </div>
  );
}
