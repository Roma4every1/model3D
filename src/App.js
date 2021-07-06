import React, { Component } from 'react';
import { PresentationList } from './components/PresentationList';
import './custom.css'

export default class App extends Component {
    static displayName = App.name;

    constructor(props) {
        super(props);
        this.state = { imgPath: process.env.PUBLIC_URL + '/images/carat.PNG' };
    }

    render() {
        return (
            <table>
                <tr>
                    <td align="left" width="25%">
                        <PresentationList selectionChanged={(event, value) => {
                            const index = value.indexOf('_');
                            if (index >= 0) {
                                const substr = value.slice(index + 1);
                                this.setState({ imgPath: process.env.PUBLIC_URL + '/images/' + substr + '.PNG' });
                            }
                        }
                        }
                        />
                    </td>
                    <td align="right" width="80%">
                        <img src={this.state.imgPath} alt="logo" />
                    </td>
                </tr>
            </table>
        );
    }
}
