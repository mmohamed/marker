import React from 'react';
import PropTypes from 'prop-types';
import { Popover, Image } from 'react-bootstrap';

class Tooltip extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            view: props.view,
            title: props.title,
            id: props.id,
            logo: props.logo,
            content: props.content,
            links: props.links
        };
    }

    render(){    
        // remove custom props
        let popoverProps = {...this.props}
        delete popoverProps.view;
        return(                                          
            <Popover {...popoverProps}>
                <Popover.Title as="h3">{this.state.title ? this.state.title : (!this.state.view && 'No title for #'+this.state.id)}</Popover.Title>
                <Popover.Content>
                    {this.state.logo !== '' && 
                        <>
                            <div>
                                <Image style={{mawWidth: 180, maxHeight: 180}} src={this.state.logo} fluid />
                            </div>
                            <hr/>
                        </>
                    }                      
                    {this.state.content ? this.state.content : (!this.state.view && 'No content for #'+this.state.id)}
                    {(!this.state.view || this.state.content) && 
                        <hr/>
                    }
                    <ul>
                    {this.state.links.map((link, i) => {
                        if(link.url !== '' && link.label !== ''){
                            return (<li id={"link-view" + i}><a rel="noreferrer" target="_blank" href={link.url}>{link.label}</a></li>)
                        }
                        return '';
                    })}
                    </ul>
                </Popover.Content>
            </Popover>                                 
        )
    }
}

Tooltip.propTypes = {
    view : PropTypes.bool,
    title: PropTypes.string,
    id: PropTypes.number.isRequired,
    logo: PropTypes.string,
    content: PropTypes.string,
    links: PropTypes.array
};

Tooltip.defaultProps = {
    links: [],
    view: false
};

export default Tooltip;