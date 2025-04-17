import { CheckBox, CheckBoxOutlineBlank, DeleteOutline } from '@mui/icons-material';
import { Container, Dialog, IconButton, Typography, Paper, Tooltip, Box, useMediaQuery, useTheme, Button } from '@mui/material';
import React from 'react';
import EmailSender from '../components/EmailSender.js';
import ListModal from '../components/ListModal.js';
import QuickAddItems from '../components/QuickAddItems.js';
import PantryItems from '../components/PantryItems.js';
import { auth, firebaseDb } from '../firebase/firebase.js';
import { backgroundColor, StyledAddBox, textColor } from '../theme/MealPlannerTheme';
import EmailIcon from '@mui/icons-material/Email';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { List, ListItem, ListItemText } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

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
            listModal: false,
            clearConfirmOpen: false,
            refreshKey: 0 // Add a refresh key to force re-render when needed
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

    // Force a refresh of the component
    refreshList = () => {
        this.setState(prevState => ({ refreshKey: prevState.refreshKey + 1 }));
    }

    // Handle adding pantry items to the shopping list
    handleAddPantryItems = async (items) => {
        if (!items || items.length === 0) return;
        
        const user = this.state.user;
        
        try {
            // Get current selected meals to preserve them
            let selectedMeals = [];
            const selectedMealsRef = firebaseDb.database().ref(`users/${user.uid}/selectedMeals`);
            await selectedMealsRef.once('value', snapshot => {
                if (snapshot.exists()) {
                    snapshot.forEach(child => {
                        selectedMeals.push(child.val());
                    });
                }
            });
            
            // Make sure standalone_items is in the selected meals
            if (!selectedMeals.includes('standalone_items')) {
                selectedMeals.push('standalone_items');
            }
            
            // Get current standalone items
            const standaloneItemsRef = firebaseDb.database().ref(`users/${user.uid}/meals/standalone_items`);
            let existingItems = [];
            
            await standaloneItemsRef.once('value', snapshot => {
                if (snapshot.exists() && snapshot.val().ingredients) {
                    existingItems = snapshot.val().ingredients;
                }
            });
            
            // Merge existing items with new items
            items.forEach(newItem => {
                const existingItemIndex = existingItems.findIndex(item => 
                    item.ingredientId === newItem.ingredientId);
                
                if (existingItemIndex >= 0) {
                    // Update existing item quantity
                    existingItems[existingItemIndex].quantity += newItem.quantity;
                } else {
                    // Add new item
                    existingItems.push(newItem);
                }
            });
            
            // Update standalone items
            await standaloneItemsRef.update({
                mealTitle: "Standalone Items",
                ingredients: existingItems
            });
            
            // Update selected meals
            await firebaseDb.database().ref(`users/${user.uid}`).update({
                selectedMeals: selectedMeals
            });
            
            // Refresh the list
            this.refreshList();
        } catch (error) {
            console.error("Error adding pantry items:", error);
        }
    }

    // Open clear list confirmation dialog
    handleClearListClick = () => {
        this.setState({ clearConfirmOpen: true });
    }

    // Close clear list confirmation dialog
    handleClearListCancel = () => {
        this.setState({ clearConfirmOpen: false });
    }

    // Clear the shopping list
    handleClearList = async () => {
        try {
            const user = this.state.user;
            
            // Clear selected meals
            await firebaseDb.database().ref(`users/${user.uid}`).update({
                selectedMeals: []
            });
            
            // Refresh the list
            this.refreshList();
            
            // Close the dialog
            this.setState({ clearConfirmOpen: false });
        } catch (error) {
            console.error("Error clearing shopping list:", error);
        }
    }

    render() {
        let db = firebaseDb.database();
        let selectedDbRef = db.ref(`users/${this.state.user.uid}/selectedMeals`);
        let selectedMeals = [];
        let shoppingList = [];
        let ingredientsList = [];
        let mealTitles = [];
        const { isMobile } = this.props;

        selectedDbRef.on('value', (snapshot) => {
            // This ensures we get an updated list of selected meals
            selectedMeals = [];
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    selectedMeals.push(childSnapshot.val());
                });
            }
        });

        // Getting the meal object from the user's meal collection if the meal is selected
        // Adds meal to shoppingList if it is found, so shoppingList now can access ingredients
        db.ref(`users/${this.state.user.uid}/meals`).on('value', (snapshot) => {
            shoppingList = [];
            mealTitles = [];
            
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const meal = childSnapshot.key;
                    if (selectedMeals.includes(meal)) {
                        // Don't display "Standalone Items" in the meal titles list
                        if (meal !== 'standalone_items' || childSnapshot.val().mealTitle !== "Standalone Items") {
                            mealTitles.push(childSnapshot.val().mealTitle);
                        }
                        shoppingList.push(childSnapshot.val());
                    }
                });
            }
        });

        // Extract all ingredients from the shopping list meals
        ingredientsList = [];
        shoppingList.forEach((listItem) => {
            if (listItem.ingredients && Array.isArray(listItem.ingredients)) {
                listItem.ingredients.forEach((item) => {
                    ingredientsList.push(item);
                });
            }
        });

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
            }} key={this.state.refreshKey}>
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
                            mb: 2,
                            flexWrap: 'wrap'
                        }}>
                            {/* Add Meal Button - Moved before Enable Notes */}
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mr: 3,
                                mb: isMobile ? 1 : 0
                            }}>
                                <IconButton 
                            onClick={() => this.handleSelectMeals()} 
                            size={isMobile ? "medium" : "large"}
                        >
                            <StyledAddBox sx={{ color: textColor }} />
                        </IconButton>
                        <Typography 
                            variant={isMobile ? "body2" : "body1"}
                            sx={{ color: textColor }}
                        >
                            Add Meal(s) To List
                        </Typography>
                            </Box>
                            
                            {/* Enable Notes Checkbox */}
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                mr: 3,
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
                            
                            {/* Action Buttons */}
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

                                <Tooltip title="Clear Shopping List">
                                    <IconButton 
                                        onClick={this.handleClearListClick} 
                                        sx={{ mr: 1 }}
                                        size={isMobile ? "medium" : "large"}
                                        disabled={ingredientsList.length === 0}
                                    >
                                        <ClearAllIcon style={{ color: ingredientsList.length === 0 ? '#ccc' : textColor }} />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                        
                        {/* Selected Meals Section - Moved before Pantry and Quick Add */}
                        <Typography 
                            variant={isMobile ? "subtitle1" : "h6"} 
                            sx={{ mb: 1 }}
                        >
                            Selected Meals:
                        </Typography>
                        <Box sx={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            mb: 3
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
                        
                        {/* Add Pantry Items component - Default collapsed */}
                        <PantryItems 
                            onItemsSelected={this.handleAddPantryItems} 
                            isMobile={isMobile} 
                            defaultExpanded={false}
                        />
                        
                        {/* Add Quick Add Items component - Default collapsed */}
                        <QuickAddItems 
                            onItemAdded={this.refreshList} 
                            isMobile={isMobile}
                            defaultExpanded={true}
                        />
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

                {/* Clear List Confirmation Dialog */}
                <Dialog
                    open={this.state.clearConfirmOpen}
                    onClose={this.handleClearListCancel}
                    PaperProps={{
                        sx: { 
                            borderRadius: '8px',
                            width: isMobile ? '90%' : '400px'
                        }
                    }}
                >
                    <DialogTitle sx={{ 
                        color: textColor, 
                        fontSize: isMobile ? '18px' : '20px',
                        pt: 3
                    }}>
                        Clear Shopping List
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant="body1">
                            Are you sure you want to clear your entire shopping list? This will remove all selected meals and items.
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                            This action cannot be undone.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button 
                            onClick={this.handleClearListCancel}
                            sx={{ color: 'text.secondary' }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={this.handleClearList}
                            variant="contained" 
                            color="error"
                            sx={{ 
                                minWidth: '80px',
                                bgcolor: '#d32f2f',
                                '&:hover': {
                                    bgcolor: '#b71c1c'
                                }
                            }}
                        >
                            Clear List
                        </Button>
                    </DialogActions>
                </Dialog>

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