import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import { Container, Dialog, IconButton, Typography, Paper, Tooltip, Box, useMediaQuery, useTheme } from '@mui/material';
import React from 'react';
import EmailSender from '../components/EmailSender.js';
import ListModal from '../components/ListModal.js';
import { auth, firebaseDb } from '../firebase/firebase.js';
import { backgroundColor, textColor } from '../theme/MealPlannerTheme';
import EmailIcon from '@mui/icons-material/Email';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { List, ListItem, ListItemText } from '@mui/material';

const ListPageWrapper = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    return <ListPage isMobile={isMobile} />;
};

class ListPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: auth.currentUser,
            notesEnabled: false,
            sendEmailModal: false,
            listModal: false
        };
    }

    handleSelectMeals = () => {
        this.setState({ listModal: true });
    }

    handleEmailSend = () => {
        this.setState({ sendEmailModal: true });
    }

    handleNotesEnabled = () => {
        this.setState({ notesEnabled: !this.state.notesEnabled });
    }

    handleModalClose = (modalForClose) => {
        this.setState({
            [modalForClose]: false,
        });
    }

    handleSaveSelectedMeals = (selectedMeals) => {
        let uid = this.state.user.uid;
        let selectedMealTitles = selectedMeals.map((meal) => { return meal.mealId ? meal.mealId : meal });

        firebaseDb.database().ref(`users/${uid}`).update({
            selectedMeals: selectedMealTitles
        })

        this.setState({ listModal: false });
    }

    handleDuplicateIngredients = (ingredientsList) => {
        let ingredientDuplicateCheck = [];
        let quantityMap = new Map();
        let newList = [];
        let quantityExisting = 0;

        ingredientsList.forEach((item) => {
            if (ingredientDuplicateCheck.includes(item.ingredientId)) {
                if (quantityMap.has(item.ingredientId)) {
                    quantityExisting = quantityMap.get(item.ingredientId) + item.quantity;
                    quantityMap.set(item.ingredientId, quantityExisting);
                }
                else {
                    quantityMap.set(item.ingredientId, item.quantity);
                }
            }
            else {
                ingredientDuplicateCheck.push(item.ingredientId);
                newList.push(item)
            }
        })

        quantityMap.forEach(function (value, key) {
            newList.map((item) => {
                if (key === item.ingredientId) {
                    item.quantity += value
                }
                return newList;
            })
        })
        return newList;
    }

    render() {
        let db = firebaseDb.database();
        let selectedDbRef = db.ref(`users/${this.state.user.uid}/selectedMeals`);
        let selectedMeals = [];
        let shoppingList = [];
        let ingredientsList = [];
        let mealTitles = [];
        const { isMobile } = this.props;

        selectedDbRef.on('child_added', (snapshot) => {
            selectedMeals.push(snapshot.val());
        });

        // Getting the meal object from the user's meal collection if the meal is selected
        // Adds meal to shoppingList if it is found, so shoppingList now can access ingredients
        firebaseDb.database().ref(`users/${this.state.user.uid}/meals`).on('child_added', (snap) => {
            let meal = snap.key;
            if (~selectedMeals.indexOf(meal)) {
                mealTitles.push(snap.val().mealTitle)
                shoppingList.push(snap.val())
            }
        })

        shoppingList.map((listItem) => {
            return listItem.ingredients && listItem.ingredients.forEach((item) => {
                ingredientsList.push(item);
            })
        })

        ingredientsList = this.handleDuplicateIngredients(ingredientsList);
        
        // Group ingredients by category for more organized rendering
        const groupedIngredients = {};
        ingredientsList.sort((a, b) => a.category > b.category ? 1 : -1).forEach(item => {
            if (!groupedIngredients[item.category]) {
                groupedIngredients[item.category] = [];
            }
            groupedIngredients[item.category].push(item);
        });

        return (
            <Box sx={{ 
                p: isMobile ? 2 : 3,
                pt: isMobile ? 2 : 3,
                pb: isMobile ? 6 : 3, // Extra padding at bottom for mobile navigation
                minHeight: isMobile ? 'calc(100vh - 120px)' : 'calc(100vh - 140px)',
                boxSizing: 'border-box'
            }}>
                <Container sx={{ 
                    backgroundColor: 'white', 
                    borderRadius: '10px', 
                    p: isMobile ? 2 : 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <Box sx={{ mb: isMobile ? 2 : 3 }}>
                        <Typography 
                            variant={isMobile ? "h6" : "h5"} 
                            sx={{ 
                                mb: 2, 
                                color: textColor,
                                fontWeight: 'medium'
                            }}
                        >
                            Shopping List
                        </Typography>
                        
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: isMobile ? 'column' : 'row',
                            alignItems: isMobile ? 'flex-start' : 'center', 
                            mb: 2
                        }}>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                mb: isMobile ? 1 : 0
                            }}>
                                <Tooltip title={this.state.notesEnabled ? "Disable Notes" : "Enable Notes"}>
                                    <IconButton 
                                        onClick={() => this.handleNotesEnabled()} 
                                        size={isMobile ? "medium" : "large"}
                                    >
                                        {this.state.notesEnabled ? 
                                            <CheckBox style={{ color: textColor }} /> : 
                                            <CheckBoxOutlineBlank style={{ color: textColor }} />
                                        }
                                    </IconButton>
                                </Tooltip>
                                <Typography variant={isMobile ? "body2" : "body1"}>
                                    Enable Notes
                                </Typography>
                            </Box>
                            
                            <Box sx={{ 
                                display: 'flex',
                                ml: isMobile ? 0 : 'auto',
                                mt: isMobile ? 1 : 0
                            }}>
                                <Tooltip title="Send List by Email">
                                    <IconButton 
                                        onClick={() => this.handleEmailSend()} 
                                        sx={{ mr: 1 }}
                                        size={isMobile ? "medium" : "large"}
                                    >
                                        <EmailIcon style={{ color: textColor }} />
                                    </IconButton>
                                </Tooltip>
                                
                                <Tooltip title="Add Meals to List">
                                    <IconButton 
                                        onClick={() => this.handleSelectMeals()}
                                        size={isMobile ? "medium" : "large"}
                                    >
                                        <AddCircleIcon style={{ color: textColor }} />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                        
                        <Typography 
                            variant={isMobile ? "subtitle1" : "h6"} 
                            sx={{ mb: 1 }}
                        >
                            Selected Meals:
                        </Typography>
                        <Box sx={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            mb: 2
                        }}>
                            {mealTitles.length > 0 ? (
                                mealTitles.map((meal) => (
                                    <Box 
                                        key={meal} 
                                        sx={{
                                            display: 'inline-block', 
                                            borderRadius: '15px', 
                                            backgroundColor: backgroundColor, 
                                            color: textColor,
                                            width: 'fit-content', 
                                            px: 1.5, 
                                            py: 0.5, 
                                            mr: 1, 
                                            mb: 1,
                                            fontSize: isMobile ? '13px' : '16px'
                                        }}
                                    >
                                        {meal}
                                    </Box>
                                ))
                            ) : (
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        color: 'text.secondary', 
                                        fontStyle: 'italic'
                                    }}
                                >
                                    No meals selected. Add meals to generate a shopping list.
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    
                    <Box sx={{ 
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: isMobile ? 'calc(100vh - 300px)' : 'calc(100vh - 350px)',
                        overflow: 'hidden'
                    }}>
                        {ingredientsList.length > 0 ? (
                            <Paper 
                                elevation={2} 
                                sx={{ 
                                    p: isMobile ? 2 : 3,
                                    backgroundColor: '#ffffff',
                                    color: '#000000',
                                    fontFamily: 'Arial, sans-serif',
                                    flex: 1,
                                    overflowY: 'auto',
                                    borderRadius: '8px',
                                    maxHeight: '50vh'
                                }}
                            >
                                {Object.entries(groupedIngredients).map(([category, items]) => (
                                    <Box key={category} sx={{ mb: 3 }}>
                                        <Typography 
                                            variant={isMobile ? "subtitle1" : "h6"} 
                                            sx={{ 
                                                borderBottom: '1px solid #000',  
                                                pb: 1,
                                                mb: 1,
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {category}
                                        </Typography>
                                        <List dense>
                                            {items.map((item, idx) => (
                                                <ListItem 
                                                    key={`${item.ingredientId}-${idx}`} 
                                                    dense
                                                    sx={{
                                                        py: isMobile ? 0.5 : 1
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={
                                                            <Box sx={{
                                                                display: 'flex',
                                                                flexDirection: isMobile && item.notes && this.state.notesEnabled ? 'column' : 'row',
                                                                alignItems: isMobile && item.notes && this.state.notesEnabled ? 'flex-start' : 'center',
                                                                gap: 0.5
                                                            }}>
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center'
                                                                }}>
                                                                    {item.quantity > 1 && (
                                                                        <Typography 
                                                                            component="span" 
                                                                            sx={{ 
                                                                                mr: 0.5,
                                                                                fontSize: isMobile ? '14px' : '16px'
                                                                            }}
                                                                        >
                                                                            ({item.quantity})
                                                                        </Typography>
                                                                    )}
                                                                    <Typography 
                                                                        component="span" 
                                                                        sx={{ 
                                                                            fontWeight: '500',
                                                                            fontSize: isMobile ? '14px' : '16px'
                                                                        }}
                                                                    >
                                                                        {item.ingredientName}
                                                                    </Typography>
                                                                </Box>
                                                                {this.state.notesEnabled && item.notes && (
                                                                    <Typography
                                                                        component="span"
                                                                        sx={{ 
                                                                            fontStyle: 'italic', 
                                                                            ml: isMobile ? 0 : 1,
                                                                            color: '#555555',
                                                                            fontSize: isMobile ? '12px' : '14px',
                                                                            mt: isMobile ? 0.5 : 0
                                                                        }}
                                                                    >
                                                                        Notes: {item.notes}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        }
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>
                                ))}
                            </Paper>
                        ) : (
                            <Typography 
                                sx={{ 
                                    textAlign: 'center', 
                                    py: 6, 
                                    color: '#777',
                                    fontSize: isMobile ? '14px' : '16px',
                                    fontStyle: 'italic'
                                }}
                            >
                                No items in your shopping list. Add meals to generate a list.
                            </Typography>
                        )}
                    </Box>
                </Container>

                {this.state.listModal &&
                    <Dialog
                        open={this.state.listModal}
                        fullScreen={isMobile}
                        maxWidth="md"
                        onClose={() => this.handleModalClose('listModal')}>
                        <ListModal
                            db={db}
                            selectedMeals={selectedMeals}
                            closeCallback={() => this.handleModalClose('listModal')}
                            confirmCallback={this.handleSaveSelectedMeals}
                            isMobile={isMobile}
                        />
                    </Dialog>}

                {this.state.sendEmailModal &&
                    <Dialog
                        open={this.state.sendEmailModal}
                        fullScreen={isMobile}
                        maxWidth="sm"
                        onClose={() => this.handleModalClose('sendEmailModal')}>
                        <EmailSender
                            listMessage={ingredientsList.length > 1 ? ingredientsList : 'none'}
                            closeCallback={() => this.handleModalClose('sendEmailModal')}
                            notesEnabled={this.state.notesEnabled}
                            isMobile={isMobile}
                        />
                    </Dialog>}
            </Box>
        );
    }
}

export default ListPageWrapper;