import emailjs from '@emailjs/browser';
import { Button, TextField, Typography, Box, Paper, IconButton, InputAdornment, useMediaQuery, useTheme } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import EmailIcon from '@mui/icons-material/Email';
import React, { useContext } from 'react';
import { auth } from '../firebase/firebase';
import { textColor, backgroundColor } from '../theme/MealPlannerTheme';

const EmailSenderWrapper = (props) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    return <EmailSender {...props} isMobile={isMobile} />;
};

class EmailSender extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentUser: auth.currentUser,
            toEmail: auth.currentUser.email ? auth.currentUser.email : '',
            sending: false,
            success: false,
            error: null
        };
        this.message = '';
    }

    handleEmailSend = (e) => {
        e.preventDefault();
        this.setState({ sending: true, error: null });
        
        this.message = '';
        this.props.listMessage && this.displayListHTMLMessage(this.props.listMessage);
        
        let templateVariables = {
            toName: this.state.currentUser.displayName || 'Shopper',
            toEmail: this.state.toEmail,
            message: this.message
        }

        // emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
        emailjs.send(`${process.env.REACT_APP_EMAILJS_SERVICE_ID}`,
            `${process.env.REACT_APP_EMAILJS_TEMPLATE}`,
            templateVariables,
            `${process.env.REACT_APP_EMAILJS_PUBLIC_KEY}`
        )
            .then(result => {
                this.setState({ sending: false, success: true });
                setTimeout(() => this.props.closeCallback(), 1500);
            },
            error => {
                this.setState({ 
                    sending: false, 
                    error: 'Failed to send email. Please try again.' 
                });
            });
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
        });
    }

    render() {
        const { sending, success, error } = this.state;
        const { isMobile = false } = this.props;

        return (
            <Box sx={{ 
                p: isMobile ? 2 : 4, 
                width: isMobile ? '95vw' : '400px',
                maxWidth: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <Typography 
                    variant={isMobile ? "h6" : "h5"} 
                    sx={{ 
                        mb: isMobile ? 2 : 3, 
                        color: textColor,
                        fontWeight: 'bold'
                    }}
                >
                    Send Shopping List
                </Typography>
                
                <Paper
                    elevation={0}
                    sx={{
                        p: isMobile ? 2 : 3,
                        width: '100%',
                        backgroundColor: '#f7f7f7',
                        borderRadius: '8px',
                        mb: isMobile ? 2 : 3
                    }}
                >
                    <Box component="form" onSubmit={this.handleEmailSend}>
                        <TextField
                            name="to_email"
                            label="Email Address"
                            variant="outlined"
                            fullWidth
                            value={this.state.toEmail}
                            onChange={this.handleToEmailChange}
                            required
                            sx={{ mb: isMobile ? 2 : 3 }}
                            size={isMobile ? "small" : "medium"}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailIcon sx={{ color: textColor }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={sending}
                            fullWidth
                            endIcon={<SendIcon />}
                            size={isMobile ? "small" : "medium"}
                            sx={{
                                backgroundColor: backgroundColor,
                                color: textColor,
                                py: isMobile ? 1 : 1.5,
                                '&:hover': {
                                    backgroundColor: backgroundColor,
                                    opacity: 0.9
                                }
                            }}
                        >
                            {sending ? 'Sending...' : 'Send Shopping List'}
                        </Button>
                        
                        {success && (
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    color: 'green', 
                                    textAlign: 'center', 
                                    mt: 2 
                                }}
                            >
                                Email sent successfully!
                            </Typography>
                        )}
                        
                        {error && (
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    color: 'error.main', 
                                    textAlign: 'center', 
                                    mt: 2 
                                }}
                            >
                                {error}
                            </Typography>
                        )}
                    </Box>
                </Paper>
                
                <Typography 
                    variant="body2" 
                    sx={{ 
                        textAlign: 'center', 
                        color: 'text.secondary', 
                        fontStyle: 'italic' 
                    }}
                >
                    Your shopping list will be sent to the email address provided.
                </Typography>
            </Box>
        );
    }
}

export default EmailSenderWrapper;