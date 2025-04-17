import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Paper,
    Collapse,
    IconButton,
    Chip,
    TextField,
    InputAdornment,
    Button,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { auth, firebaseDb } from '../firebase/firebase.js';
import { backgroundColor, textColor } from '../theme/MealPlannerTheme';
import { CATEGORIES } from '../data/Categories.js';
import { v4 as uuidv4 } from 'uuid';

const PantryItems = ({ onItemsSelected, isMobile, defaultExpanded = true }) => {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const [pantryItems, setPantryItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [newItemCategory, setNewItemCategory] = useState('Other');
    const [newItemNotes, setNewItemNotes] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch pantry items on component mount
        const user = auth.currentUser;
        const pantryRef = firebaseDb.database().ref(`users/${user.uid}/pantry`);
        
        const handlePantryData = (snapshot) => {
            if (snapshot.exists()) {
                const items = [];
                snapshot.forEach((childSnapshot) => {
                    items.push({
                        id: childSnapshot.key,
                        ...childSnapshot.val()
                    });
                });
                setPantryItems(items);
            } else {
                // Make sure to set empty array when no items exist
                setPantryItems([]);
            }
        };
        
        pantryRef.on('value', handlePantryData);
        
        // Cleanup
        return () => {
            pantryRef.off('value', handlePantryData);
        };
    }, []);

    const handleToggleExpand = () => {
        setExpanded(!expanded);
    };

    const handleToggleItem = (item) => {
        const itemIndex = selectedItems.findIndex(selectedItem => selectedItem.id === item.id);
        
        if (itemIndex === -1) {
            // Add item to selected items
            setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
        } else {
            // If already selected, increase quantity
            const updatedItems = selectedItems.map(selectedItem => 
                selectedItem.id === item.id 
                    ? { ...selectedItem, quantity: (selectedItem.quantity || 1) + 1 } 
                    : selectedItem
            );
            setSelectedItems(updatedItems);
        }
    };

    const handleRemoveItem = (itemId) => {
        // Remove item from selected items
        const updatedItems = selectedItems.filter(item => item.id !== itemId);
        setSelectedItems(updatedItems);
    };

    const handleAddToPantry = async () => {
        if (!newItemName.trim()) return;
        
        setLoading(true);
        const user = auth.currentUser;
        const itemId = uuidv4();
        
        try {
            // Add to ingredients collection
            await firebaseDb.database().ref(`users/${user.uid}/ingredients/${itemId}`).set({
                ingredientName: newItemName.trim(),
                category: newItemCategory,
                notes: newItemNotes.trim()
            });
            
            // Add to pantry
            await firebaseDb.database().ref(`users/${user.uid}/pantry/${itemId}`).set({
                name: newItemName.trim(),
                category: newItemCategory,
                notes: newItemNotes.trim()
            });
            
            // Close dialog
            setAddItemDialogOpen(false);
            
            // Reset form fields
            setNewItemName('');
            setNewItemCategory('Other');
            setNewItemNotes('');
        } catch (error) {
            console.error("Error adding pantry item:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromPantry = async (itemId) => {
        const user = auth.currentUser;
        
        try {
            // Remove from selected items if present
            const updatedSelectedItems = selectedItems.filter(item => item.id !== itemId);
            setSelectedItems(updatedSelectedItems);
            
            // Remove from pantry
            await firebaseDb.database().ref(`users/${user.uid}/pantry/${itemId}`).remove();
            
            // If this was the last item, explicitly update the pantryItems state
            if (pantryItems.length <= 1) {
                setPantryItems([]);
            }
        } catch (error) {
            console.error("Error removing pantry item:", error);
        }
    };

    const handleAddToList = () => {
        if (selectedItems.length === 0) return;
        
        // Format selected items for the shopping list
        const formattedItems = selectedItems.map(item => ({
            ingredientId: item.id,
            ingredientName: item.name,
            category: item.category,
            quantity: item.quantity || 1,
            notes: item.notes || ''
        }));
        
        onItemsSelected(formattedItems);
        setSelectedItems([]);
    };

    // Filter pantry items based on search term
    const filteredItems = pantryItems.filter(item => 
        item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group pantry items by category
    const groupedItems = {};
    filteredItems.forEach(item => {
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
                onClick={handleToggleExpand}
            >
                <Typography variant="subtitle1" fontWeight="medium">
                    Pantry Items
                </Typography>
                <IconButton size="small" sx={{ color: textColor }}>
                    {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </Box>

            <Collapse in={expanded}>
                <Box sx={{ p: 2 }}>
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        mb: 2
                    }}>
                        <TextField
                            placeholder="Search pantry items..."
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ width: isMobile ? '60%' : '40%' }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={() => setAddItemDialogOpen(true)}
                            sx={{
                                color: textColor,
                                borderColor: backgroundColor,
                                '&:hover': {
                                    borderColor: textColor,
                                    backgroundColor: 'rgba(172, 222, 133, 0.1)'
                                }
                            }}
                        >
                            Add to Pantry
                        </Button>
                    </Box>

                    {pantryItems.length === 0 ? (
                        <Typography 
                            sx={{ 
                                textAlign: 'center', 
                                py: 2, 
                                color: '#777',
                                fontStyle: 'italic'
                            }}
                        >
                            No items in your pantry. Add items that you regularly buy.
                        </Typography>
                    ) : (
                        <Box sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {Object.entries(groupedItems).map(([category, items]) => (
                                <Box key={category} sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        {category}
                                    </Typography>
                                    
                                    <Box sx={{ 
                                        display: 'flex', 
                                        flexWrap: 'wrap', 
                                        gap: 0.5 
                                    }}>
                                        {items.map((item) => {
                                            // Check if item is in selected items
                                            const selectedItem = selectedItems.find(si => si.id === item.id);
                                            const isSelected = !!selectedItem;
                                            
                                            return (
                                                <Chip
                                                    key={item.id}
                                                    label={
                                                        <span>
                                                            {isSelected && selectedItem.quantity > 1 && 
                                                                <span style={{ marginRight: '4px' }}>
                                                                    ({selectedItem.quantity})
                                                                </span>
                                                            }
                                                            {item.name}
                                                        </span>
                                                    }
                                                    onClick={() => handleToggleItem(item)}
                                                    onDelete={() => handleRemoveFromPantry(item.id)}
                                                    sx={{
                                                        backgroundColor: isSelected ? backgroundColor : '#f1f1f1',
                                                        color: isSelected ? textColor : 'rgba(0, 0, 0, 0.87)',
                                                        margin: '2px',
                                                        height: 'auto',
                                                        '& .MuiChip-deleteIcon': {
                                                            color: isSelected ? textColor : 'rgba(0, 0, 0, 0.26)'
                                                        }
                                                    }}
                                                    size={isMobile ? "small" : "medium"}
                                                />
                                            );
                                        })}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    )}

                    {selectedItems.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Divider sx={{ mb: 2 }} />
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="subtitle2">
                                    Selected Items:
                                </Typography>
                                
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                                    {selectedItems.map(item => (
                                        <Chip
                                            key={item.id}
                                            label={
                                                <span>
                                                    {item.quantity > 1 && 
                                                        <span style={{ marginRight: '4px' }}>
                                                            ({item.quantity})
                                                        </span>
                                                    }
                                                    {item.name}
                                                </span>
                                            }
                                            onDelete={() => handleRemoveItem(item.id)}
                                            sx={{
                                                backgroundColor: backgroundColor,
                                                color: textColor,
                                                margin: '2px',
                                                '& .MuiChip-deleteIcon': {
                                                    color: textColor
                                                }
                                            }}
                                            size={isMobile ? "small" : "medium"}
                                        />
                                    ))}
                                </Box>
                                
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleAddToList}
                                        sx={{
                                            backgroundColor: backgroundColor,
                                            color: textColor,
                                            '&:hover': {
                                                backgroundColor: backgroundColor,
                                                opacity: 0.9
                                            }
                                        }}
                                    >
                                        Add to List
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Collapse>

            {/* Add to Pantry Dialog - Completely reset on close */}
            <Dialog 
                open={addItemDialogOpen} 
                onClose={() => {
                    if (!loading) {
                        setAddItemDialogOpen(false);
                        setNewItemName('');
                        setNewItemCategory('Other');
                        setNewItemNotes('');
                    }
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ color: textColor }}>
                    Add Item to Pantry
                </DialogTitle>
                
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Item Name"
                            fullWidth
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            required
                            autoFocus
                        />
                        
                        <TextField
                            select
                            label="Category"
                            fullWidth
                            value={newItemCategory}
                            onChange={(e) => setNewItemCategory(e.target.value)}
                            SelectProps={{
                                native: true
                            }}
                        >
                            {CATEGORIES.sort((a, b) => a.name > b.name ? 1 : -1).map((cat) => (
                                <option key={cat.id} value={cat.name}>
                                    {cat.name}
                                </option>
                            ))}
                        </TextField>
                        
                        <TextField
                            label="Notes (optional)"
                            fullWidth
                            value={newItemNotes}
                            onChange={(e) => setNewItemNotes(e.target.value)}
                            multiline
                            rows={2}
                        />
                    </Box>
                </DialogContent>
                
                <DialogActions>
                    <Button 
                        onClick={() => {
                            setAddItemDialogOpen(false);
                            setNewItemName('');
                            setNewItemCategory('Other');
                            setNewItemNotes('');
                        }}
                        sx={{ color: 'text.secondary' }}
                        disabled={loading}
                    >
                        Close
                    </Button>
                    
                    <Button 
                        onClick={handleAddToPantry}
                        disabled={!newItemName.trim() || loading}
                        variant="contained"
                        sx={{
                            backgroundColor: backgroundColor,
                            color: textColor,
                            '&:hover': {
                                backgroundColor: backgroundColor,
                                opacity: 0.9
                            }
                        }}
                    >
                        {loading ? 'Adding...' : 'Add to Pantry'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default PantryItems;