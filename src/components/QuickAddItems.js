import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Button, 
    TextField, 
    MenuItem, 
    IconButton, 
    Typography,
    Paper,
    Divider,
    Collapse
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { CATEGORIES } from '../data/Categories.js';
import { auth, firebaseDb } from '../firebase/firebase.js';
import { backgroundColor, textColor } from '../theme/MealPlannerTheme';
import { v4 as uuidv4 } from 'uuid';
import Chip from '@mui/material/Chip';

// Create a class-based component for better state management
class QuickAddItems extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded: props.defaultExpanded !== undefined ? props.defaultExpanded : true,
            itemName: '',
            category: 'Other',
            quantity: 1,
            notes: '',
            loading: false,
            standaloneItems: []
        };
    }

    componentDidMount() {
        // Fetch existing standalone items
        const user = auth.currentUser;
        const standaloneItemsRef = firebaseDb.database().ref(`users/${user.uid}/meals/standalone_items`);
        
        this.standaloneItemsListener = standaloneItemsRef.on('value', (snapshot) => {
            if (snapshot.exists() && snapshot.val().ingredients) {
                this.setState({ standaloneItems: snapshot.val().ingredients });
            } else {
                this.setState({ standaloneItems: [] });
            }
        });
    }

    componentWillUnmount() {
        // Clean up listeners
        if (this.standaloneItemsListener) {
            const user = auth.currentUser;
            const standaloneItemsRef = firebaseDb.database().ref(`users/${user.uid}/meals/standalone_items`);
            standaloneItemsRef.off('value', this.standaloneItemsListener);
        }
    }

    handleToggleExpand = (e) => {
        if (e) e.stopPropagation(); // Stop propagation only if event is provided
        this.setState(prevState => ({ expanded: !prevState.expanded }));
    };

    handleInputChange = (field, value) => {
        this.setState({ [field]: value });
    };

    handleAddItem = async () => {
        const { itemName, category, quantity, notes } = this.state;
        
        if (!itemName.trim()) return;
        
        // Store expanded state before operation
        const currentExpanded = this.state.expanded;
        
        this.setState({ loading: true });
        const user = auth.currentUser;
        
        // Create a unique ID for the item
        const itemId = uuidv4();
        
        // Create the item object
        const newItem = {
            ingredientId: itemId,
            ingredientName: itemName.trim(),
            category: category,
            quantity: parseInt(quantity, 10) || 1,
            notes: notes.trim()
        };

        try {
            // First, save to ingredients collection if it doesn't exist already
            await firebaseDb.database().ref(`users/${user.uid}/ingredients/${itemId}`).set({
                ingredientName: itemName.trim(),
                category: category,
                notes: notes.trim()
            });

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

            // Create a special meal for standalone items if it doesn't exist
            const standaloneItemsMealRef = firebaseDb.database().ref(`users/${user.uid}/meals/standalone_items`);
            let standaloneItemsMeal;
            
            await standaloneItemsMealRef.once('value', async snapshot => {
                if (snapshot.exists()) {
                    // Get existing ingredients
                    standaloneItemsMeal = snapshot.val();
                    
                    // Check if this item already exists in the standalone meal
                    let ingredients = standaloneItemsMeal.ingredients || [];
                    const existingItemIndex = ingredients.findIndex(item => 
                        item.ingredientName && item.ingredientName.toLowerCase() === itemName.trim().toLowerCase());
                    
                    if (existingItemIndex >= 0) {
                        // Update quantity if item exists
                        ingredients[existingItemIndex].quantity += parseInt(quantity, 10) || 1;
                        ingredients[existingItemIndex].notes = notes.trim();
                    } else {
                        // Add new item
                        ingredients.push(newItem);
                    }
                    
                    // Update the meal with new/updated ingredients
                    await standaloneItemsMealRef.update({
                        ingredients: ingredients
                    });
                } else {
                    // Create the standalone items meal
                    await standaloneItemsMealRef.set({
                        mealTitle: "Standalone Items",
                        ingredients: [newItem]
                    });
                }
            });
            
            // Make sure standalone_items is in the selected meals
            if (!selectedMeals.includes('standalone_items')) {
                selectedMeals.push('standalone_items');
                await firebaseDb.database().ref(`users/${user.uid}`).update({
                    selectedMeals: selectedMeals
                });
            }
            
            // Reset form
            this.setState({
                itemName: '',
                category: 'Other',
                quantity: 1,
                notes: '',
                // Restore expanded state
                expanded: currentExpanded
            });
            
            // Notify parent component
            if (this.props.onItemAdded) {
                this.props.onItemAdded();
            }
        } catch (error) {
            console.error("Error adding quick item:", error);
            // Restore expanded state on error too
            this.setState({ expanded: currentExpanded });
        } finally {
            this.setState({ loading: false });
        }
    };
    
    handleDeleteItem = async (event, itemId) => {
        // Stop event propagation to prevent the chip click handler from firing
        if (event) event.stopPropagation();
        
        // Store expanded state before operation
        const currentExpanded = this.state.expanded;
        
        const user = auth.currentUser;
        const standaloneItemsMealRef = firebaseDb.database().ref(`users/${user.uid}/meals/standalone_items`);
        
        try {
            // Get current standalone items
            const snapshot = await standaloneItemsMealRef.once('value');
            if (snapshot.exists()) {
                const meal = snapshot.val();
                const ingredients = meal.ingredients || [];
                
                // Filter out the item to delete
                const updatedIngredients = ingredients.filter(item => item.ingredientId !== itemId);
                
                // Update the meal with filtered ingredients
                await standaloneItemsMealRef.update({
                    ingredients: updatedIngredients
                });
                
                // Notify parent component
                if (this.props.onItemAdded) {
                    this.props.onItemAdded();
                }
                
                // Restore expanded state
                this.setState({ expanded: currentExpanded });
            }
        } catch (error) {
            console.error("Error deleting item:", error);
            // Restore expanded state on error too
            this.setState({ expanded: currentExpanded });
        }
    };
    
    handleIncreaseQuantity = (event, item) => {
        // Stop event propagation
        if (event) event.stopPropagation();
        
        // Store expanded state before operation
        const currentExpanded = this.state.expanded;
        
        // Create updated item with increased quantity
        const updatedItem = {
            ...item,
            quantity: (item.quantity || 1) + 1
        };
        
        // Update the standalone items in Firebase
        const user = auth.currentUser;
        const standaloneItemsRef = firebaseDb.database().ref(
            `users/${user.uid}/meals/standalone_items/ingredients`
        );
        
        standaloneItemsRef.once('value', snapshot => {
            if (snapshot.exists()) {
                const items = snapshot.val();
                const updatedItems = items.map(i => 
                    i.ingredientId === item.ingredientId ? updatedItem : i
                );
                standaloneItemsRef.set(updatedItems);
                
                // Notify parent component
                if (this.props.onItemAdded) {
                    this.props.onItemAdded();
                }
                
                // Restore expanded state
                this.setState({ expanded: currentExpanded });
            }
        });
    };
    
    render() {
        const { expanded, itemName, category, quantity, notes, loading, standaloneItems } = this.state;
        const { isMobile } = this.props;
        
        // Group standalone items by category
        const groupedItems = {};
        standaloneItems.forEach(item => {
            if (!item || !item.category) return;
            
            if (!groupedItems[item.category]) {
                groupedItems[item.category] = [];
            }
            groupedItems[item.category].push(item);
        });

        return (
            <Paper
                elevation={2}
                sx={{
                    mb: 3,
                    borderRadius: '8px',
                    overflow: 'hidden'
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                        backgroundColor: backgroundColor,
                        color: textColor,
                        cursor: 'pointer'
                    }}
                    onClick={this.handleToggleExpand}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AddIcon sx={{ mr: 1 }} />
                        <Typography variant="subtitle1" fontWeight="medium">
                            Quick Add Items
                        </Typography>
                    </Box>
                    <IconButton 
                        size="small" 
                        sx={{ color: textColor }}
                        onClick={(e) => {
                            e.stopPropagation();
                            this.handleToggleExpand();
                        }}
                    >
                        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </Box>

                <Collapse in={expanded}>
                    <Box sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
                            <TextField
                                label="Item Name"
                                value={itemName}
                                onChange={(e) => this.handleInputChange('itemName', e.target.value)}
                                fullWidth
                                variant="outlined"
                                size="small"
                                sx={{ flex: 2 }}
                                onClick={(e) => e.stopPropagation()}
                            />
                            
                            <TextField
                                select
                                label="Category"
                                value={category}
                                onChange={(e) => this.handleInputChange('category', e.target.value)}
                                fullWidth
                                variant="outlined"
                                size="small"
                                sx={{ flex: 1 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {CATEGORIES.sort((a, b) => a.name > b.name ? 1 : -1).map((item) => (
                                    <MenuItem key={item.id} value={item.name}>{item.name}</MenuItem>
                                ))}
                            </TextField>
                            
                            <TextField
                                label="Quantity"
                                type="number"
                                value={quantity}
                                onChange={(e) => this.handleInputChange('quantity', e.target.value)}
                                inputProps={{ min: 1 }}
                                fullWidth
                                variant="outlined"
                                size="small"
                                sx={{ flex: 0.5 }}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                            <TextField
                                label="Notes (optional)"
                                value={notes}
                                onChange={(e) => this.handleInputChange('notes', e.target.value)}
                                fullWidth
                                variant="outlined"
                                size="small"
                                sx={{ flex: 3 }}
                                onClick={(e) => e.stopPropagation()}
                            />
                            
                            <Button
                                variant="contained"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    this.handleAddItem();
                                }}
                                disabled={!itemName.trim() || loading}
                                sx={{
                                    backgroundColor: backgroundColor,
                                    color: textColor,
                                    '&:hover': {
                                        backgroundColor: backgroundColor,
                                        opacity: 0.9
                                    },
                                    flex: 1
                                }}
                            >
                                {loading ? 'Adding...' : 'Add to List'}
                            </Button>
                        </Box>
                        
                        {standaloneItems.length > 0 && (
                            <Box sx={{ mt: 3 }}>
                                <Divider sx={{ mb: 2 }} />
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                                    Current Standalone Items:
                                </Typography>
                                
                                <Box sx={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {Object.entries(groupedItems).map(([category, items]) => (
                                        <Box key={category} sx={{ mb: 2 }}>
                                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                                {category}
                                            </Typography>
                                            
                                            <Box sx={{ 
                                                display: 'flex', 
                                                flexWrap: 'wrap', 
                                                gap: 0.5, 
                                                p: 1 
                                            }}>
                                                {items.map((item) => (
                                                    <Chip
                                                        key={item.ingredientId}
                                                        label={
                                                            <span>
                                                                {item.quantity > 1 && 
                                                                    <span style={{ marginRight: '4px' }}>
                                                                        ({item.quantity})
                                                                    </span>
                                                                }
                                                                {item.ingredientName}
                                                            </span>
                                                        }
                                                        onClick={(e) => this.handleIncreaseQuantity(e, item)}
                                                        onDelete={(e) => this.handleDeleteItem(e, item.ingredientId)}
                                                        sx={{
                                                            backgroundColor: backgroundColor,
                                                            color: textColor,
                                                            m: 0.5,
                                                            height: 'auto',
                                                            '& .MuiChip-deleteIcon': {
                                                                color: textColor
                                                            }
                                                        }}
                                                        size={isMobile ? "small" : "medium"}
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Collapse>
            </Paper>
        );
    }
}

export default QuickAddItems;