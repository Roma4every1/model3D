import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';

export class FormsContainer extends Component {

    render() {
        if (this.props.children.length === 1) {
            return (<div>
                {this.props.children}
            </div>);
        }

        if (this.props.children.length === 2) {
            return (<Grid container spacing={1}>
                <Grid container item xs={12} spacing={1}>
                    <Grid item xs={6}>
                        <div className="halfheight">
                            {this.props.children[0]}
                        </div>
                    </Grid>
                    <Grid item xs={6}>
                        <div>
                            {this.props.children[1]}
                        </div>
                    </Grid>
                </Grid>
            </Grid>);
        }

        if (this.props.children.length === 3) {
            return (<Grid container spacing={1}>
                <Grid container item xs={12} spacing={1}>
                    <Grid item xs={6} spacing={1}>
                        <div>
                            {this.props.children[0]}
                        </div>
                    </Grid>
                    <Grid item xs={6} spacing={1}>
                        <div>
                            {this.props.children[1]}
                        </div>
                    </Grid>
                </Grid>
                <Grid container item xs={12} spacing={1}>
                    <Grid item xs={12} spacing={1}>
                        <div>
                            {this.props.children[2]}
                        </div>
                    </Grid>
                </Grid>
            </Grid>);
        }

        if (this.props.children.length === 4) {
            return (<Grid container spacing={1}>
                <Grid container item xs={12} spacing={1}>
                    <Grid item xs={6} spacing={1}>
                        <div>
                            {this.props.children[0]}
                        </div>
                    </Grid>
                    <Grid item xs={6} spacing={1}>
                        <div>
                            {this.props.children[1]}
                        </div>
                    </Grid>
                </Grid>
                <Grid container item xs={12} spacing={1}>
                    <Grid item xs={6} spacing={1}>
                        <div>
                            {this.props.children[2]}
                        </div>
                    </Grid>
                    <Grid item xs={6} spacing={1}>
                        <div>
                            {this.props.children[3]}
                        </div>
                    </Grid>
                </Grid>
            </Grid>);
        }

        if (this.props.children.length === 5) {
            return (<Grid container spacing={1}>
                <Grid container item xs={12} spacing={1}>
                    <Grid item xs={6} spacing={1}>
                        <div>
                            {this.props.children[0]}
                        </div>
                    </Grid>
                    <Grid item xs={6} spacing={1}>
                        <div>
                            {this.props.children[1]}
                        </div>
                    </Grid>
                </Grid>
                <Grid container item xs={12} spacing={1}>
                    <Grid item xs={4} spacing={1}>
                        <div>
                            {this.props.children[2]}
                        </div>
                    </Grid>
                    <Grid item xs={4} spacing={1}>
                        <div>
                            {this.props.children[3]}
                        </div>
                    </Grid>
                    <Grid item xs={4} spacing={1}>
                        <div>
                            {this.props.children[4]}
                        </div>
                    </Grid>
                </Grid>
            </Grid>);
        }

        return (
            <div>
                {this.props.children}
            </div>
        );
    }
}
