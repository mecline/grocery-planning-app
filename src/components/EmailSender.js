import emailjs from '@emailjs/browser';
import { Button, TextField, Typography } from '@mui/material';
import React from 'react';
import { auth } from '../firebase/firebase';
import { StyledContainer, textColor } from '../theme/MealPlannerTheme';

class EmailSender extends React.Component {
    constructor() {
        super();
        this.state = {
            currentUser: auth.currentUser,
            toEmail: auth.currentUser.email ? auth.currentUser.email : null,
        };
        this.message = '';
    }

    handleEmailSend = (e) => {
        e.preventDefault();
        this.message = '';
        this.props.listMessage && this.displayListHTMLMessage(this.props.listMessage);
        let templateVariables = {
            toName: this.state.currentUser.displayName,
            toEmail: this.state.toEmail,
            message: this.message
        }

        // this.displayListHTMLMessage(this.props.listMessage);
        console.log(templateVariables.message)

        // emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
        emailjs.send(`${process.env.REACT_APP_EMAILJS_SERVICE_ID}`,
            `${process.env.REACT_APP_EMAILJS_TEMPLATE}`,
            templateVariables,
            `${process.env.REACT_APP_EMAILJS_PUBLIC_KEY}`
        )
            .then(result => {
                alert('Message Sent, I\'ll get back to you shortly', result.text);
            },
                error => {
                    alert('An error occured, Plese try again', error.text)
                })
    }

    handleToEmailChange = (e) => {
        this.setState({ toEmail: e.target.value });
    }

    displayListContents = (item, categoryFlag) => {
        let category = categoryFlag ? item.category : '';
        let notes = this.props.notesEnabled ? ('Notes: ' + item.notes) : '';
        let quantity = item.quantity > 1 ? '(' + item.quantity + ')' : ''

        return (`<h3>${category}</h3><li>${quantity} ${item.ingredientName} <i>${notes}</i></li>`)
    }

    displayListHTMLMessage = (listMessage) => {
        listMessage.map((item, i) => {
            if (i === 0) {
                this.message = this.message + (this.displayListContents(item, true));
                return this.displayListContents(item, true);
            }
            else {
                let prevItem = listMessage[i - 1];
                if (prevItem.category !== item.category) {
                    this.message = this.message + (this.displayListContents(item, true));
                    return this.displayListContents(item, true); // true flag for category name posting
                }
                else if (prevItem.category === item.category) {
                    this.message = this.message + (this.displayListContents(item, false));
                    return this.displayListContents(item, false);
                }
            }
            return listMessage;
        })
    }


    render() {

        return (
            <div style={{ display: 'inline-grid', padding: '25px' }}>
                <StyledContainer>
                    <Typography style={{ paddingTop: '25px', fontSize: 'large', fontWeight: 'bold', color: textColor }
                    } > Send list</ Typography>
                    <TextField name="to_email" style={{ marginBottom: '10px' }}
                        id="outlined"
                        label="Email"
                        onChange={this.handleToEmailChange}
                        defaultValue={this.state.currentUser.email}
                    />

                    <Button variant='outlined' style={{ color: textColor, marginBottom: '10px' }}
                        onClick={(event) => this.handleEmailSend(event)}>
                        Submit
                    </Button>
                </StyledContainer>
            </div>
        )
    }
}

export default EmailSender;