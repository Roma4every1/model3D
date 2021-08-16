import React from 'react';
import Paper from '@material-ui/core/Paper';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';

export default function RecursiveTreeView(props) {
    const renderTree = (nodes) => (
        <TreeItem key={nodes.id} nodeId={nodes.nodeId} label={nodes.displayName}>
            {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
        </TreeItem>
    );

    return (
        <Paper variant='outlined'>
            <TreeView style={{ height: '100%', overflow: "auto" }}
                onNodeSelect={props.onSelectionChanged}
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpanded={['root']}
                defaultExpandIcon={<ChevronRightIcon />}
            >
                {Array.isArray(props.data.children) ? props.data.children.map((node) => renderTree(node)) : null}
            </TreeView>
        </Paper>
    )
}