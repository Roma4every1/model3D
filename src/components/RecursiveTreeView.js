import React, { Component } from 'react';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';

export class RecursiveTreeView extends Component {

    renderTree = (nodes) => (
        <TreeItem key={nodes.id} nodeId={nodes.nodeId} label={nodes.displayName}>
            {Array.isArray(nodes.children) ? nodes.children.map((node) => this.renderTree(node)) : null}
        </TreeItem>
    );

    render() {
        return (
            <TreeView
                onNodeSelect={this.props.onSelectionChanged}
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpanded={['root']}
                defaultExpandIcon={<ChevronRightIcon />}
            >
                {Array.isArray(this.props.data.children) ? this.props.data.children.map((node) => this.renderTree(node)) : null}
            </TreeView>
        )
    };
}