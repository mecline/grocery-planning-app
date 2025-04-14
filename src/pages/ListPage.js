import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import { Container, Dialog, IconButton, Typography, Paper, Tooltip } from '@mui/material';
import React from 'react';
import EmailSender from '../components/EmailSender.js';
import ListModal from '../components/ListModal.js';
import { auth, firebaseDb } from '../firebase/firebase.js';
import { backgroundColor, textColor } from '../theme/MealPlannerTheme';
import EmailIcon from '@mui/icons-material/Email';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { List, ListItem, ListItemText } from '@mui/material';

class ListPage extends React.Component {
    constructor() {
        super();
        this.state = {
            user: auth.currentUser,
            notesEnabled: false,
            sendEmailModal: false,
            listModal: false
        };
    }

    componentDidMount = () => {

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
            <div style={{ margin: '25px' }}>
                <Container style={{ backgroundColor: 'white', borderRadius: '10px ', padding: '20px' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <Typography variant="h5" style={{ marginBottom: '15px', color: textColor }}>Shopping List</Typography>
                        
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                            <Tooltip title={this.state.notesEnabled ? "Disable Notes" : "Enable Notes"}>
                                <IconButton onClick={() => this.handleNotesEnabled()} size="large">
                                    {this.state.notesEnabled ? 
                                        <CheckBox style={{ color: textColor }} /> : 
                                        <CheckBoxOutlineBlank style={{ color: textColor }} />
                                    }
                                </IconButton>
                            </Tooltip>
                            <Typography>Enable Notes</Typography>
                            
                            <div style={{ flex: 1 }}></div>
                            
                            <Tooltip title="Send List by Email">
                                <IconButton 
                                    onClick={() => this.handleEmailSend()} 
                                    style={{ marginRight: '10px' }}
                                    color="primary"
                                >
                                    <EmailIcon style={{ color: textColor }} />
                                </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Add Meals to List">
                                <IconButton 
                                    onClick={() => this.handleSelectMeals()}
                                    color="primary"
                                >
                                    <AddCircleIcon style={{ color: textColor }} />
                                </IconButton>
                            </Tooltip>
                        </div>
                        
                        <Typography variant="h6" style={{ marginBottom: '15px' }}>Selected Meals:</Typography>
                        <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '20px' }}>
                            {mealTitles.map((meal) => (
                                <div key={meal} style={{
                                    display: 'inline-block', 
                                    borderRadius: '15px', 
                                    backgroundColor: backgroundColor, 
                                    color: textColor,
                                    width: 'fit-content', 
                                    padding: '4px 12px', 
                                    marginRight: '8px', 
                                    marginBottom: '8px'
                                }}>
                                    {meal}
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {ingredientsList.length > 0 ? (
                        <Paper elevation={2} style={{ 
                            padding: '20px',
                            backgroundColor: '#ffffff',
                            color: '#000000',
                            fontFamily: 'Arial, sans-serif',
                            maxHeight: '50vh',
                            overflowY: 'auto',
                            borderRadius: '8px'
                        }}>
                            {Object.entries(groupedIngredients).map(([category, items]) => (
                                <div key={category} style={{ marginBottom: '20px' }}>
                                    <Typography 
                                        variant="h6" 
                                        style={{ 
                                            borderBottom: '1px solid #000',  
                                            paddingBottom: '8px',
                                            marginBottom: '8px',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {category}
                                    </Typography>
                                    <List dense>
                                        {items.map((item, idx) => (
                                            <ListItem key={`${item.ingredientId}-${idx}`} dense>
                                                <ListItemText
                                                    primary={
                                                        <span>
                                                            {item.quantity > 1 ? `(${item.quantity}) ` : ''}
                                                            <span style={{ fontWeight: '500' }}>{item.ingredientName}</span>
                                                            {this.state.notesEnabled && item.notes && 
                                                                <span style={{ 
                                                                    fontStyle: 'italic', 
                                                                    marginLeft: '8px',
                                                                    color: '#555555'
                                                                }}>
                                                                    Notes: {item.notes}
                                                                </span>
                                                            }
                                                        </span>
                                                    }
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </div>
                            ))}
                        </Paper>
                    ) : (
                        <Typography style={{ textAlign: 'center', padding: '30px', color: '#777' }}>
                            No items in your shopping list. Add meals to generate a list.
                        </Typography>
                    )}
                </Container>

                {this.state.listModal &&
                    <Dialog
                        open={this.state.listModal}
                        onClose={() => this.handleModalClose('listModal')}>
                        <ListModal
                            db={db}
                            selectedMeals={selectedMeals}
                            closeCallback={() => this.handleModalClose('listModal')}
                            confirmCallback={this.handleSaveSelectedMeals}
                        />
                    </Dialog>}

                {this.state.sendEmailModal &&
                    <Dialog
                        open={this.state.sendEmailModal}
                        onClose={() => this.handleModalClose('sendEmailModal')}>
                        <EmailSender
                            listMessage={ingredientsList.length > 1 ? ingredientsList : 'none'}
                            closeCallback={() => this.handleModalClose('sendEmailModal')}
                            notesEnabled={this.state.notesEnabled}
                        />
                    </Dialog>}
            </div>
        );
    }
}

export default ListPage;